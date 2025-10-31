import { NextRequest, NextResponse } from 'next/server';
import { sendGridService } from '@/lib/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Validate required fields
    if (!type || !data || !data.to) {
      return NextResponse.json(
        { error: 'Missing required fields: type, data, and data.to' },
        { status: 400 }
      );
    }

    let success = false;

    // Route to appropriate email function based on type
    switch (type) {
      case 'rent-reminder':
        success = await sendGridService.sendRentReminder(data);
        break;
      
      case 'maintenance-confirmation':
        success = await sendGridService.sendMaintenanceConfirmation(data);
        break;
      
      case 'lease-renewal':
        success = await sendGridService.sendLeaseRenewalNotice(data);
        break;
      
      case 'inspection-notice':
        success = await sendGridService.sendInspectionNotice(data);
        break;
      
      case 'welcome':
        success = await sendGridService.sendWelcomeEmail(data);
        break;
      
      case 'custom':
        success = await sendGridService.sendCustomMessage(data);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid email type. Supported types: rent-reminder, maintenance-confirmation, lease-renewal, inspection-notice, welcome, custom' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json(
        { message: 'Email sent successfully', type },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to check if SendGrid is configured
export async function GET() {
  const isConfigured = !!process.env.SENDGRID_API_KEY;
  
  return NextResponse.json({
    configured: isConfigured,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@rentflow.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'RentFlow',
  });
}

