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
    const rows = await query(
      "SELECT id, tenant_email, tenant_name, phone, property_id, preferred_datetime, notes, status, created_at, updated_at FROM tours ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching tours:", error);
    return NextResponse.json({ error: "Failed to fetch tours" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();

    const id = `tour_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();

    const tenantEmail = (data.tenantEmail || "").toString();
    const tenantName = (data.tenantName || "").toString();
    const phone = (data.phone || "").toString();
    const propertyId = (data.propertyId || "").toString();
    const preferredDatetime = Number(data.preferredDatetime) || now;
    const notes = (data.notes || "").toString();
    const status = "requested";

    await query(
      `INSERT INTO tours (id, tenant_email, tenant_name, phone, property_id, preferred_datetime, notes, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        tenantEmail,
        tenantName,
        phone,
        propertyId,
        preferredDatetime,
        notes,
        status,
        now,
        now,
      ]
    );

    // Optional: email notification could be added here

    return NextResponse.json({ id, tenantEmail, tenantName, phone, propertyId, preferredDatetime, notes, status });
  } catch (error) {
    console.error("Error creating tour:", error);
    return NextResponse.json({ error: "Failed to create tour" }, { status: 500 });
  }
}


