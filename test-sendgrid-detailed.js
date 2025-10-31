// Detailed SendGrid test with real email
const testEmail = async () => {
  console.log('🧪 Testing SendGrid Integration...\n');
  
  // Test 1: Check configuration
  console.log('1. Checking SendGrid configuration...');
  try {
    const configResponse = await fetch('http://localhost:3004/api/email');
    const config = await configResponse.json();
    console.log('   Configuration:', config);
    
    if (config.configured) {
      console.log('   ✅ SendGrid is configured\n');
    } else {
      console.log('   ❌ SendGrid is not configured\n');
      return;
    }
  } catch (error) {
    console.log('   ❌ Failed to check configuration:', error.message, '\n');
    return;
  }

  // Test 2: Send test email (replace with your email)
  console.log('2. Testing email sending...');
  console.log('   Note: Replace "your-email@example.com" with your actual email address');
  
  const testEmailAddress = 'your-email@example.com'; // CHANGE THIS TO YOUR EMAIL
  
  try {
    const response = await fetch('http://localhost:3004/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'custom',
        data: {
          to: testEmailAddress,
          subject: 'RentFlow SendGrid Test',
          customMessage: 'This is a test email from RentFlow to verify SendGrid integration is working correctly!'
        }
      })
    });

    const result = await response.json();
    console.log('   API Response:', result);
    
    if (response.ok) {
      console.log('   ✅ Email sent successfully!');
      console.log('   📧 Check your inbox for the test email');
    } else {
      console.log('   ❌ Email failed:', result.error);
    }
  } catch (error) {
    console.log('   ❌ Network error:', error.message);
  }
};

testEmail();
