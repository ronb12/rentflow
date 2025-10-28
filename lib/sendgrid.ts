import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: {
    email: string;
    name: string;
  };
}

export interface RentFlowEmailData {
  tenantName?: string;
  landlordName?: string;
  propertyAddress?: string;
  amount?: string;
  dueDate?: string;
  leaseEndDate?: string;
  maintenanceRequestId?: string;
  inspectionDate?: string;
  customMessage?: string;
  [key: string]: any;
}

class SendGridService {
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@rentflow.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'RentFlow';
  }

  /**
   * Send a basic email
   */
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      const msg = {
        to: template.to,
        from: template.from || {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: template.subject,
        text: template.text,
        html: template.html,
      };

      await sgMail.send(msg);
      console.log('Email sent successfully');
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send rent reminder email to tenant
   */
  async sendRentReminder(data: RentFlowEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Rent Reminder</h2>
        <p>Hello ${data.tenantName || 'Valued Tenant'},</p>
        <p>This is a friendly reminder that your rent payment of <strong>$${data.amount}</strong> is due on <strong>${data.dueDate}</strong>.</p>
        <p>Property: ${data.propertyAddress}</p>
        <p>Please ensure your payment is submitted on time to avoid any late fees.</p>
        <p>If you have already made your payment, please disregard this message.</p>
        <br>
        <p>Best regards,<br>${data.landlordName || 'Property Management'}</p>
        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: #666;">This is an automated message from RentFlow.</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to as string,
      subject: `Rent Reminder - Payment Due ${data.dueDate}`,
      html,
    });
  }

  /**
   * Send maintenance request confirmation
   */
  async sendMaintenanceConfirmation(data: RentFlowEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Maintenance Request Received</h2>
        <p>Hello ${data.tenantName || 'Valued Tenant'},</p>
        <p>We have received your maintenance request (ID: ${data.maintenanceRequestId}).</p>
        <p>Property: ${data.propertyAddress}</p>
        <p>Our maintenance team will review your request and contact you within 24-48 hours to schedule a visit.</p>
        <p>If this is an emergency, please call our emergency line immediately.</p>
        <br>
        <p>Thank you for your patience,<br>${data.landlordName || 'Property Management'}</p>
        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: #666;">This is an automated message from RentFlow.</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to as string,
      subject: `Maintenance Request Confirmation - ${data.maintenanceRequestId}`,
      html,
    });
  }

  /**
   * Send lease renewal notice
   */
  async sendLeaseRenewalNotice(data: RentFlowEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Lease Renewal Notice</h2>
        <p>Hello ${data.tenantName || 'Valued Tenant'},</p>
        <p>Your current lease for ${data.propertyAddress} is set to expire on <strong>${data.leaseEndDate}</strong>.</p>
        <p>We would like to offer you the opportunity to renew your lease. Please review the renewal terms and let us know your decision within 30 days.</p>
        <p>If you have any questions about the renewal terms or would like to discuss your options, please don't hesitate to contact us.</p>
        <br>
        <p>We appreciate having you as a tenant,<br>${data.landlordName || 'Property Management'}</p>
        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: #666;">This is an automated message from RentFlow.</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to as string,
      subject: `Lease Renewal Notice - ${data.propertyAddress}`,
      html,
    });
  }

  /**
   * Send inspection notice
   */
  async sendInspectionNotice(data: RentFlowEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Property Inspection Notice</h2>
        <p>Hello ${data.tenantName || 'Valued Tenant'},</p>
        <p>We have scheduled a property inspection for ${data.propertyAddress} on <strong>${data.inspectionDate}</strong>.</p>
        <p>Please ensure that:</p>
        <ul>
          <li>The property is accessible for inspection</li>
          <li>All areas are clean and tidy</li>
          <li>Any maintenance issues are reported beforehand</li>
        </ul>
        <p>If you need to reschedule or have any questions, please contact us as soon as possible.</p>
        <br>
        <p>Thank you for your cooperation,<br>${data.landlordName || 'Property Management'}</p>
        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: #666;">This is an automated message from RentFlow.</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to as string,
      subject: `Property Inspection Notice - ${data.inspectionDate}`,
      html,
    });
  }

  /**
   * Send custom message
   */
  async sendCustomMessage(data: RentFlowEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Message from Property Management</h2>
        <p>Hello ${data.tenantName || 'Valued Tenant'},</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          ${data.customMessage}
        </div>
        <p>Property: ${data.propertyAddress}</p>
        <br>
        <p>Best regards,<br>${data.landlordName || 'Property Management'}</p>
        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: #666;">This is an automated message from RentFlow.</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to as string,
      subject: data.subject || 'Message from Property Management',
      html,
    });
  }

  /**
   * Send welcome email to new tenant
   */
  async sendWelcomeEmail(data: RentFlowEmailData): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Your New Home!</h2>
        <p>Hello ${data.tenantName || 'New Tenant'},</p>
        <p>Welcome to ${data.propertyAddress}! We're excited to have you as our new tenant.</p>
        <p>Here are some important details for your move-in:</p>
        <ul>
          <li>Property Address: ${data.propertyAddress}</li>
          <li>Lease Start Date: ${data.leaseStartDate}</li>
          <li>Monthly Rent: $${data.amount}</li>
          <li>Rent Due Date: ${data.dueDate}</li>
        </ul>
        <p>Please make sure to:</p>
        <ul>
          <li>Complete your move-in inspection</li>
          <li>Set up utilities in your name</li>
          <li>Update your contact information</li>
          <li>Download the RentFlow app for easy communication</li>
        </ul>
        <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
        <br>
        <p>Welcome aboard!<br>${data.landlordName || 'Property Management'}</p>
        <hr style="margin-top: 30px;">
        <p style="font-size: 12px; color: #666;">This is an automated message from RentFlow.</p>
      </div>
    `;

    return this.sendEmail({
      to: data.to as string,
      subject: `Welcome to ${data.propertyAddress}!`,
      html,
    });
  }
}

export const sendGridService = new SendGridService();
export default sendGridService;
