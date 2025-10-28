import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/inspections
export async function GET() {
  try {
    const rows = await query("SELECT * FROM inspections ORDER BY date DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching inspections:", error);
    return NextResponse.json(
      { error: "Failed to fetch inspections" },
      { status: 500 }
    );
  }
}

// POST /api/inspections
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const id = `insp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO inspections 
       (id, property_id, unit_id, lot_id, inspection_type, date, condition_notes, photos, status, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.propertyId || "",
        data.unitId || null,
        data.lotId || null,
        data.inspectionType || "regular",
        new Date(data.date || now).getTime(),
        data.conditionNotes || "",
        JSON.stringify(data.photos || []),
        data.status || "synced",
        data.organizationId || "org_1",
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Error creating inspection:", error);
    return NextResponse.json(
      { error: "Failed to create inspection" },
      { status: 500 }
    );
  }
}

