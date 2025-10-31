import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';
import { sendGridService } from '@/lib/sendgrid';

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

// POST /api/payments/dunning/process - Process dunning flow for overdue payments
export async function PUT(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { invoiceId, leaseId, tenantEmail, tenantName, amount, dueDate } = data;

    if (!invoiceId || !dueDate || !amount) {
      return NextResponse.json(
        { error: 'Invoice ID, due date, and amount are required' },
        { status: 400 }
      );
    }

    // Get dunning settings
    const settingsRows = await query(
      `SELECT * FROM dunning_settings WHERE organization_id = ? AND is_active = 1`,
      [data.organizationId || 'org_1']
    );

    const settings = settingsRows[0] || {
      first_notice_days: 3,
      second_notice_days: 7,
      third_notice_days: 14,
      final_notice_days: 30,
    };

    const due = new Date(dueDate);
    const now = new Date();
    const daysLate = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));

    let noticeLevel = 0;
    let noticeType = '';

    if (daysLate >= settings.final_notice_days) {
      noticeLevel = 4;
      noticeType = 'final';
    } else if (daysLate >= settings.third_notice_days) {
      noticeLevel = 3;
      noticeType = 'third';
    } else if (daysLate >= settings.second_notice_days) {
      noticeLevel = 2;
      noticeType = 'second';
    } else if (daysLate >= settings.first_notice_days) {
      noticeLevel = 1;
      noticeType = 'first';
    }

    if (noticeLevel > 0 && tenantEmail) {
      // Send dunning notice
      const subject = `Payment Overdue - ${noticeType.charAt(0).toUpperCase() + noticeType.slice(1)} Notice`;
      const body = `Dear ${tenantName || 'Tenant'},\n\nYour payment of $${(amount / 100).toFixed(2)} is ${daysLate} days overdue. Please make payment immediately to avoid further action.\n\nThank you.`;

      await sendGridService.sendCustomMessage({
        to: tenantEmail,
        subject,
        customMessage: body,
      });
    }

    return NextResponse.json({
      noticeLevel,
      noticeType,
      daysLate,
      message: noticeLevel > 0 ? `${noticeType} notice sent` : 'No notice needed',
    });
  } catch (error) {
    console.error('Error processing dunning:', error);
    return NextResponse.json(
      { error: 'Failed to process dunning flow' },
      { status: 500 }
    );
  }
}

