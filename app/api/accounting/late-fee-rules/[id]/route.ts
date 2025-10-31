import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// PUT /api/accounting/late-fee-rules/[id] - Update late fee rule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id } = await params;
    const data = await request.json();
    const now = Date.now();

    await query(
      `UPDATE late_fee_rules 
       SET lease_id = ?, grace_period_days = ?, fee_type = ?, 
           fixed_amount = ?, percentage_amount = ?, max_fee_amount = ?, 
           is_active = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.leaseId || null,
        data.gracePeriodDays || 5,
        data.feeType || 'fixed',
        data.fixedAmount || 0,
        data.percentageAmount || 0,
        data.maxFeeAmount || null,
        data.isActive !== false ? 1 : 0,
        now,
        id,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error('Error updating late fee rule:', error);
    return NextResponse.json(
      { error: 'Failed to update late fee rule' },
      { status: 500 }
    );
  }
}

