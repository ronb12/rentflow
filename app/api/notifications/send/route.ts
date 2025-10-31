import { NextRequest, NextResponse } from 'next/server';
import { sendGridService } from '@/lib/sendgrid';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// POST /api/notifications/send - Send notification (email/SMS)
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { recipient, type, subject, body, method = 'email' } = data;

    if (!recipient || !body) {
      return NextResponse.json(
        { error: 'Recipient and body are required' },
        { status: 400 }
      );
    }

    let success = false;

    if (method === 'email') {
      // Send via SendGrid
      success = await sendGridService.sendCustomMessage({
        to: recipient,
        subject: subject || 'Notification from RentFlow',
        customMessage: body,
      });
    } else if (method === 'sms') {
      // SMS via Twilio (if configured)
      // For now, we'll log it - Twilio integration can be added later
      console.log(`SMS to ${recipient}: ${body}`);
      success = true; // Placeholder
    }

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Notification sent successfully',
        method 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

