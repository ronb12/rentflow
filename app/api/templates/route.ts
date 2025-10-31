import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM document_templates WHERE organization_id = ? AND is_active = 1`;
    const params: any[] = [organizationId];

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }

    sql += ` ORDER BY name, version DESC`;

    const rows = await query(sql, params);

    // Group by name and get latest version
    const templateMap = new Map<string, any>();
    rows.forEach((row: any) => {
      const name = row.name;
      const version = row.version || 1;
      
      if (!templateMap.has(name) || (templateMap.get(name)?.version || 1) < version) {
        templateMap.set(name, {
          id: row.id,
          name: row.name,
          category: row.category,
          version: version,
          templateContent: row.template_content,
          mergeFields: row.merge_fields ? JSON.parse(row.merge_fields) : [],
          isActive: row.is_active === 1,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      }
    });

    const templates = Array.from(templateMap.values());

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create new template or new version
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { name, category, templateContent, mergeFields, organizationId = 'org_1', createNewVersion = false } = data;

    if (!name || !templateContent) {
      return NextResponse.json(
        { error: 'Name and template content are required' },
        { status: 400 }
      );
    }

    // Check if template with this name exists
    const existingRows = await query(
      `SELECT MAX(version) as max_version FROM document_templates 
       WHERE name = ? AND organization_id = ?`,
      [name, organizationId]
    );

    const maxVersion = existingRows[0]?.max_version || 0;
    const newVersion = createNewVersion ? maxVersion + 1 : (maxVersion > 0 ? maxVersion : 1);

    // If not creating new version and template exists, update it
    if (!createNewVersion && maxVersion > 0) {
      await query(
        `UPDATE document_templates 
         SET template_content = ?, merge_fields = ?, category = ?, updated_at = ?
         WHERE name = ? AND version = ? AND organization_id = ?`,
        [
          templateContent,
          JSON.stringify(mergeFields || []),
          category || null,
          Date.now(),
          name,
          newVersion,
          organizationId,
        ]
      );

      const updatedRows = await query(
        `SELECT * FROM document_templates 
         WHERE name = ? AND version = ? AND organization_id = ?`,
        [name, newVersion, organizationId]
      );

      return NextResponse.json({
        id: updatedRows[0].id,
        name,
        category,
        version: newVersion,
        templateContent,
        mergeFields: mergeFields || [],
        isActive: true,
      });
    }

    // Create new template or new version
    const id = `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    // Deactivate old versions if creating new version
    if (createNewVersion && maxVersion > 0) {
      await query(
        `UPDATE document_templates SET is_active = 0 
         WHERE name = ? AND organization_id = ?`,
        [name, organizationId]
      );
    }

    await query(
      `INSERT INTO document_templates 
       (id, name, category, version, template_content, merge_fields, is_active, 
        organization_id, created_by, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        category || null,
        newVersion,
        templateContent,
        JSON.stringify(mergeFields || []),
        1,
        organizationId,
        data.createdBy || null,
        now,
        now,
      ]
    );

    return NextResponse.json({
      id,
      name,
      category,
      version: newVersion,
      templateContent,
      mergeFields: mergeFields || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

