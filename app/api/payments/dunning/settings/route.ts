import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// GET /api/payments/dunning/settings - Get dunning settings
export async function GET(request: NextRequest) {
  try {
    await ensureSchema();
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || 'org_1';

    const rows = await query(
      `SELECT * FROM dunning_settings WHERE organization_id = ? AND is_active = 1`,
      [organizationId]
    );

    if (rows.length === 0) {
      // Return defaults
      return NextResponse.json({
        firstNoticeDays: 3,
        secondNoticeDays: 7,
        thirdNoticeDays: 14,
        finalNoticeDays: 30,
      });
    }

    const settings = rows[0];
    return NextResponse.json({
      id: settings.id,
      firstNoticeDays: settings.first_notice_days || 3,
      secondNoticeDays: settings.second_notice_days || 7,
      thirdNoticeDays: settings.third_notice_days || 14,
      finalNoticeDays: settings.final_notice_days || 30,
    });
  } catch (error) {
    console.error('Error fetching dunning settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dunning settings' },
      { status: 500 }
    );
  }
}

// POST /api/payments/dunning/settings - Update dunning settings
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const organizationId = data.organizationId || 'org_1';

    // Check if settings exist
    const existingRows = await query(
      `SELECT id FROM dunning_settings WHERE organization_id = ?`,
      [organizationId]
    );

    const now = Date.now();

    if (existingRows.length > 0) {
      // Update existing
      const id = existingRows[0].id;
      await query(
        `UPDATE dunning_settings 
         SET first_notice_days = ?, second_notice_days = ?, third_notice_days = ?, 
             final_notice_days = ?, updated_at = ?
         WHERE id = ?`,
        [
          data.firstNoticeDays || 3,
          data.secondNoticeDays || 7,
          data.thirdNoticeDays || 14,
          data.finalNoticeDays || 30,
          now,
          id,
        ]
      );
      return NextResponse.json({ id, ...data });
    } else {
      // Create new
      const id = `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await query(
        `INSERT INTO dunning_settings 
         (id, organization_id, first_notice_days, second_notice_days, third_notice_days, 
          final_notice_days, is_active, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          organizationId,
          data.firstNoticeDays || 3,
          data.secondNoticeDays || 7,
          data.thirdNoticeDays || 14,
          data.finalNoticeDays || 30,
          1,
          now,
          now,
        ]
      );
      return NextResponse.json({ id, ...data });
    }
  } catch (error) {
    console.error('Error saving dunning settings:', error);
    return NextResponse.json(
      { error: 'Failed to save dunning settings' },
      { status: 500 }
    );
  }
}

