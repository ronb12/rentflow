import { NextRequest, NextResponse } from 'next/server';
import { initSchema, query } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/payment-schedules/change-requests?status=pending
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT scr.*, t.first_name, t.last_name FROM schedule_change_requests scr 
               LEFT JOIN tenants t ON t.id = scr.tenant_id 
               WHERE scr.organization_id = ?`;
    const params: any[] = [organizationId];
    if (status) {
      sql += ` AND scr.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY scr.created_at DESC`;

    const rows = await query(sql, params);
    const requests = rows.map((r: any) => ({
      ...r,
      tenant_full_name: [r.first_name, r.last_name].filter(Boolean).join(' ').trim() || null,
    }));
    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching change requests:', error);
    return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 });
  }
}

// POST /api/payment-schedules/change-requests
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { scheduleId, tenantId, requestedDueDay, requestedStartDate, reason, organizationId = 'org_1' } = data;

    if (!scheduleId || (!requestedDueDay && !requestedStartDate)) {
      return NextResponse.json({ error: 'scheduleId and at least one change are required' }, { status: 400 });
    }

    const id = `scr_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = Date.now();
    await query(
      `INSERT INTO schedule_change_requests 
       (id, schedule_id, tenant_id, requested_due_day, requested_start_date, reason, status, organization_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
      [id, scheduleId, tenantId || null, requestedDueDay || null, requestedStartDate ? new Date(requestedStartDate).getTime() : null, reason || null, organizationId, now, now]
    );

    return NextResponse.json({ id, status: 'pending' });
  } catch (error) {
    console.error('Error creating change request:', error);
    return NextResponse.json({ error: 'Failed to create change request' }, { status: 500 });
  }
}


