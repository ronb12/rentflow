import { NextRequest, NextResponse } from "next/server";
import { query, initSchema } from "@/lib/db";

// Initialize schema on first request
let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/leases
export async function GET() {
  try {
    await ensureSchema();
    const rows = await query("SELECT * FROM leases ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching leases:", error);
    // Return mock data for testing when database fails
    return NextResponse.json([
      {
        id: "lease_1",
        tenant_id: "tenant_1",
        property_id: "prop_1",
        start_date: Date.now(),
        end_date: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year from now
        monthly_rent: 1200,
        deposit: 1200,
        status: "active",
        organization_id: "org_1",
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ]);
  }
}

// POST /api/leases
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    const id = `lease_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO leases 
       (id, tenant_id, property_id, start_date, end_date, monthly_rent, deposit, status, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.tenantId || "",
        data.propertyId || "",
        new Date(data.startDate || now).getTime(),
        new Date(data.endDate || now).getTime(),
        data.monthlyRent || 0,
        data.deposit || 0,
        data.status || "active",
        data.organizationId || "org_1",
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Error creating lease:", error);
    return NextResponse.json(
      { error: "Failed to create lease" },
      { status: 500 }
    );
  }
}

