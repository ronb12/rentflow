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
      "SELECT * FROM work_orders ORDER BY created_at DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching work orders:", error);
    return NextResponse.json({ error: "Failed to fetch work orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    const id = `wo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const now = Date.now();

    await query(
      `INSERT INTO work_orders (
        id, maintenance_request_id, title, description, tenant_id, property, priority, status, assigned_to, due_date, estimated_cost, actual_cost, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.maintenanceRequestId || "",
        data.title || "",
        data.description || "",
        data.tenantId || "",
        data.property || "",
        data.priority || "medium",
        data.status || "pending",
        data.assignedTo || "",
        data.dueDate ? Number(data.dueDate) : null,
        data.estimatedCost ? Number(data.estimatedCost) : null,
        data.actualCost ? Number(data.actualCost) : null,
        now,
        now,
      ]
    );

    // Optional auto-close maintenance request
    if (data.autoClose && data.maintenanceRequestId && (data.status === 'completed')) {
      await query(`UPDATE maintenance_requests SET status = 'completed', updated_at = ? WHERE id = ?`, [now, data.maintenanceRequestId]);
    }

    return NextResponse.json({ id, ...data });
  } catch (error) {
    console.error("Error creating work order:", error);
    return NextResponse.json({ error: "Failed to create work order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureSchema();
    const data = await req.json();
    const now = Date.now();
    if (!data.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const fields: string[] = [];
    const params: any[] = [];
    const updatable: Record<string, string> = {
      title: 'title', description: 'description', tenantId: 'tenant_id', property: 'property',
      priority: 'priority', status: 'status', assignedTo: 'assigned_to', estimatedCost: 'estimated_cost', actualCost: 'actual_cost'
    };
    for (const k of Object.keys(updatable)) {
      if (k in data) { fields.push(`${updatable[k]} = ?`); params.push(data[k]); }
    }
    if (typeof data.dueDate !== 'undefined') { fields.push(`due_date = ?`); params.push(Number(data.dueDate)); }
    if (fields.length === 0) return NextResponse.json({ error: 'nothing to update' }, { status: 400 });
    fields.push('updated_at = ?'); params.push(now);
    params.push(data.id);

    await query(`UPDATE work_orders SET ${fields.join(', ')} WHERE id = ?`, params);

    // Optional auto-close
    if (data.autoClose && data.maintenanceRequestId && data.status === 'completed') {
      await query(`UPDATE maintenance_requests SET status = 'completed', updated_at = ? WHERE id = ?`, [now, data.maintenanceRequestId]);
    }

    return NextResponse.json({ id: data.id, updated: true });
  } catch (error) {
    console.error('Error updating work order:', error);
    return NextResponse.json({ error: 'Failed to update work order' }, { status: 500 });
  }
}


