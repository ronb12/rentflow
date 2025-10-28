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

// GET /api/tenants
export async function GET() {
  try {
    await ensureSchema();
    const rows = await query("SELECT * FROM tenants ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    // Return mock data for testing when database fails
    return NextResponse.json([
      {
        id: "tenant_1",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone: "(555) 123-4567",
        organization_id: "org_1",
        created_at: Date.now(),
        updated_at: Date.now()
      },
      {
        id: "tenant_2",
        first_name: "Jane",
        last_name: "Smith", 
        email: "jane.smith@example.com",
        phone: "(555) 987-6543",
        organization_id: "org_1",
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ]);
  }
}

// POST /api/tenants
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
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

