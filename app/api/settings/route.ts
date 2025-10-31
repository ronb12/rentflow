import { NextRequest, NextResponse } from "next/server";
import { initSchema, query } from "@/lib/db";

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

export async function GET() {
  try {
    await ensureSchema();
    const rows = await query("SELECT * FROM company_settings WHERE id = 'default' LIMIT 1");
    const data = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    return NextResponse.json(data || {});
  } catch (e) {
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const body = await req.json();
    const now = Date.now();
    await query(
      `INSERT INTO company_settings (id, company_name, company_address, company_email, company_phone, logo_url, updated_at)
       VALUES ('default', ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET company_name=excluded.company_name, company_address=excluded.company_address, company_email=excluded.company_email, company_phone=excluded.company_phone, logo_url=excluded.logo_url, updated_at=excluded.updated_at`,
      [body.company_name || "", body.company_address || "", body.company_email || "", body.company_phone || "", body.logo_url || "", now]
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}


