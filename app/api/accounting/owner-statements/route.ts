import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/accounting/owner-statements - List owner statements
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM owner_statements WHERE organization_id = ?`;
    const params: any[] = [organizationId];

    if (ownerId) {
      sql += ` AND owner_id = ?`;
      params.push(ownerId);
    }

    sql += ` ORDER BY statement_period_start DESC`;

    const rows = await query(sql, params);

    const statements = rows.map((row: any) => ({
      id: row.id,
      ownerId: row.owner_id,
      statementPeriodStart: row.statement_period_start,
      statementPeriodEnd: row.statement_period_end,
      totalCollections: row.total_collections || 0,
      totalExpenses: row.total_expenses || 0,
      netAmount: row.net_amount || 0,
      status: row.status,
      generatedAt: row.generated_at,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ statements });
  } catch (error) {
    console.error('Error fetching owner statements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch owner statements' },
      { status: 500 }
    );
  }
}

// POST /api/accounting/owner-statements - Generate owner statement
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { ownerId, periodStart, periodEnd, organizationId = 'org_1' } = data;

    if (!ownerId || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Missing required fields: ownerId, periodStart, periodEnd' },
        { status: 400 }
      );
    }

    const start = new Date(periodStart).getTime();
    const end = new Date(periodEnd).getTime();

    // Calculate collections from rent_ledger
    const collectionsRows = await query(
      `SELECT COALESCE(SUM(amount), 0) as total 
       FROM rent_ledger 
       WHERE organization_id = ? 
       AND transaction_type = 'rent' 
       AND status = 'paid' 
       AND paid_date >= ? 
       AND paid_date <= ?`,
      [organizationId, start, end]
    );
    const totalCollections = collectionsRows[0]?.total || 0;

    // Calculate expenses from work_orders (maintenance costs)
    const expensesRows = await query(
      `SELECT COALESCE(SUM(actual_cost), 0) as total 
       FROM work_orders 
       WHERE organization_id = ? 
       AND status = 'completed' 
       AND updated_at >= ? 
       AND updated_at <= ?`,
      [organizationId, start, end]
    );
    const totalExpenses = expensesRows[0]?.total || 0;

    const netAmount = totalCollections - totalExpenses;

    const id = `stmt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO owner_statements 
       (id, owner_id, statement_period_start, statement_period_end, 
        total_collections, total_expenses, net_amount, status, 
        generated_at, organization_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        ownerId,
        start,
        end,
        totalCollections,
        totalExpenses,
        netAmount,
        'generated',
        now,
        organizationId,
        now,
      ]
    );

    return NextResponse.json({
      id,
      ownerId,
      statementPeriodStart: start,
      statementPeriodEnd: end,
      totalCollections,
      totalExpenses,
      netAmount,
      status: 'generated',
      generatedAt: now,
    });
  } catch (error) {
    console.error('Error generating owner statement:', error);
    return NextResponse.json(
      { error: 'Failed to generate owner statement' },
      { status: 500 }
    );
  }
}

