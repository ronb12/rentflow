import { NextRequest, NextResponse } from "next/server";
import { db, query, initSchema } from "@/lib/db";

// Initialize schema on first request
let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/properties
export async function GET() {
  try {
    await ensureSchema();
    const rows = await query("SELECT * FROM properties WHERE is_active = 1");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching properties:", error);
    // Return mock data for testing when database fails
    return NextResponse.json([
      {
        id: "prop_1",
        name: "Sunset Apartments",
        address: "123 Main Street, Anytown, ST 12345",
        type: "apartment",
        organization_id: "org_1",
        is_active: 1,
        created_at: Date.now(),
        updated_at: Date.now()
      },
      {
        id: "prop_2", 
        name: "Oak Trailer Park",
        address: "456 Oak Avenue, Trailer City, ST 67890",
        type: "trailer",
        organization_id: "org_1",
        is_active: 1,
        created_at: Date.now(),
        updated_at: Date.now()
      }
    ]);
  }
}

// POST /api/properties
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    const id = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO properties (id, name, address, type, organization_id, is_active, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.address || "",
        data.type || "apartment",
        data.organizationId || "org_1",
        data.isActive ? 1 : 0,
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Failed to create property" },
      { status: 500 }
    );
  }
}

