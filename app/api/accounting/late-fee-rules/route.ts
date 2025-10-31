import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const leaseId = searchParams.get('leaseId');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM late_fee_rules WHERE organization_id = ?`;
    const params: any[] = [organizationId];

    if (leaseId) {
      sql += ` AND (lease_id = ? OR lease_id IS NULL)`;
      params.push(leaseId);
    }

    sql += ` ORDER BY lease_id DESC`;
    const rows = await query(sql, params);

    const rules = rows.map((row: any) => ({
      id: row.id,
      leaseId: row.lease_id,
      gracePeriodDays: row.grace_period_days || 5,
      feeType: row.fee_type || 'fixed',
      fixedAmount: row.fixed_amount || 0,
      percentageAmount: row.percentage_amount || 0,
      maxFeeAmount: row.max_fee_amount,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error fetching late fee rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch late fee rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const id = `lfr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO late_fee_rules 
       (id, lease_id, organization_id, grace_period_days, fee_type, 
        fixed_amount, percentage_amount, max_fee_amount, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.leaseId || null,
        data.organizationId || 'org_1',
        data.gracePeriodDays || 5,
        data.feeType || 'fixed',
        data.fixedAmount || 0,
        data.percentageAmount || 0,
        data.maxFeeAmount || null,
        data.isActive !== false ? 1 : 0,
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error('Error creating late fee rule:', error);
    return NextResponse.json(
      { error: 'Failed to create late fee rule' },
      { status: 500 }
    );
  }
}
