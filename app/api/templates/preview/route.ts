import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// POST /api/templates/preview - Generate preview with merge fields
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { templateId, mergeFieldValues } = data;

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Get template
    const rows = await query(
      `SELECT * FROM document_templates WHERE id = ?`,
      [templateId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const template = rows[0];
    let content = template.template_content;
    const mergeFields = template.merge_fields ? JSON.parse(template.merge_fields) : [];
    const fieldValues = mergeFieldValues || {};

    // Replace merge fields with values
    mergeFields.forEach((field: any) => {
      const placeholder = `{{${field.name}}}`;
      const value = fieldValues[field.name] || field.defaultValue || '';
      content = content.replace(new RegExp(placeholder, 'g'), value);
    });

    // Replace common placeholders
    const commonFields = {
      '{{tenant_name}}': fieldValues.tenant_name || 'John Doe',
      '{{tenant_email}}': fieldValues.tenant_email || 'tenant@example.com',
      '{{property_address}}': fieldValues.property_address || '123 Main St',
      '{{rent_amount}}': fieldValues.rent_amount || '$1,200',
      '{{due_date}}': fieldValues.due_date || new Date().toLocaleDateString(),
      '{{company_name}}': fieldValues.company_name || 'Property Management',
      '{{date}}': new Date().toLocaleDateString(),
    };

    Object.entries(commonFields).forEach(([placeholder, value]) => {
      content = content.replace(new RegExp(placeholder, 'g'), value);
    });

    return NextResponse.json({ preview: content });
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

