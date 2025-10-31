import { NextRequest, NextResponse } from 'next/server';
import { initSchema, query } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/vendors/sla - List SLA rules
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || 'org_1';
    const rows = await query(`SELECT * FROM service_sla_rules WHERE organization_id = ? ORDER BY service_type, priority`, [organizationId]);
    const rules = rows.map((r: any) => ({
      id: r.id,
      serviceType: r.service_type,
      priority: r.priority,
      targetHours: r.target_hours,
      isActive: r.is_active === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    return NextResponse.json({ rules });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch SLA rules' }, { status: 500 });
  }
}

// POST /api/vendors/sla - Create SLA rule
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { serviceType, priority, targetHours, isActive = true, organizationId = 'org_1' } = data;
    if (!serviceType || !priority || targetHours == null) {
      return NextResponse.json({ error: 'serviceType, priority, targetHours are required' }, { status: 400 });
    }
    const id = `sla_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const now = Date.now();
    await query(
      `INSERT INTO service_sla_rules (id, service_type, priority, target_hours, is_active, organization_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, serviceType, priority, Number(targetHours), isActive ? 1 : 0, organizationId, now, now]
    );
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create SLA rule' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/vendors/sla - Get SLA rules
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('serviceType');
    const priority = searchParams.get('priority');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM service_sla_rules WHERE organization_id = ? AND is_active = 1`;
    const params: any[] = [organizationId];

    if (serviceType) {
      sql += ` AND service_type = ?`;
      params.push(serviceType);
    }

    if (priority) {
      sql += ` AND priority = ?`;
      params.push(priority);
    }

    sql += ` ORDER BY service_type, priority`;

    const rows = await query(sql, params);

    const rules = rows.map((row: any) => ({
      id: row.id,
      serviceType: row.service_type,
      priority: row.priority,
      targetHours: row.target_hours,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ rules });
  } catch (error) {
    console.error('Error fetching SLA rules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SLA rules' },
      { status: 500 }
    );
  }
}

// POST /api/vendors/sla - Create SLA rule
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();

    if (!data.serviceType || !data.priority || !data.targetHours) {
      return NextResponse.json(
        { error: 'Service type, priority, and target hours are required' },
        { status: 400 }
      );
    }

    const id = `sla_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO service_sla_rules 
       (id, service_type, priority, target_hours, is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.serviceType,
        data.priority,
        data.targetHours,
        data.isActive !== false ? 1 : 0,
        data.organizationId || 'org_1',
        now,
        now,
      ]
    );

    return NextResponse.json({
      id,
      serviceType: data.serviceType,
      priority: data.priority,
      targetHours: data.targetHours,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating SLA rule:', error);
    return NextResponse.json(
      { error: 'Failed to create SLA rule' },
      { status: 500 }
    );
  }
}

