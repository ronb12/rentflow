import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// Calculate late fees for an invoice
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { invoiceId, leaseId, dueDate, amount } = data;

    if (!leaseId || !dueDate || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get late fee rule for this lease or organization
    const ruleRows = await query(
      `SELECT * FROM late_fee_rules 
       WHERE (lease_id = ? OR lease_id IS NULL) 
       AND is_active = 1 
       AND organization_id = ? 
       ORDER BY lease_id DESC LIMIT 1`,
      [leaseId, data.organizationId || 'org_1']
    );

    if (ruleRows.length === 0) {
      return NextResponse.json({ lateFeeAmount: 0, appliedRule: null });
    }

    const rule = ruleRows[0];
    const due = new Date(dueDate);
    const now = new Date();
    const daysLate = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    const gracePeriod = Number(rule.grace_period_days ?? 5);

    if (daysLate <= gracePeriod) {
      return NextResponse.json({ lateFeeAmount: 0, appliedRule: rule, daysLate });
    }

    let lateFee: number = 0;

    if (rule.fee_type === 'fixed') {
      lateFee = Number(rule.fixed_amount ?? 0);
    } else if (rule.fee_type === 'percentage') {
      const percentage = Number(rule.percentage_amount ?? 0) / 100;
      lateFee = Math.round(Number(amount) * percentage);
      const maxFee = rule.max_fee_amount != null ? Number(rule.max_fee_amount) : null;
      if (maxFee != null && lateFee > maxFee) {
        lateFee = maxFee;
      }
    }

    // Apply daily compounding if configured
    const effectiveDaysLate = daysLate - gracePeriod;

    return NextResponse.json({
      lateFeeAmount: lateFee,
      appliedRule: rule,
      daysLate,
      effectiveDaysLate,
      gracePeriod,
    });
  } catch (error) {
    console.error('Error calculating late fee:', error);
    return NextResponse.json(
      { error: 'Failed to calculate late fee' },
      { status: 500 }
    );
  }
}

// GET /api/accounting/late-fees - Get late fee rules
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const leaseId = searchParams.get('leaseId');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM late_fee_rules WHERE organization_id = ? AND is_active = 1`;
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

