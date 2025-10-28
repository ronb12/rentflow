import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/properties/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rows = await query("SELECT * FROM properties WHERE id = ?", [params.id]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching property:", error);
    return NextResponse.json(
      { error: "Failed to fetch property" },
      { status: 500 }
    );
  }
}

// PUT /api/properties/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await req.json();

    await query(
      `UPDATE properties SET name = ?, address = ?, type = ?, updated_at = ? WHERE id = ?`,
      [data.name, data.address || "", data.type || "apartment", Date.now(), params.id]
    );

    return NextResponse.json({ id: params.id, ...data });
  } catch (error) {
    console.error("Error updating property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await query("UPDATE properties SET is_active = 0, updated_at = ? WHERE id = ?", [
      Date.now(),
      params.id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 }
    );
  }
}

