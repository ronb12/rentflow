import { NextRequest, NextResponse } from 'next/server';
import { initSchema, query } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// POST /api/payment-schedules/weekly-plan
// body: { leaseId: string, monthlyRent: number, startDate?: string (YYYY-MM-DD), organizationId?: string }
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { leaseId, monthlyRent, startDate, organizationId = 'org_1' } = data;

    if (!leaseId || !monthlyRent) {
      return NextResponse.json({ error: 'leaseId and monthlyRent are required' }, { status: 400 });
    }

    const now = Date.now();
    const monthStart = startDate ? new Date(startDate) : new Date();
    monthStart.setDate(1);
    monthStart.setHours(0,0,0,0);

    // 4 weekly installments: roughly 1st, 8th, 15th, 22nd of each month
    const dueDays = [1, 8, 15, 22];
    const cents = Math.round(Number(monthlyRent) * 100);
    const base = Math.floor(cents / 4);
    const remainder = cents - (base * 4);
    const amounts = [base, base, base, base + remainder];

    // Remove existing weekly plan for this lease/org with those due days to avoid duplication
    await query(`DELETE FROM payment_schedules WHERE lease_id = ? AND organization_id = ? AND due_day IN (1,8,15,22)`, [leaseId, organizationId]);

    const created: any[] = [];
    for (let i = 0; i < 4; i++) {
      const id = `ps_${leaseId}_wk${i+1}_${now}`;
      const startTs = monthStart.getTime();
      await query(
        `INSERT INTO payment_schedules (id, lease_id, rent_amount, due_day, start_date, end_date, is_active, organization_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)`,
        [id, leaseId, amounts[i], dueDays[i], startTs, null, organizationId, now, now]
      );
      created.push({ id, leaseId, amount: amounts[i], dueDay: dueDays[i] });
    }

    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('Error creating weekly plan:', error);
    return NextResponse.json({ error: 'Failed to create weekly plan' }, { status: 500 });
  }
}


