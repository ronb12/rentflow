import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/vendors - List all vendors
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get('serviceType');
    const isActive = searchParams.get('isActive');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM vendors WHERE organization_id = ?`;
    const params: any[] = [organizationId];

    if (serviceType) {
      sql += ` AND service_type = ?`;
      params.push(serviceType);
    }

    if (isActive !== null) {
      sql += ` AND is_active = ?`;
      params.push(isActive === 'true' ? 1 : 0);
    }

    sql += ` ORDER BY name ASC`;

    const rows = await query(sql, params);

    const vendors = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      contactName: row.contact_name,
      email: row.email,
      phone: row.phone,
      serviceType: row.service_type,
      hourlyRate: row.hourly_rate || 0,
      rating: row.rating || null,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ vendors });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    
    if (!data.name) {
      return NextResponse.json(
        { error: 'Vendor name is required' },
        { status: 400 }
      );
    }

    const id = `vnd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();

    await query(
      `INSERT INTO vendors 
       (id, name, contact_name, email, phone, service_type, hourly_rate, rating, 
        is_active, organization_id, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name,
        data.contactName || null,
        data.email || null,
        data.phone || null,
        data.serviceType || null,
        data.hourlyRate ? Math.round(data.hourlyRate * 100) : null,
        data.rating || null,
        data.isActive !== false ? 1 : 0,
        data.organizationId || 'org_1',
        now,
        now,
      ]
    );

    return NextResponse.json({
      id,
      name: data.name,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      serviceType: data.serviceType,
      hourlyRate: data.hourlyRate,
      rating: data.rating,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    return NextResponse.json(
      { error: 'Failed to create vendor' },
      { status: 500 }
    );
  }
}

