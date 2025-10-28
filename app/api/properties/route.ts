import { NextRequest, NextResponse } from "next/server";
import { db, query } from "@/lib/db";

// GET /api/properties
export async function GET() {
  try {
    const rows = await query("SELECT * FROM properties WHERE is_active = 1");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties" },
      { status: 500 }
    );
  }
}

// POST /api/properties
export async function POST(req: NextRequest) {
  try {
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

