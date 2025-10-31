import { NextRequest, NextResponse } from 'next/server';
import { initSchema, query } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// PATCH /api/payment-schedules/change-requests/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureSchema();
    const { id } = await params;
    const data = await request.json();
    const { action, managerNote, organizationId = 'org_1' } = data;

    if (!['approve', 'deny'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const now = Date.now();

    // Load request
    const reqRows = await query(`SELECT * FROM schedule_change_requests WHERE id = ? AND organization_id = ?`, [id, organizationId]);
    if (reqRows.length === 0) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    const reqRow: any = reqRows[0];

    if (action === 'deny') {
      await query(`UPDATE schedule_change_requests SET status = 'denied', manager_note = ?, updated_at = ? WHERE id = ?`, [managerNote || null, now, id]);
      return NextResponse.json({ id, status: 'denied' });
    }

    // Approve: update schedule for next cycle
    const schedRows = await query(`SELECT * FROM payment_schedules WHERE id = ? AND organization_id = ?`, [reqRow.schedule_id, organizationId]);
    if (schedRows.length === 0) return NextResponse.json({ error: 'Schedule not found' }, { status: 404 });
    const sched: any = schedRows[0];

    const newDueDay = reqRow.requested_due_day ?? sched.due_day;
    const newStartDate = reqRow.requested_start_date ?? sched.start_date;

    await query(`UPDATE payment_schedules SET due_day = ?, start_date = ?, updated_at = ? WHERE id = ?`, [newDueDay, newStartDate, now, reqRow.schedule_id]);
    await query(`UPDATE schedule_change_requests SET status = 'approved', manager_note = ?, effective_date = ?, updated_at = ? WHERE id = ?`, [managerNote || null, now, now, id]);

    // Fire-and-forget notification (best-effort)
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/notifications/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        to: 'tenant@example.com', // placeholder
        subject: 'Payment Schedule Change Approved',
        body: `Your payment schedule change has been approved. New due day: ${newDueDay}.`,
      }) });
    } catch {}

    // Placeholder for Stripe/ACH alignment: would update billing cycle anchors for autopay
    // This is environment-dependent and typically done via Stripe API using subscription schedule updates.

    return NextResponse.json({ id, status: 'approved' });
  } catch (error) {
    console.error('Error updating change request:', error);
    return NextResponse.json({ error: 'Failed to update change request' }, { status: 500 });
  }
}


