import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/templates/versions/[name] - Get all versions of a template by name
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    await ensureSchema();
    const { name } = await params;
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || 'org_1';
    const decodedName = decodeURIComponent(name);

    const rows = await query(
      `SELECT * FROM document_templates 
       WHERE name = ? AND organization_id = ? 
       ORDER BY version DESC`,
      [decodedName, organizationId]
    );

    const versions = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      version: row.version,
      templateContent: row.template_content,
      mergeFields: row.merge_fields ? JSON.parse(row.merge_fields) : [],
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ versions });
  } catch (error) {
    console.error('Error fetching template versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch template versions' },
      { status: 500 }
    );
  }
}


