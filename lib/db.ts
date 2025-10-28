import { createClient } from "@libsql/client";

// Initialize Turso client
const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "",
  authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export const db = client;

// Helper function to execute queries
export async function query(sql: string, params: any[] = []) {
  try {
    const result = await client.execute(sql, params);
    return result.rows.map(row => {
      const obj: any = {};
      if (row) {
        row.forEach((value: any, key: string) => {
          obj[key] = value;
        });
      }
      return obj;
    });
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
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
  `;

  try {
    await client.executeMultiple(schema);
    console.log("Database schema initialized");
  } catch (error) {
    console.error("Schema initialization error:", error);
  }
}
