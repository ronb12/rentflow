import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/payment-methods - List payment methods
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM payment_methods WHERE organization_id = ?`;
    const params: any[] = [organizationId];

    if (tenantId) {
      sql += ` AND tenant_id = ?`;
      params.push(tenantId);
    }

    sql += ` ORDER BY is_default DESC, created_at DESC`;

    const rows = await query(sql, params);

    const paymentMethods = rows.map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      type: row.type,
      stripePaymentMethodId: row.stripe_payment_method_id,
      bankAccountLast4: row.bank_account_last4,
      bankAccountType: row.bank_account_type,
      isDefault: row.is_default === 1,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

// POST /api/payment-methods - Add payment method
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { tenantId, type, organizationId = 'org_1' } = data;

    if (!tenantId || !type) {
      return NextResponse.json(
        { error: 'Tenant ID and payment type are required' },
        { status: 400 }
      );
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await query(
        `UPDATE payment_methods SET is_default = 0 
         WHERE tenant_id = ? AND organization_id = ?`,
        [tenantId, organizationId]
      );
    }

    const id = `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO payment_methods 
       (id, tenant_id, type, stripe_payment_method_id, bank_account_last4, 
        bank_account_type, is_default, is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        tenantId,
        type,
        data.stripePaymentMethodId || null,
        data.bankAccountLast4 || null,
        data.bankAccountType || null,
        data.isDefault === true ? 1 : 0,
        data.isActive !== false ? 1 : 0,
        organizationId,
        now,
        now,
      ]
    );

    return NextResponse.json({
      id,
      tenantId,
      type,
      stripePaymentMethodId: data.stripePaymentMethodId,
      bankAccountLast4: data.bankAccountLast4,
      bankAccountType: data.bankAccountType,
      isDefault: data.isDefault || false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
}

