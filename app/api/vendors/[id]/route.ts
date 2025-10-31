import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/vendors/[id] - Get vendor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureSchema();
    const { id } = await params;

    const rows = await query(
      `SELECT * FROM vendors WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    const row = rows[0];
    return NextResponse.json({
      id: row.id,
      name: row.name,
      contactName: row.contact_name,
      email: row.email,
      phone: row.phone,
      serviceType: row.service_type,
      hourlyRate: row.hourly_rate ? row.hourly_rate / 100 : 0,
      rating: row.rating || null,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    );
  }
}

// PATCH /api/vendors/[id] - Update vendor
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

    if (data.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(data.name);
    }

    if (data.contactName !== undefined) {
      updateFields.push('contact_name = ?');
      updateValues.push(data.contactName);
    }

    if (data.email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(data.email);
    }

    if (data.phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(data.phone);
    }

    if (data.serviceType !== undefined) {
      updateFields.push('service_type = ?');
      updateValues.push(data.serviceType);
    }

    if (data.hourlyRate !== undefined) {
      updateFields.push('hourly_rate = ?');
      updateValues.push(Math.round(data.hourlyRate * 100));
    }

    if (data.rating !== undefined) {
      updateFields.push('rating = ?');
      updateValues.push(data.rating);
    }

    if (data.isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(data.isActive ? 1 : 0);
    }

    updateFields.push('updated_at = ?');
    updateValues.push(now);
    updateValues.push(id);

    await query(
      `UPDATE vendors 
       SET ${updateFields.join(', ')} 
       WHERE id = ?`,
      updateValues
    );

    const rows = await query(`SELECT * FROM vendors WHERE id = ?`, [id]);
    const row = rows[0];

    return NextResponse.json({
      id: row.id,
      name: row.name,
      contactName: row.contact_name,
      email: row.email,
      phone: row.phone,
      serviceType: row.service_type,
      hourlyRate: row.hourly_rate ? row.hourly_rate / 100 : 0,
      rating: row.rating || null,
      isActive: row.is_active === 1,
      updatedAt: row.updated_at,
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    );
  }
}

