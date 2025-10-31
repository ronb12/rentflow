// Test SendGrid integration
const testEmail = async () => {
  try {
    const response = await fetch('http://localhost:3004/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'custom',
        data: {
          to: 'test@example.com', // Replace with your email for testing
          subject: 'SendGrid Test Email',
          customMessage: 'This is a test email to verify SendGrid integration is working correctly in RentFlow!'
        }
      })
    });

    const result = await response.json();
    console.log('Email API Response:', result);
    
    if (response.ok) {
      console.log('✅ SendGrid integration is working!');
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

testEmail();
