import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/payment-schedules - List payment schedules
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const leaseId = searchParams.get('leaseId');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM payment_schedules WHERE organization_id = ?`;
    const params: any[] = [organizationId];

    if (leaseId) {
      sql += ` AND lease_id = ?`;
      params.push(leaseId);
    }

    sql += ` ORDER BY start_date DESC`;

    const rows = await query(sql, params);

    // Normalize and de-duplicate schedules by a composite key
    const normalized = rows.map((row: any) => ({
      id: row.id,
      leaseId: row.lease_id,
      rentAmount: Number(row.rent_amount || 0),
      dueDay: Number(row.due_day || 1),
      startDate: row.start_date,
      endDate: row.end_date,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    const dedupedMap = new Map<string, typeof normalized[number]>();
    for (const s of normalized) {
      const key = [s.leaseId, s.rentAmount, s.dueDay, s.startDate ?? 'null', s.endDate ?? 'null'].join('|');
      const existing = dedupedMap.get(key);
      if (!existing || (Number(s.updatedAt || 0) > Number(existing.updatedAt || 0))) {
        dedupedMap.set(key, s);
      }
    }
    const schedules = Array.from(dedupedMap.values());

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching payment schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment schedules' },
      { status: 500 }
    );
  }
}

// POST /api/payment-schedules - Create payment schedule
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { leaseId, rentAmount, organizationId = 'org_1' } = data;

    if (!leaseId || !rentAmount) {
      return NextResponse.json(
        { error: 'Lease ID and rent amount are required' },
        { status: 400 }
      );
    }

    const id = `ps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO payment_schedules 
       (id, lease_id, rent_amount, due_day, start_date, end_date, 
        is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        leaseId,
        Math.round(rentAmount * 100),
        data.dueDay || 1,
        data.startDate ? new Date(data.startDate).getTime() : now,
        data.endDate ? new Date(data.endDate).getTime() : null,
        data.isActive !== false ? 1 : 0,
        organizationId,
        now,
        now,
      ]
    );

    return NextResponse.json({
      id,
      leaseId,
      rentAmount,
      dueDay: data.dueDay || 1,
      startDate: data.startDate,
      endDate: data.endDate,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating payment schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create payment schedule' },
      { status: 500 }
    );
  }
}

