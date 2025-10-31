import { config } from 'dotenv';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
config({ path: join(__dirname, '../.env.local') });

// Import after env vars are loaded
const { query, initSchema } = await import('../lib/db');

// Check if database URL is set
if (!process.env.TURSO_DATABASE_URL) {
  console.log('⚠️  TURSO_DATABASE_URL not set. Using in-memory database for seeding.');
  console.log('   Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local to use Turso database.\n');
}

async function seedAllFeatures() {
  console.log('🌱 Seeding all new features with sample data...\n');

  try {
    await initSchema();
    console.log('✅ Database schema initialized\n');

    const orgId = 'org_1';

    // 1. ACCOUNTING - Rent Ledger Entries
    console.log('📊 Seeding Rent Ledger...');
    const ledgerEntries = [
      {
        id: `ledger_${Date.now()}_1`,
        lease_id: 'lease_1',
        invoice_id: 'inv_001',
        transaction_type: 'rent',
        amount: 120000, // $1200
        due_date: new Date('2024-01-01').getTime(),
        paid_date: new Date('2024-01-05').getTime(),
        payment_method: 'ach',
        status: 'paid',
        late_fee_amount: 0,
        notes: 'Monthly rent payment',
      },
      {
        id: `ledger_${Date.now()}_2`,
        lease_id: 'lease_1',
        invoice_id: 'inv_002',
        transaction_type: 'rent',
        amount: 120000,
        due_date: new Date('2024-02-01').getTime(),
        paid_date: null,
        payment_method: null,
        status: 'pending',
        late_fee_amount: 0,
        notes: 'February rent',
      },
      {
        id: `ledger_${Date.now()}_3`,
        lease_id: 'lease_2',
        invoice_id: 'inv_003',
        transaction_type: 'rent',
        amount: 150000, // $1500
        due_date: new Date('2024-01-01').getTime(),
        paid_date: new Date('2024-01-10').getTime(),
        payment_method: 'card',
        status: 'paid',
        late_fee_amount: 5000, // $50 late fee
        notes: 'Late payment with fee',
      },
    ];

    for (const entry of ledgerEntries) {
      const now = Date.now();
      await query(
        `INSERT OR REPLACE INTO rent_ledger 
         (id, lease_id, invoice_id, transaction_type, amount, due_date, paid_date, 
          payment_method, status, late_fee_amount, notes, organization_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          entry.id,
          entry.lease_id,
          entry.invoice_id,
          entry.transaction_type,
          entry.amount,
          entry.due_date,
          entry.paid_date,
          entry.payment_method,
          entry.status,
          entry.late_fee_amount,
          entry.notes,
          orgId,
          now,
          now,
        ]
      );
    }
    console.log(`   ✅ Created ${ledgerEntries.length} rent ledger entries`);

    // 2. ACCOUNTING - Late Fee Rules
    console.log('\n💰 Seeding Late Fee Rules...');
    const lateFeeRules = [
      {
        id: `lfr_${Date.now()}_1`,
        lease_id: null,
        grace_period_days: 5,
        fee_type: 'fixed',
        fixed_amount: 5000, // $50
        percentage_amount: 0,
        max_fee_amount: 10000, // $100 max
        is_active: 1,
      },
      {
        id: `lfr_${Date.now()}_2`,
        lease_id: 'lease_1',
        grace_period_days: 3,
        fee_type: 'percentage',
        fixed_amount: 0,
        percentage_amount: 5, // 5% of rent
        max_fee_amount: null,
        is_active: 1,
      },
    ];

    for (const rule of lateFeeRules) {
      const now = Date.now();
      await query(
        `INSERT OR REPLACE INTO late_fee_rules 
         (id, lease_id, organization_id, grace_period_days, fee_type, 
          fixed_amount, percentage_amount, max_fee_amount, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          rule.id,
          rule.lease_id,
          orgId,
          rule.grace_period_days,
          rule.fee_type,
          rule.fixed_amount,
          rule.percentage_amount,
          rule.max_fee_amount,
          rule.is_active,
          now,
          now,
        ]
      );
    }
    console.log(`   ✅ Created ${lateFeeRules.length} late fee rules`);

    // 3. ACCOUNTING - Owner Statements
    console.log('\n📄 Seeding Owner Statements...');
    const ownerStatements = [
      {
        id: `os_${Date.now()}_1`,
        owner_id: 'owner_1',
        statement_period_start: new Date('2024-01-01').getTime(),
        statement_period_end: new Date('2024-01-31').getTime(),
        total_collections: 240000, // $2400
        total_expenses: 50000, // $500
        net_amount: 190000, // $1900
        status: 'generated',
        generated_at: Date.now(),
      },
    ];

    for (const stmt of ownerStatements) {
      const now = Date.now();
      await query(
        `INSERT OR REPLACE INTO owner_statements 
         (id, owner_id, statement_period_start, statement_period_end, 
          total_collections, total_expenses, net_amount, status, generated_at, 
          organization_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          stmt.id,
          stmt.owner_id,
          stmt.statement_period_start,
          stmt.statement_period_end,
          stmt.total_collections,
          stmt.total_expenses,
          stmt.net_amount,
          stmt.status,
          stmt.generated_at,
          orgId,
          now,
        ]
      );
    }
    console.log(`   ✅ Created ${ownerStatements.length} owner statements`);

    // 4. TEMPLATES - Document Templates
    console.log('\n📝 Seeding Document Templates...');
    const templates = [
      {
        id: `tpl_${Date.now()}_1`,
        name: 'Residential Lease Agreement',
        category: 'lease',
        version: 1,
        template_content: `
<h1>RESIDENTIAL LEASE AGREEMENT</h1>
<p>This lease agreement is entered into on {{date}} between {{company_name}} (Landlord) and {{tenant_name}} (Tenant).</p>
<h2>Property</h2>
<p>Property Address: {{property_address}}</p>
<h2>Terms</h2>
<p>Monthly Rent: {{rent_amount}}</p>
<p>Due Date: {{due_date}}</p>
<p>Lease Term: 12 months</p>
<h2>Signatures</h2>
<p>Landlord: ___________________</p>
<p>Tenant: ___________________</p>
        `.trim(),
        merge_fields: JSON.stringify([
          { name: 'tenant_name', type: 'text' },
          { name: 'property_address', type: 'text' },
          { name: 'rent_amount', type: 'currency' },
          { name: 'due_date', type: 'date' },
          { name: 'company_name', type: 'text' },
          { name: 'date', type: 'date' },
        ]),
        is_active: 1,
      },
      {
        id: `tpl_${Date.now()}_2`,
        name: 'Move-In Checklist',
        category: 'checklist',
        version: 1,
        template_content: `
<h1>MOVE-IN CHECKLIST</h1>
<p>Property: {{property_address}}</p>
<p>Tenant: {{tenant_name}}</p>
<p>Move-In Date: {{move_in_date}}</p>
<h2>Condition Report</h2>
<ul>
<li>Kitchen appliances: [ ]</li>
<li>HVAC system: [ ]</li>
<li>Plumbing: [ ]</li>
<li>Windows: [ ]</li>
</ul>
        `.trim(),
        merge_fields: JSON.stringify([
          { name: 'tenant_name', type: 'text' },
          { name: 'property_address', type: 'text' },
          { name: 'move_in_date', type: 'date' },
        ]),
        is_active: 1,
      },
    ];

    for (const tpl of templates) {
      const now = Date.now();
      await query(
        `INSERT OR REPLACE INTO document_templates 
         (id, name, category, version, template_content, merge_fields, is_active, 
          organization_id, created_by, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tpl.id,
          tpl.name,
          tpl.category,
          tpl.version,
          tpl.template_content,
          tpl.merge_fields,
          tpl.is_active,
          orgId,
          'system',
          now,
          now,
        ]
      );
    }
    console.log(`   ✅ Created ${templates.length} document templates`);

    // 5. VENDORS - Vendor Records
    console.log('\n🔧 Seeding Vendors...');
    const vendors = [
      {
        id: `vendor_${Date.now()}_1`,
        name: 'ABC Plumbing Services',
        contact_name: 'John Smith',
        email: 'john@abcplumbing.com',
        phone: '555-0101',
        service_type: 'plumbing',
        hourly_rate: 7500, // $75/hr
        rating: 4.5,
        is_active: 1,
      },
      {
        id: `vendor_${Date.now()}_2`,
        name: 'Quick Fix HVAC',
        contact_name: 'Jane Doe',
        email: 'jane@quickfixhvac.com',
        phone: '555-0202',
        service_type: 'hvac',
        hourly_rate: 10000, // $100/hr
        rating: 4.8,
        is_active: 1,
      },
      {
        id: `vendor_${Date.now()}_3`,
        name: 'Electrical Solutions Inc',
        contact_name: 'Bob Johnson',
        email: 'bob@electricalsolutions.com',
        phone: '555-0303',
        service_type: 'electrical',
        hourly_rate: 9000, // $90/hr
        rating: 4.7,
        is_active: 1,
      },
    ];

    for (const vendor of vendors) {
      const now = Date.now();
      await query(
        `INSERT OR REPLACE INTO vendors 
         (id, name, contact_name, email, phone, service_type, hourly_rate, rating, 
          is_active, organization_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          vendor.id,
          vendor.name,
          vendor.contact_name,
          vendor.email,
          vendor.phone,
          vendor.service_type,
          vendor.hourly_rate,
          vendor.rating,
          vendor.is_active,
          orgId,
          now,
          now,
        ]
      );
    }
    console.log(`   ✅ Created ${vendors.length} vendors`);

    // 6. PAYMENT METHODS - ACH Payment Methods
    console.log('\n💳 Seeding Payment Methods...');
    const paymentMethods = [
      {
        id: `pm_${Date.now()}_1`,
        tenant_id: 'tenant_1',
        type: 'ach',
        stripe_payment_method_id: null,
        bank_account_last4: '1234',
        bank_account_type: 'checking',
        is_default: 1,
        is_active: 1,
      },
      {
        id: `pm_${Date.now()}_2`,
        tenant_id: 'tenant_2',
        type: 'ach',
        stripe_payment_method_id: null,
        bank_account_last4: '5678',
        bank_account_type: 'savings',
        is_default: 1,
        is_active: 1,
      },
    ];

    for (const pm of paymentMethods) {
      const now = Date.now();
      await query(
        `INSERT OR REPLACE INTO payment_methods 
         (id, tenant_id, type, stripe_payment_method_id, bank_account_last4, 
          bank_account_type, is_default, is_active, organization_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          pm.id,
          pm.tenant_id,
          pm.type,
          pm.stripe_payment_method_id,
          pm.bank_account_last4,
          pm.bank_account_type,
          pm.is_default,
          pm.is_active,
          orgId,
          now,
          now,
        ]
      );
    }
    console.log(`   ✅ Created ${paymentMethods.length} payment methods`);

    // 7. PAYMENT SCHEDULES - Recurring Payment Schedules
    console.log('\n📅 Seeding Payment Schedules...');
    const paymentSchedules = [
      {
        id: `ps_${Date.now()}_1`,
        lease_id: 'lease_1',
        rent_amount: 120000, // $1200
        due_day: 1,
        start_date: new Date('2024-01-01').getTime(),
        end_date: new Date('2024-12-31').getTime(),
        is_active: 1,
      },
      {
        id: `ps_${Date.now()}_2`,
        lease_id: 'lease_2',
        rent_amount: 150000, // $1500
        due_day: 5,
        start_date: new Date('2024-01-01').getTime(),
        end_date: null, // Ongoing
        is_active: 1,
      },
    ];

    for (const schedule of paymentSchedules) {
      const now = Date.now();
      await query(
        `INSERT OR REPLACE INTO payment_schedules 
         (id, lease_id, rent_amount, due_day, start_date, end_date, 
          is_active, organization_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          schedule.id,
          schedule.lease_id,
          schedule.rent_amount,
          schedule.due_day,
          schedule.start_date,
          schedule.end_date,
          schedule.is_active,
          orgId,
          now,
          now,
        ]
      );
    }
    console.log(`   ✅ Created ${paymentSchedules.length} payment schedules`);

    // 8. DUNNING SETTINGS
    console.log('\n📧 Seeding Dunning Settings...');
    const dunningId = `ds_${Date.now()}_1`;
    const now = Date.now();
    await query(
      `INSERT OR REPLACE INTO dunning_settings 
       (id, organization_id, first_notice_days, second_notice_days, third_notice_days, 
        final_notice_days, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dunningId, orgId, 3, 7, 14, 30, 1, now, now]
    );
    console.log('   ✅ Created dunning settings');

    // 9. PRORATION RULES
    console.log('\n🧮 Seeding Proration Rules...');
    const prorationRules = [
      {
        id: `pror_${Date.now()}_1`,
        lease_id: 'lease_1',
        proration_method: 'daily',
        days_in_month: 30,
      },
      {
        id: `pror_${Date.now()}_2`,
        lease_id: 'lease_2',
        proration_method: 'exact',
        days_in_month: null, // Uses actual days in month
      },
    ];

    for (const rule of prorationRules) {
      const now = Date.now();
      await query(
        `INSERT OR REPLACE INTO proration_rules 
         (id, lease_id, proration_method, days_in_month, organization_id, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          rule.id,
          rule.lease_id,
          rule.proration_method,
          rule.days_in_month,
          orgId,
          now,
        ]
      );
    }
    console.log(`   ✅ Created ${prorationRules.length} proration rules`);

    console.log('\n✅✅✅ All sample data seeded successfully! ✅✅✅\n');
    console.log('Summary:');
    console.log(`- ${ledgerEntries.length} Rent Ledger entries`);
    console.log(`- ${lateFeeRules.length} Late Fee Rules`);
    console.log(`- ${ownerStatements.length} Owner Statements`);
    console.log(`- ${templates.length} Document Templates`);
    console.log(`- ${vendors.length} Vendors`);
    console.log(`- ${paymentMethods.length} Payment Methods`);
    console.log(`- ${paymentSchedules.length} Payment Schedules`);
    console.log('- 1 Dunning Settings');
    console.log(`- ${prorationRules.length} Proration Rules\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedAllFeatures();

