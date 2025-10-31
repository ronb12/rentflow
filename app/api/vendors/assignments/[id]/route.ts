import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// PATCH /api/vendors/assignments/[id] - Update assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id } = await params;
    const data = await request.json();
    const now = Date.now();

    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (data.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(data.status);
    }

    if (data.scheduledDate !== undefined) {
      updateFields.push('scheduled_date = ?');
      updateValues.push(new Date(data.scheduledDate).getTime());
    }

    if (data.estimatedCost !== undefined) {
      updateFields.push('estimated_cost = ?');
      updateValues.push(Math.round(data.estimatedCost * 100));
    }

    if (data.actualCost !== undefined) {
      updateFields.push('actual_cost = ?');
      updateValues.push(Math.round(data.actualCost * 100));
    }

    if (data.notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(data.notes);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(id);

    await query(
      `UPDATE vendor_assignments 
       SET ${updateFields.join(', ')} 
       WHERE id = ?`,
      updateValues
    );

    const rows = await query(
      `SELECT va.*, v.name as vendor_name 
       FROM vendor_assignments va
       LEFT JOIN vendors v ON va.vendor_id = v.id
       WHERE va.id = ?`,
      [id]
    );
    const row = rows[0];

    return NextResponse.json({
      id: row.id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      workOrderId: row.work_order_id,
      maintenanceRequestId: row.maintenance_request_id,
      scheduledDate: row.scheduled_date,
      estimatedCost: row.estimated_cost || 0,
      actualCost: row.actual_cost || 0,
      status: row.status,
      notes: row.notes,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}

