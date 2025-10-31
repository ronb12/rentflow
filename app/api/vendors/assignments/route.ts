import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/vendors/assignments - List vendor assignments
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    const workOrderId = searchParams.get('workOrderId');
    const status = searchParams.get('status');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT va.*, v.name as vendor_name, v.service_type 
               FROM vendor_assignments va
               LEFT JOIN vendors v ON va.vendor_id = v.id
               WHERE va.organization_id = ?`;
    const params: any[] = [organizationId];

    if (vendorId) {
      sql += ` AND va.vendor_id = ?`;
      params.push(vendorId);
    }

    if (workOrderId) {
      sql += ` AND va.work_order_id = ?`;
      params.push(workOrderId);
    }

    if (status) {
      sql += ` AND va.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY va.scheduled_date DESC`;

    const rows = await query(sql, params);

    const assignments = rows.map((row: any) => ({
      id: row.id,
      vendorId: row.vendor_id,
      vendorName: row.vendor_name,
      serviceType: row.service_type,
      workOrderId: row.work_order_id,
      maintenanceRequestId: row.maintenance_request_id,
      scheduledDate: row.scheduled_date,
      estimatedCost: row.estimated_cost || 0,
      actualCost: row.actual_cost || 0,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/vendors/assignments - Create vendor assignment
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    
    if (!data.vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    const id = `va_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO vendor_assignments 
       (id, vendor_id, work_order_id, maintenance_request_id, scheduled_date, 
        estimated_cost, actual_cost, status, notes, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.vendorId,
        data.workOrderId || null,
        data.maintenanceRequestId || null,
        data.scheduledDate ? new Date(data.scheduledDate).getTime() : null,
        data.estimatedCost ? Math.round(data.estimatedCost * 100) : null,
        data.actualCost ? Math.round(data.actualCost * 100) : null,
        data.status || 'scheduled',
        data.notes || null,
        data.organizationId || 'org_1',
        now,
        now,
      ]
    );

    return NextResponse.json({
      id,
      vendorId: data.vendorId,
      workOrderId: data.workOrderId,
      maintenanceRequestId: data.maintenanceRequestId,
      scheduledDate: data.scheduledDate,
      estimatedCost: data.estimatedCost,
      actualCost: data.actualCost,
      status: data.status || 'scheduled',
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

