import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/automated-triggers - List automated triggers
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const triggerType = searchParams.get('triggerType');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM automated_triggers WHERE organization_id = ?`;
    const params: any[] = [organizationId];

    if (triggerType) {
      sql += ` AND trigger_type = ?`;
      params.push(triggerType);
    }

    sql += ` ORDER BY trigger_type, trigger_event`;

    const rows = await query(sql, params);

    const triggers = rows.map((row: any) => ({
      id: row.id,
      triggerType: row.trigger_type,
      triggerEvent: row.trigger_event,
      actionType: row.action_type,
      templateId: row.template_id,
      delayHours: row.delay_hours || 0,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ triggers });
  } catch (error) {
    console.error('Error fetching triggers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch triggers' },
      { status: 500 }
    );
  }
}

// POST /api/automated-triggers - Create automated trigger
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();

    if (!data.triggerType || !data.triggerEvent || !data.actionType) {
      return NextResponse.json(
        { error: 'Trigger type, event, and action type are required' },
        { status: 400 }
      );
    }

    const id = `at_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO automated_triggers 
       (id, trigger_type, trigger_event, action_type, template_id, delay_hours, 
        is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.triggerType,
        data.triggerEvent,
        data.actionType,
        data.templateId || null,
        data.delayHours || 0,
        data.isActive !== false ? 1 : 0,
        data.organizationId || 'org_1',
        now,
        now,
      ]
    );

    return NextResponse.json({
      id,
      triggerType: data.triggerType,
      triggerEvent: data.triggerEvent,
      actionType: data.actionType,
      templateId: data.templateId,
      delayHours: data.delayHours || 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating trigger:', error);
    return NextResponse.json(
      { error: 'Failed to create trigger' },
      { status: 500 }
    );
  }
}

