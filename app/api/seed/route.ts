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
        '<style>body{font-family:ui-sans-serif,system-ui,-apple-system} h1,h2{margin:12px 0} p{margin:8px 0;line-height:1.5} .section{margin:16px 0} .signature{margin-top:24px;padding-top:12px;border-top:1px solid #ddd;display:flex;gap:24px} .sig-block{flex:1}</style>'+
        '<h1>RESIDENTIAL LEASE AGREEMENT</h1>'+
        '<div class="section"><strong>Property:</strong> {{property_address}}</div>'+
        '<div class="section"><strong>Tenant:</strong> {{tenant_name}} &nbsp; <strong>Email:</strong> {{tenant_email}}</div>'+
        '<div class="section"><strong>Monthly Rent:</strong> {{rent_amount}} &nbsp; <strong>Due Date:</strong> {{due_date}}</div>'+
        '<h2>1. Term</h2><p>The term commences on {{date}} and continues month-to-month unless terminated per this Agreement.</p>'+
        '<h2>2. Rent</h2><p>Tenant agrees to pay {{rent_amount}} per month on or before {{due_date}}. Late fees may apply as permitted by law.</p>'+
        '<h2>3. Use and Occupancy</h2><p>The premises shall be used exclusively as a private residence by the Tenant and occupants listed on the application.</p>'+
        '<h2>4. Maintenance and Repairs</h2><p>Tenant shall keep the premises clean and sanitary and promptly notify Landlord of needed repairs.</p>'+
        '<h2>5. Utilities</h2><p>Unless otherwise stated, Tenant is responsible for payment of utilities and services for the Premises.</p>'+
        '<h2>6. Rules</h2><p>Tenant shall comply with all house rules, HOA rules (if any), and local ordinances.</p>'+
        '<h2>7. Entry</h2><p>Landlord may enter the Premises for inspection, repairs, or to show to prospective tenants with reasonable notice.</p>'+
        '<h2>8. Default</h2><p>Failure to pay rent or comply with this Agreement may result in termination as permitted by law.</p>'+
        '<h2>9. Entire Agreement</h2><p>This document constitutes the entire agreement and supersedes prior understandings.</p>'+
        '<div class="signature">'+
        '  <div class="sig-block"><strong>Landlord/Manager</strong><p>Printed Name: ______________________</p><p>Signature: __________________________</p><p>Date: _____________</p></div>'+
        '  <div class="sig-block"><strong>Tenant</strong><p>Printed Name: {{tenant_name}}</p><p>Signature: __________________________</p><p>Date: _____________</p></div>'+
        '</div>',
        JSON.stringify([
          { name: 'tenant_name', type: 'text' },
          { name: 'property_address', type: 'text' },
          { name: 'rent_amount', type: 'currency' },
          { name: 'tenant_email', type: 'text' },
          { name: 'due_date', type: 'text' },
        ]),
        1,
        orgId,
        'system',
        now,
        now,
      ]
    );
    results.templates = 'created';

    // Optional: Insert a second, explicitly labeled full template for testing
    const tplFullId = `tpl_${Date.now()}_full`;
    await query(
      `INSERT OR REPLACE INTO document_templates 
       (id, name, category, version, template_content, merge_fields, is_active, 
        organization_id, created_by, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tplFullId,
        'Residential Lease Agreement (Full)',
        'lease',
        1,
        '<style>body{font-family:ui-sans-serif,system-ui,-apple-system} h1,h2{margin:12px 0} p{margin:8px 0;line-height:1.5} .section{margin:16px 0} .signature{margin-top:24px;padding-top:12px;border-top:1px solid #ddd;display:flex;gap:24px} .sig-block{flex:1}</style>'+
        '<h1>RESIDENTIAL LEASE AGREEMENT (FULL)</h1>'+
        '<div class="section"><strong>Property:</strong> {{property_address}}</div>'+
        '<div class="section"><strong>Tenant:</strong> {{tenant_name}} ({{tenant_email}})</div>'+
        '<div class="section"><strong>Monthly Rent:</strong> {{rent_amount}} — <strong>Due:</strong> {{due_date}}</div>'+
        '<h2>1. Parties</h2><p>This Agreement is between Landlord and Tenant listed herein.</p>'+
        '<h2>2. Premises</h2><p>The Premises at {{property_address}} is leased to Tenant.</p>'+
        '<h2>3. Term</h2><p>Start: {{date}}. Renewal and termination by applicable statute and terms below.</p>'+
        '<h2>4. Rent; Fees</h2><p>Rent is {{rent_amount}} monthly, due {{due_date}}. Late fees may apply per policy.</p>'+
        '<h2>5. Security Deposit</h2><p>Held in accordance with state law and returned less lawful deductions.</p>'+
        '<h2>6. Use</h2><p>Residential use only; no unlawful activity; compliance with rules/ordinances.</p>'+
        '<h2>7. Maintenance</h2><p>Tenant responsibilities and Landlord obligations are defined herein.</p>'+
        '<h2>8. Utilities</h2><p>Unless stated otherwise, Tenant pays utilities.</p>'+
        '<h2>9. Entry</h2><p>Entry with notice for inspection, repairs, or showing.</p>'+
        '<h2>10. Default</h2><p>Nonpayment or breach may lead to termination as permitted by law.</p>'+
        '<h2>11. Miscellaneous</h2><p>Severability; entire agreement; amendments in writing.</p>'+
        '<div class="signature">'+
        '  <div class="sig-block"><strong>Landlord/Manager</strong><p>Printed Name: ______________________</p><p>Signature: __________________________</p><p>Date: _____________</p></div>'+
        '  <div class="sig-block"><strong>Tenant</strong><p>Printed Name: {{tenant_name}}</p><p>Signature: __________________________</p><p>Date: _____________</p></div>'+
        '</div>',
        JSON.stringify([
          { name: 'tenant_name', type: 'text' },
          { name: 'property_address', type: 'text' },
          { name: 'rent_amount', type: 'currency' },
          { name: 'tenant_email', type: 'text' },
          { name: 'due_date', type: 'text' },
        ]),
        1,
        orgId,
        'system',
        now,
        now,
      ]
    );

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

    // 7. Payment Schedules — reset org and insert deterministic IDs to avoid duplicates
    await query(`DELETE FROM payment_schedules WHERE organization_id = ?`, [orgId]);
    const ps1 = `ps_lease1_main`;
    await query(
      `INSERT OR REPLACE INTO payment_schedules 
       (id, lease_id, rent_amount, due_day, start_date, end_date, 
        is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ps1,
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

    const ps2 = `ps_lease1_installment`;
    await query(
      `INSERT OR REPLACE INTO payment_schedules 
       (id, lease_id, rent_amount, due_day, start_date, end_date, 
        is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ps2,
        'lease_1',
        95000,
        15,
        new Date('2024-02-01').getTime(),
        new Date('2024-06-30').getTime(),
        1,
        orgId,
        now,
        now,
      ]
    );

    const ps3 = `ps_lease2_ongoing`;
    await query(
      `INSERT OR REPLACE INTO payment_schedules 
       (id, lease_id, rent_amount, due_day, start_date, end_date, 
        is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        ps3,
        'lease_2',
        145000,
        5,
        new Date('2024-03-01').getTime(),
        null,
        1,
        orgId,
        now,
        now,
      ]
    );
    results.paymentSchedules = 'created 3';

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

