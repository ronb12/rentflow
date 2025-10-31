import { createClient } from "@libsql/client";

// Initialize Turso client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export const db = client;

// Helper function to execute queries with retry logic
export async function query(sql: string, params: any[] = []) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await client.execute(sql, params);
      // Return raw rows for now - will handle conversion in API routes
      return result.rows;
    } catch (error) {
      lastError = error;
      console.error(`Database query error (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError;
}

// Initialize schema
export async function initSchema() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      display_name TEXT,
      password TEXT,
      password_hash TEXT,
      role TEXT DEFAULT 'manager',
      organization_id TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      type TEXT,
      organization_id TEXT,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      organization_id TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS leases (
      id TEXT PRIMARY KEY,
      tenant_id TEXT,
      property_id TEXT,
      start_date INTEGER,
      end_date INTEGER,
      monthly_rent INTEGER,
      deposit INTEGER,
      status TEXT,
      organization_id TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      lease_id TEXT,
      invoice_number TEXT,
      due_date INTEGER,
      amount INTEGER,
      amount_paid INTEGER DEFAULT 0,
      late_fees INTEGER DEFAULT 0,
      status TEXT,
      organization_id TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );

        CREATE TABLE IF NOT EXISTS inspections (
          id TEXT PRIMARY KEY,
          property_id TEXT,
          unit_id TEXT,
          lot_id TEXT,
          inspection_type TEXT,
          date INTEGER,
          condition_notes TEXT,
          photos TEXT,
          status TEXT,
          synced_at INTEGER,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          tenant_id TEXT,
          amount INTEGER,
          payment_method TEXT,
          status TEXT,
          stripe_payment_intent_id TEXT,
          stripe_charge_id TEXT,
          currency TEXT DEFAULT 'usd',
          failure_reason TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS maintenance_requests (
          id TEXT PRIMARY KEY,
          tenant_id TEXT,
          issue_type TEXT,
          description TEXT,
          priority TEXT,
          status TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          tenant_id TEXT,
          message TEXT,
          status TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS tours (
          id TEXT PRIMARY KEY,
          tenant_email TEXT,
          tenant_name TEXT,
          phone TEXT,
          property_id TEXT,
          preferred_datetime INTEGER,
          notes TEXT,
          status TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS work_orders (
          id TEXT PRIMARY KEY,
          maintenance_request_id TEXT,
          title TEXT,
          description TEXT,
          tenant_id TEXT,
          property TEXT,
          priority TEXT,
          status TEXT,
          assigned_to TEXT,
          due_date INTEGER,
          estimated_cost INTEGER,
          actual_cost INTEGER,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS company_settings (
          id TEXT PRIMARY KEY,
          company_name TEXT,
          company_address TEXT,
          company_email TEXT,
          company_phone TEXT,
          logo_url TEXT,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS companies (
          id TEXT PRIMARY KEY,
          name TEXT,
          billing_email TEXT,
          stripe_connect_account_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS rent_ledger (
          id TEXT PRIMARY KEY,
          lease_id TEXT,
          invoice_id TEXT,
          transaction_type TEXT NOT NULL,
          amount INTEGER NOT NULL,
          due_date INTEGER,
          paid_date INTEGER,
          payment_method TEXT,
          status TEXT,
          late_fee_amount INTEGER DEFAULT 0,
          notes TEXT,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS late_fee_rules (
          id TEXT PRIMARY KEY,
          lease_id TEXT,
          organization_id TEXT,
          grace_period_days INTEGER DEFAULT 5,
          fee_type TEXT DEFAULT 'fixed',
          fixed_amount INTEGER DEFAULT 0,
          percentage_amount REAL DEFAULT 0,
          max_fee_amount INTEGER,
          is_active INTEGER DEFAULT 1,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS owner_statements (
          id TEXT PRIMARY KEY,
          owner_id TEXT,
          statement_period_start INTEGER,
          statement_period_end INTEGER,
          total_collections INTEGER,
          total_expenses INTEGER,
          net_amount INTEGER,
          status TEXT,
          generated_at INTEGER,
          organization_id TEXT,
          created_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS document_templates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT,
          version INTEGER DEFAULT 1,
          template_content TEXT NOT NULL,
          merge_fields TEXT,
          is_active INTEGER DEFAULT 1,
          organization_id TEXT,
          created_by TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS vendors (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          contact_name TEXT,
          email TEXT,
          phone TEXT,
          service_type TEXT,
          hourly_rate INTEGER,
          rating REAL,
          is_active INTEGER DEFAULT 1,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS vendor_assignments (
          id TEXT PRIMARY KEY,
          vendor_id TEXT NOT NULL,
          work_order_id TEXT,
          maintenance_request_id TEXT,
          scheduled_date INTEGER,
          estimated_cost INTEGER,
          actual_cost INTEGER,
          status TEXT,
          notes TEXT,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS service_sla_rules (
          id TEXT PRIMARY KEY,
          service_type TEXT,
          priority TEXT,
          target_hours INTEGER,
          is_active INTEGER DEFAULT 1,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS vendor_ratings (
          id TEXT PRIMARY KEY,
          vendor_id TEXT NOT NULL,
          work_order_id TEXT,
          rating INTEGER,
          comment TEXT,
          organization_id TEXT,
          created_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS payment_methods (
          id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          type TEXT NOT NULL,
          stripe_payment_method_id TEXT,
          bank_account_last4 TEXT,
          bank_account_type TEXT,
          is_default INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS payment_schedules (
          id TEXT PRIMARY KEY,
          lease_id TEXT NOT NULL,
          rent_amount INTEGER NOT NULL,
          due_day INTEGER DEFAULT 1,
          start_date INTEGER,
          end_date INTEGER,
          is_active INTEGER DEFAULT 1,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS proration_rules (
          id TEXT PRIMARY KEY,
          lease_id TEXT,
          proration_method TEXT DEFAULT 'daily',
          days_in_month INTEGER DEFAULT 30,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS dunning_settings (
          id TEXT PRIMARY KEY,
          organization_id TEXT,
          first_notice_days INTEGER DEFAULT 3,
          second_notice_days INTEGER DEFAULT 7,
          third_notice_days INTEGER DEFAULT 14,
          final_notice_days INTEGER DEFAULT 30,
          is_active INTEGER DEFAULT 1,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS notification_preferences (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          tenant_id TEXT,
          email_enabled INTEGER DEFAULT 1,
          sms_enabled INTEGER DEFAULT 0,
          rent_due_reminder INTEGER DEFAULT 1,
          late_notice INTEGER DEFAULT 1,
          maintenance_update INTEGER DEFAULT 1,
          document_signing INTEGER DEFAULT 1,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS message_templates (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT,
          subject TEXT,
          body TEXT,
          is_active INTEGER DEFAULT 1,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );

        CREATE TABLE IF NOT EXISTS automated_triggers (
          id TEXT PRIMARY KEY,
          trigger_type TEXT NOT NULL,
          trigger_event TEXT NOT NULL,
          action_type TEXT NOT NULL,
          template_id TEXT,
          delay_hours INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          organization_id TEXT,
          created_at INTEGER,
          updated_at INTEGER
        );
  `;

  try {
    await client.executeMultiple(schema);
    // Best-effort upgrades for messages table
    try { await client.execute("ALTER TABLE messages ADD COLUMN sender_role TEXT"); } catch (e) {}
    try { await client.execute("ALTER TABLE messages ADD COLUMN is_read INTEGER DEFAULT 0"); } catch (e) {}
    // Ensure company_settings table exists (no-op if already)
    try {
      await client.execute("CREATE TABLE IF NOT EXISTS company_settings (id TEXT PRIMARY KEY, company_name TEXT, company_address TEXT, company_email TEXT, company_phone TEXT, logo_url TEXT, updated_at INTEGER)");
    } catch (e) {}
    // Best-effort upgrades for work_orders additional columns (no-op if exist)
    try { await client.execute("ALTER TABLE work_orders ADD COLUMN maintenance_request_id TEXT"); } catch (e) {}
    
    // Best-effort upgrades for new tables (no-op if already exist)
    const upgradeQueries = [
      "CREATE TABLE IF NOT EXISTS rent_ledger (id TEXT PRIMARY KEY, lease_id TEXT, invoice_id TEXT, transaction_type TEXT NOT NULL, amount INTEGER NOT NULL, due_date INTEGER, paid_date INTEGER, payment_method TEXT, status TEXT, late_fee_amount INTEGER DEFAULT 0, notes TEXT, organization_id TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS late_fee_rules (id TEXT PRIMARY KEY, lease_id TEXT, organization_id TEXT, grace_period_days INTEGER DEFAULT 5, fee_type TEXT DEFAULT 'fixed', fixed_amount INTEGER DEFAULT 0, percentage_amount REAL DEFAULT 0, max_fee_amount INTEGER, is_active INTEGER DEFAULT 1, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS owner_statements (id TEXT PRIMARY KEY, owner_id TEXT, statement_period_start INTEGER, statement_period_end INTEGER, total_collections INTEGER, total_expenses INTEGER, net_amount INTEGER, status TEXT, generated_at INTEGER, organization_id TEXT, created_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS document_templates (id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT, version INTEGER DEFAULT 1, template_content TEXT NOT NULL, merge_fields TEXT, is_active INTEGER DEFAULT 1, organization_id TEXT, created_by TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS vendors (id TEXT PRIMARY KEY, name TEXT NOT NULL, contact_name TEXT, email TEXT, phone TEXT, service_type TEXT, hourly_rate INTEGER, rating REAL, is_active INTEGER DEFAULT 1, organization_id TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS vendor_assignments (id TEXT PRIMARY KEY, vendor_id TEXT NOT NULL, work_order_id TEXT, maintenance_request_id TEXT, scheduled_date INTEGER, estimated_cost INTEGER, actual_cost INTEGER, status TEXT, notes TEXT, organization_id TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS service_sla_rules (id TEXT PRIMARY KEY, service_type TEXT, priority TEXT, target_hours INTEGER, is_active INTEGER DEFAULT 1, organization_id TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS vendor_ratings (id TEXT PRIMARY KEY, vendor_id TEXT NOT NULL, work_order_id TEXT, rating INTEGER, comment TEXT, organization_id TEXT, created_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS payment_methods (id TEXT PRIMARY KEY, tenant_id TEXT NOT NULL, type TEXT NOT NULL, stripe_payment_method_id TEXT, bank_account_last4 TEXT, bank_account_type TEXT, is_default INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, organization_id TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS payment_schedules (id TEXT PRIMARY KEY, lease_id TEXT NOT NULL, rent_amount INTEGER NOT NULL, due_day INTEGER DEFAULT 1, start_date INTEGER, end_date INTEGER, is_active INTEGER DEFAULT 1, organization_id TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS proration_rules (id TEXT PRIMARY KEY, lease_id TEXT, proration_method TEXT DEFAULT 'daily', days_in_month INTEGER DEFAULT 30, organization_id TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS dunning_settings (id TEXT PRIMARY KEY, organization_id TEXT, first_notice_days INTEGER DEFAULT 3, second_notice_days INTEGER DEFAULT 7, third_notice_days INTEGER DEFAULT 14, final_notice_days INTEGER DEFAULT 30, is_active INTEGER DEFAULT 1, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS notification_preferences (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, tenant_id TEXT, email_enabled INTEGER DEFAULT 1, sms_enabled INTEGER DEFAULT 0, rent_due_reminder INTEGER DEFAULT 1, late_notice INTEGER DEFAULT 1, maintenance_update INTEGER DEFAULT 1, document_signing INTEGER DEFAULT 1, organization_id TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS message_templates (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT, subject TEXT, body TEXT, is_active INTEGER DEFAULT 1, organization_id TEXT, created_at INTEGER, updated_at INTEGER)",
      "CREATE TABLE IF NOT EXISTS automated_triggers (id TEXT PRIMARY KEY, trigger_type TEXT NOT NULL, trigger_event TEXT NOT NULL, action_type TEXT NOT NULL, template_id TEXT, delay_hours INTEGER DEFAULT 0, is_active INTEGER DEFAULT 1, organization_id TEXT, created_at INTEGER, updated_at INTEGER)"
    ];
    
    for (const query of upgradeQueries) {
      try {
        await client.execute(query);
      } catch (e) {
        console.log("Upgrade query skipped (likely already exists):", query.substring(0, 50));
      }
    }
    
    console.log("Database schema initialized");
  } catch (error) {
    console.error("Schema initialization error:", error);
  }
}
