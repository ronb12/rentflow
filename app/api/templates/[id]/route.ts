import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/templates/[id] - Get template by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id } = await params;

    const rows = await query(
      `SELECT * FROM document_templates WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const row = rows[0];
    return NextResponse.json({
      id: row.id,
      name: row.name,
      category: row.category,
      version: row.version,
      templateContent: row.template_content,
      mergeFields: row.merge_fields ? JSON.parse(row.merge_fields) : [],
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PATCH /api/templates/[id] - Update template
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

    if (data.templateContent !== undefined) {
      updateFields.push('template_content = ?');
      updateValues.push(data.templateContent);
    }

    if (data.mergeFields !== undefined) {
      updateFields.push('merge_fields = ?');
      updateValues.push(JSON.stringify(data.mergeFields));
    }

    if (data.category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(data.category);
    }

    if (data.isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(data.isActive ? 1 : 0);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(id);

    await query(
      `UPDATE document_templates 
       SET ${updateFields.join(', ')} 
       WHERE id = ?`,
      updateValues
    );

    const rows = await query(`SELECT * FROM document_templates WHERE id = ?`, [id]);
    const row = rows[0];

    return NextResponse.json({
      id: row.id,
      name: row.name,
      category: row.category,
      version: row.version,
      templateContent: row.template_content,
      mergeFields: row.merge_fields ? JSON.parse(row.merge_fields) : [],
      isActive: row.is_active === 1,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

