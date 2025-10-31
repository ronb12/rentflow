import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/message-templates - List message templates
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM message_templates WHERE organization_id = ? AND is_active = 1`;
    const params: any[] = [organizationId];

    if (type) {
      sql += ` AND type = ?`;
      params.push(type);
    }

    sql += ` ORDER BY name ASC`;

    const rows = await query(sql, params);

    const templates = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      subject: row.subject,
      body: row.body,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching message templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message templates' },
      { status: 500 }
    );
  }
}

// POST /api/message-templates - Create message template
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();

    if (!data.name || !data.body) {
      return NextResponse.json(
        { error: 'Name and body are required' },
        { status: 400 }
      );
    }

    const id = `mt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO message_templates 
       (id, name, type, subject, body, is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.type || null,
        data.subject || null,
        data.body,
        data.isActive !== false ? 1 : 0,
        data.organizationId || 'org_1',
        now,
        now,
      ]
    );

    return NextResponse.json({
      id,
      name: data.name,
      type: data.type,
      subject: data.subject,
      body: data.body,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating message template:', error);
    return NextResponse.json(
      { error: 'Failed to create message template' },
      { status: 500 }
    );
  }
}

