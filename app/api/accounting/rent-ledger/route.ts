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
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM rent_ledger WHERE organization_id = ?`;
    const params: any[] = [organizationId];

    if (leaseId) {
      sql += ` AND lease_id = ?`;
      params.push(leaseId);
    }

    if (status) {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY due_date DESC, created_at DESC`;

    const rows = await query(sql, params);

    const transactions = rows.map((row: any) => ({
      id: row.id,
      leaseId: row.lease_id,
      invoiceId: row.invoice_id,
      transactionType: row.transaction_type,
      amount: row.amount,
      dueDate: row.due_date,
      paidDate: row.paid_date,
      paymentMethod: row.payment_method,
      status: row.status,
      lateFeeAmount: row.late_fee_amount || 0,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching rent ledger:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rent ledger' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const id = `ledger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO rent_ledger 
       (id, lease_id, invoice_id, transaction_type, amount, due_date, paid_date, 
        payment_method, status, late_fee_amount, notes, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.leaseId || null,
        data.invoiceId || null,
        data.transactionType || 'rent',
        data.amount || 0,
        data.dueDate ? new Date(data.dueDate).getTime() : null,
        data.paidDate ? new Date(data.paidDate).getTime() : null,
        data.paymentMethod || null,
        data.status || 'pending',
        data.lateFeeAmount || 0,
        data.notes || null,
        data.organizationId || 'org_1',
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error('Error creating rent ledger entry:', error);
    return NextResponse.json(
      { error: 'Failed to create rent ledger entry' },
      { status: 500 }
    );
  }
}

