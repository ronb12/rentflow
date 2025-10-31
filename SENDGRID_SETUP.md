# SendGrid Email Integration for RentFlow

This document explains how to set up and use the SendGrid email integration in your RentFlow application.

## Setup Instructions

### 1. Get SendGrid API Key

1. Sign up for a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Go to Settings → API Keys
3. Create a new API key with "Full Access" permissions
4. Copy the API key

### 2. Configure Environment Variables

Add these variables to your `.env.local` file:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=RentFlow
```

**Important:** Replace `yourdomain.com` with your actual domain. SendGrid requires verified sender domains for production use.

### 3. Verify Your Domain (Production)

For production use, you'll need to verify your domain in SendGrid:
1. Go to Settings → Sender Authentication
2. Follow the domain verification process
3. Update your `SENDGRID_FROM_EMAIL` to use your verified domain

## Usage Examples

### 1. Using the React Hook

```tsx
import { useEmail } from '@/hooks/useEmail';

function TenantCard({ tenant }) {
  const { sendEmail, isLoading, error } = useEmail();

  const handleSendRentReminder = async () => {
    const success = await sendEmail('rent-reminder', {
      to: tenant.email,
      tenantName: tenant.name,
      propertyAddress: tenant.property_address,
      amount: '1200',
      dueDate: '2024-02-01',
      landlordName: 'Property Management'
    });

    if (success) {
      alert('Rent reminder sent!');
    }
  };

  return (
    <div>
      <button 
        onClick={handleSendRentReminder}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Rent Reminder'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
```

### 2. Using Utility Functions

```tsx
import { emailUtils } from '@/hooks/useEmail';

// Send rent reminder
await emailUtils.sendRentReminder('tenant@example.com', {
  tenantName: 'John Doe',
  propertyAddress: '123 Main St',
  amount: '1200',
  dueDate: '2024-02-01'
});

// Send maintenance confirmation
await emailUtils.sendMaintenanceConfirmation('tenant@example.com', {
  tenantName: 'John Doe',
  propertyAddress: '123 Main St',
  maintenanceRequestId: 'MR-2024-001'
});
```

### 3. Using the EmailForm Component

```tsx
import { EmailForm } from '@/components/EmailForm';

function TenantDetailPage({ tenant }) {
  return (
    <div>
      <h1>Tenant Details</h1>
      <EmailForm
        tenantEmail={tenant.email}
        tenantName={tenant.name}
        propertyAddress={tenant.property_address}
        landlordName="Property Management"
      />
    </div>
  );
}
```

### 4. Direct API Usage

```javascript
// Send rent reminder
const response = await fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'rent-reminder',
    data: {
      to: 'tenant@example.com',
      tenantName: 'John Doe',
      propertyAddress: '123 Main St',
      amount: '1200',
      dueDate: '2024-02-01'
    }
  })
});

// Send custom message
const response = await fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'custom',
    data: {
      to: 'tenant@example.com',
      tenantName: 'John Doe',
      subject: 'Important Notice',
      customMessage: 'Your lease renewal is due next month.'
    }
  })
});
```

## Available Email Types

### 1. Rent Reminder (`rent-reminder`)
- **Required fields:** `to`, `amount`, `dueDate`
- **Optional fields:** `tenantName`, `propertyAddress`, `landlordName`

### 2. Maintenance Confirmation (`maintenance-confirmation`)
- **Required fields:** `to`, `maintenanceRequestId`
- **Optional fields:** `tenantName`, `propertyAddress`, `landlordName`

### 3. Lease Renewal Notice (`lease-renewal`)
- **Required fields:** `to`, `leaseEndDate`
- **Optional fields:** `tenantName`, `propertyAddress`, `landlordName`

### 4. Inspection Notice (`inspection-notice`)
- **Required fields:** `to`, `inspectionDate`
- **Optional fields:** `tenantName`, `propertyAddress`, `landlordName`

### 5. Welcome Email (`welcome`)
- **Required fields:** `to`
- **Optional fields:** `tenantName`, `propertyAddress`, `amount`, `dueDate`, `leaseStartDate`, `landlordName`

### 6. Custom Message (`custom`)
- **Required fields:** `to`, `subject`, `customMessage`
- **Optional fields:** `tenantName`, `propertyAddress`, `landlordName`

## Integration Examples

### Adding Email to Tenant Cards

```tsx
// In your tenants page
import { EmailForm } from '@/components/EmailForm';

function TenantCard({ tenant }) {
  const [showEmailForm, setShowEmailForm] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{tenant.first_name} {tenant.last_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{tenant.email}</p>
        <button onClick={() => setShowEmailForm(!showEmailForm)}>
          Send Email
        </button>
        {showEmailForm && (
          <EmailForm
            tenantEmail={tenant.email}
            tenantName={`${tenant.first_name} ${tenant.last_name}`}
            propertyAddress={tenant.property_address}
          />
        )}
      </CardContent>
    </Card>
  );
}
```

### Adding Email to Maintenance Requests

```tsx
// In your maintenance requests page
import { emailUtils } from '@/hooks/useEmail';

function MaintenanceRequestCard({ request }) {
  const handleSendConfirmation = async () => {
    await emailUtils.sendMaintenanceConfirmation(request.tenant_email, {
      tenantName: request.tenant_name,
      propertyAddress: request.property_address,
      maintenanceRequestId: request.id
    });
  };

  return (
    <Card>
      <CardContent>
        <p>Request: {request.description}</p>
        <button onClick={handleSendConfirmation}>
          Send Confirmation Email
        </button>
      </CardContent>
    </Card>
  );
}
```

## Testing

### Check SendGrid Configuration

```javascript
// GET /api/email
const response = await fetch('/api/email');
const config = await response.json();
console.log(config); // { configured: true, fromEmail: "...", fromName: "..." }
```

### Test Email Sending

```javascript
// Test with a simple custom message
const response = await fetch('/api/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'custom',
    data: {
      to: 'your-email@example.com',
      subject: 'Test Email',
      customMessage: 'This is a test email from RentFlow.'
    }
  })
});
```

## Troubleshooting

### Common Issues

1. **"Failed to send email" error**
   - Check that `SENDGRID_API_KEY` is set correctly
   - Verify the API key has proper permissions
   - Check SendGrid account status

2. **"Invalid sender" error**
   - Verify your domain in SendGrid
   - Use a verified sender email address
   - Check that `SENDGRID_FROM_EMAIL` matches your verified domain

3. **Emails not received**
   - Check spam folder
   - Verify recipient email address
   - Check SendGrid activity feed for delivery status

### Debug Mode

Add this to your environment variables for detailed logging:

```env
NODE_ENV=development
```

This will enable console logging for email sending attempts.

## Security Notes

- Never expose your SendGrid API key in client-side code
- Always validate email addresses before sending
- Consider rate limiting for email sending endpoints
- Use environment variables for all sensitive configuration

## Next Steps

1. Set up your SendGrid account and get an API key
2. Add the environment variables to your `.env.local` file
3. Test the email functionality using the examples above
4. Integrate email sending into your existing tenant and maintenance workflows
5. Customize email templates to match your brand

For more advanced features, consider:
- Email templates with dynamic content
- Email scheduling
- Email tracking and analytics
- Bulk email sending for announcements






