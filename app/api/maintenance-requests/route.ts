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

// GET /api/maintenance-requests
export async function GET() {
  try {
    await ensureSchema();
    const rows = await query("SELECT * FROM maintenance_requests ORDER BY created_at DESC");
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch maintenance requests" },
      { status: 500 }
    );
  }
}

// POST /api/maintenance-requests
export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    const id = `maintenance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO maintenance_requests 
       (id, tenant_id, issue_type, description, priority, status, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.tenantId || "",
        data.issueType || "other",
        data.description || "",
        data.priority || "medium",
        data.status || "open",
        now,
        now,
      ]
    );

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    return NextResponse.json(
      { error: "Failed to create maintenance request" },
      { status: 500 }
    );
  }
}

// PATCH /api/maintenance-requests
export async function PATCH(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    const id = (data.id || '').toString();
    const status = (data.status || '').toString();
    const now = Date.now();

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    await query(
      `UPDATE maintenance_requests SET status = ?, updated_at = ? WHERE id = ?`,
      [status, now, id]
    );

    return NextResponse.json({ id, status });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    return NextResponse.json(
      { error: 'Failed to update maintenance request' },
      { status: 500 }
    );
  }
}


