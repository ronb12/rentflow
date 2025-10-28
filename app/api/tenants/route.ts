import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/tenants
export async function GET() {
  try {
    const rows = await query("SELECT * FROM tenants ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenants" },
      { status: 500 }
    );
  }
}

// POST /api/tenants
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const id = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO tenants (id, first_name, last_name, email, phone, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.firstName,
        data.lastName,
        data.email || "",
        data.phone || "",
        data.organizationId || "org_1",
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Error creating tenant:", error);
    return NextResponse.json(
      { error: "Failed to create tenant" },
      { status: 500 }
    );
  }
}

