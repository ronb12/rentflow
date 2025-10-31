import { NextRequest, NextResponse } from 'next/server';
import { initSchema, query } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// PATCH /api/vendors/sla/[id] - Update SLA rule
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureSchema();
    const { id } = await params;
    const data = await request.json();
    const fields: string[] = [];
    const values: any[] = [];
    if (data.serviceType !== undefined) { fields.push('service_type = ?'); values.push(data.serviceType); }
    if (data.priority !== undefined) { fields.push('priority = ?'); values.push(data.priority); }
    if (data.targetHours !== undefined) { fields.push('target_hours = ?'); values.push(Number(data.targetHours)); }
    if (data.isActive !== undefined) { fields.push('is_active = ?'); values.push(data.isActive ? 1 : 0); }
    fields.push('updated_at = ?'); values.push(Date.now());
    values.push(id);
    await query(`UPDATE service_sla_rules SET ${fields.join(', ')} WHERE id = ?`, values);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update SLA rule' }, { status: 500 });
  }
}


