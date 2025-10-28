import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/leases
export async function GET() {
  try {
    const rows = await query("SELECT * FROM leases ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching leases:", error);
    return NextResponse.json(
      { error: "Failed to fetch leases" },
      { status: 500 }
    );
  }
}

// POST /api/leases
export async function POST(req: NextRequest) {
  try {
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

