import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface PasswordResetEmail {
  to: string;
  resetToken: string;
  userName?: string;
}

export async function sendPasswordResetEmail({ to, resetToken, userName }: PasswordResetEmail) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - simulating email send');
    return { success: true, message: 'Email simulation successful' };
  }

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@rentflow.com',
    subject: 'Reset Your RentFlow Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">RentFlow</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Property & Trailer Park Management</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">Password Reset Request</h2>
          
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
            ${userName ? `Hi ${userName},` : 'Hello,'}
          </p>
          
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
            We received a request to reset your password for your RentFlow account. If you made this request, click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #059669, #10b981); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600; 
                      display: inline-block;">
              Reset My Password
            </a>
          </div>
          
          <p style="color: #64748b; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="color: #3b82f6; word-break: break-all; font-size: 14px; margin: 5px 0 0 0;">
            ${resetUrl}
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              This link will expire in 1 hour for security reasons.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 5px 0 0 0;">
              If you didn't request this password reset, please ignore this email.
            </p>
          </div>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            © 2024 RentFlow. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, message: 'Failed to send password reset email' };
  }
}

export async function sendWelcomeEmail({ to, userName, userRole }: { to: string; userName: string; userRole: string }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured - simulating welcome email');
    return { success: true, message: 'Welcome email simulation successful' };
  }

  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;
  
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@rentflow.com',
    subject: 'Welcome to RentFlow!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">RentFlow</h1>
          <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Property & Trailer Park Management</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin: 0 0 20px 0;">Welcome to RentFlow!</h2>
          
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
            Hi ${userName},
          </p>
          
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
            Welcome to RentFlow! Your account has been successfully created as a <strong>${userRole === 'manager' ? 'Property Manager' : 'Renter/Tenant'}</strong>.
          </p>
          
          <p style="color: #64748b; line-height: 1.6; margin: 0 0 20px 0;">
            You can now access your dashboard and start managing your ${userRole === 'manager' ? 'properties' : 'rental information'}.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" 
               style="background: linear-gradient(135deg, #059669, #10b981); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: 600; 
                      display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              If you have any questions, please don't hesitate to contact our support team.
            </p>
          </div>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            © 2024 RentFlow. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
    return { success: true, message: 'Welcome email sent successfully' };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: false, message: 'Failed to send welcome email' };
  }
}
