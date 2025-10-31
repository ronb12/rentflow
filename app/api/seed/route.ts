import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await initSchema();
    const orgId = 'org_1';
    const results: any = {};

    // 1. Rent Ledger
    const ledgerId1 = `ledger_${Date.now()}_1`;
    const now = Date.now();
    await query(
      `INSERT OR REPLACE INTO rent_ledger 
       (id, lease_id, invoice_id, transaction_type, amount, due_date, paid_date, 
        payment_method, status, late_fee_amount, notes, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ledgerId1,
        'lease_1',
        'inv_001',
        'rent',
        120000,
        new Date('2024-01-01').getTime(),
        new Date('2024-01-05').getTime(),
        'ach',
        'paid',
        0,
        'Monthly rent payment',
        orgId,
        now,
        now,
      ]
    );
    results.rentLedger = 'created';

    // 2. Late Fee Rules
    const lfrId = `lfr_${Date.now()}_1`;
    await query(
      `INSERT OR REPLACE INTO late_fee_rules 
       (id, lease_id, organization_id, grace_period_days, fee_type, 
        fixed_amount, percentage_amount, max_fee_amount, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [lfrId, null, orgId, 5, 'fixed', 5000, 0, 10000, 1, now, now]
    );
    results.lateFeeRules = 'created';

    // 3. Owner Statements
    const osId = `os_${Date.now()}_1`;
    await query(
      `INSERT OR REPLACE INTO owner_statements 
       (id, owner_id, statement_period_start, statement_period_end, 
        total_collections, total_expenses, net_amount, status, generated_at, 
        organization_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        osId,
        'owner_1',
        new Date('2024-01-01').getTime(),
        new Date('2024-01-31').getTime(),
        240000,
        50000,
        190000,
        'generated',
        now,
        orgId,
        now,
      ]
    );
    results.ownerStatements = 'created';

    // 4. Templates
    const tplId = `tpl_${Date.now()}_1`;
    await query(
      `INSERT OR REPLACE INTO document_templates 
       (id, name, category, version, template_content, merge_fields, is_active, 
        organization_id, created_by, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tplId,
        'Residential Lease Agreement',
        'lease',
        1,
        '<h1>RESIDENTIAL LEASE AGREEMENT</h1><p>Property: {{property_address}}</p><p>Tenant: {{tenant_name}}</p><p>Rent: {{rent_amount}}</p>',
        JSON.stringify([
          { name: 'tenant_name', type: 'text' },
          { name: 'property_address', type: 'text' },
          { name: 'rent_amount', type: 'currency' },
        ]),
        1,
        orgId,
        'system',
        now,
        now,
      ]
    );
    results.templates = 'created';

    // 5. Vendors
    const vendorId = `vendor_${Date.now()}_1`;
    await query(
      `INSERT OR REPLACE INTO vendors 
       (id, name, contact_name, email, phone, service_type, hourly_rate, rating, 
        is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        vendorId,
        'ABC Plumbing Services',
        'John Smith',
        'john@abcplumbing.com',
        '555-0101',
        'plumbing',
        7500,
        4.5,
        1,
        orgId,
        now,
        now,
      ]
    );
    results.vendors = 'created';

    // 6. Payment Methods
    const pmId = `pm_${Date.now()}_1`;
    await query(
      `INSERT OR REPLACE INTO payment_methods 
       (id, tenant_id, type, stripe_payment_method_id, bank_account_last4, 
        bank_account_type, is_default, is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pmId, 'tenant_1', 'ach', null, '1234', 'checking', 1, 1, orgId, now, now]
    );
    results.paymentMethods = 'created';

    // 7. Payment Schedules
    const psId = `ps_${Date.now()}_1`;
    await query(
      `INSERT OR REPLACE INTO payment_schedules 
       (id, lease_id, rent_amount, due_day, start_date, end_date, 
        is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        psId,
        'lease_1',
        120000,
        1,
        new Date('2024-01-01').getTime(),
        new Date('2024-12-31').getTime(),
        1,
        orgId,
        now,
        now,
      ]
    );
    results.paymentSchedules = 'created';

    // 8. Dunning Settings
    const dsId = `ds_${Date.now()}_1`;
    await query(
      `INSERT OR REPLACE INTO dunning_settings 
       (id, organization_id, first_notice_days, second_notice_days, third_notice_days, 
        final_notice_days, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dsId, orgId, 3, 7, 14, 30, 1, now, now]
    );
    results.dunningSettings = 'created';

    return NextResponse.json({
      success: true,
      message: 'Sample data seeded successfully',
      results,
    });
  } catch (error: any) {
    console.error('Error seeding data:', error);
    return NextResponse.json(
      { error: 'Failed to seed data', details: error.message },
      { status: 500 }
    );
  }
}

