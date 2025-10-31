import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/notifications/preferences - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const tenantId = searchParams.get('tenantId');
    const organizationId = searchParams.get('organizationId') || 'org_1';

    let sql = `SELECT * FROM notification_preferences WHERE organization_id = ?`;
    const params: any[] = [organizationId];

    if (userId) {
      sql += ` AND user_id = ?`;
      params.push(userId);
    }

    if (tenantId) {
      sql += ` AND tenant_id = ?`;
      params.push(tenantId);
    }

    const rows = await query(sql, params);

    const preferences = rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      tenantId: row.tenant_id,
      emailEnabled: row.email_enabled === 1,
      smsEnabled: row.sms_enabled === 1,
      rentDueReminder: row.rent_due_reminder === 1,
      lateNotice: row.late_notice === 1,
      maintenanceUpdate: row.maintenance_update === 1,
      documentSigning: row.document_signing === 1,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/preferences - Create or update preferences
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { userId, tenantId, organizationId = 'org_1' } = data;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if preference exists
    const existingRows = await query(
      `SELECT id FROM notification_preferences 
       WHERE user_id = ? AND tenant_id = ? AND organization_id = ?`,
      [userId, tenantId || null, organizationId]
    );

    const now = Date.now();

    if (existingRows.length > 0) {
      // Update existing
      const id = existingRows[0].id;
      await query(
        `UPDATE notification_preferences 
         SET email_enabled = ?, sms_enabled = ?, rent_due_reminder = ?, 
             late_notice = ?, maintenance_update = ?, document_signing = ?, 
             updated_at = ?
         WHERE id = ?`,
        [
          data.emailEnabled !== false ? 1 : 0,
          data.smsEnabled === true ? 1 : 0,
          data.rentDueReminder !== false ? 1 : 0,
          data.lateNotice !== false ? 1 : 0,
          data.maintenanceUpdate !== false ? 1 : 0,
          data.documentSigning !== false ? 1 : 0,
          now,
          id,
        ]
      );

      return NextResponse.json({ id, ...data });
    } else {
      // Create new
      const id = `np_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await query(
        `INSERT INTO notification_preferences 
         (id, user_id, tenant_id, email_enabled, sms_enabled, rent_due_reminder, 
          late_notice, maintenance_update, document_signing, organization_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userId,
          tenantId || null,
          data.emailEnabled !== false ? 1 : 0,
          data.smsEnabled === true ? 1 : 0,
          data.rentDueReminder !== false ? 1 : 0,
          data.lateNotice !== false ? 1 : 0,
          data.maintenanceUpdate !== false ? 1 : 0,
          data.documentSigning !== false ? 1 : 0,
          organizationId,
          now,
          now,
        ]
      );

      return NextResponse.json({ id, ...data });
    }
  } catch (error) {
    console.error('Error saving notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save notification preferences' },
      { status: 500 }
    );
  }
}

