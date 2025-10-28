// Simple test to check manager functionality
import puppeteer from 'puppeteer';

async function testManagerFunctionality() {
  console.log('🧪 Testing Manager Functionality...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Test direct navigation to manager dashboard
    console.log('1. Testing direct manager dashboard access...');
    await page.goto('http://localhost:3004/dashboard?role=manager');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    // Check page content
    const h1Elements = await page.$$eval('h1', els => els.map(el => el.textContent));
    console.log('H1 elements:', h1Elements);
    
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('Body contains "Property Management":', bodyText?.includes('Property Management'));
    console.log('Body contains "Manager":', bodyText?.includes('Manager'));
    console.log('Body contains "Properties":', bodyText?.includes('Properties'));
    console.log('Body contains "Tenants":', bodyText?.includes('Tenants'));
    
    // Test manager-specific pages
    console.log('\n2. Testing manager-specific pages...');
    
    const managerPages = [
      '/dashboard/properties',
      '/dashboard/tenants', 
      '/dashboard/leases',
      '/dashboard/invoices',
      '/dashboard/inspections',
      '/dashboard/work-orders',
      '/dashboard/reports'
    ];
    
    for (const pagePath of managerPages) {
      try {
        console.log(`Testing ${pagePath}...`);
        await page.goto(`http://localhost:3004${pagePath}?role=manager`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const pageH1s = await page.$$eval('h1', els => els.map(el => el.textContent));
        console.log(`  ${pagePath}: ${pageH1s.join(', ')}`);
      } catch (error) {
        console.log(`  ${pagePath}: Error - ${error}`);
      }
    }
    
    // Test login with different approach
    console.log('\n3. Testing manager login...');
    await page.goto('http://localhost:3004/login');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Fill credentials
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
      if (emailInput && passwordInput) {
        emailInput.value = 'manager@example.com';
        passwordInput.value = 'Manager!234';
      }
    });
    
    // Submit form
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const loginUrl = page.url();
    console.log('After login URL:', loginUrl);
    
    if (loginUrl.includes('/dashboard')) {
      console.log('✅ Manager login successful!');
      
      // Check if manager content is shown
      const managerContent = await page.evaluate(() => {
        const bodyText = document.body.textContent || '';
        return {
          hasPropertyManagement: bodyText.includes('Property Management'),
          hasManagerDashboard: bodyText.includes('Manager Dashboard'),
          hasProperties: bodyText.includes('Properties'),
          hasTenants: bodyText.includes('Tenants'),
          hasLeases: bodyText.includes('Leases'),
          hasInvoices: bodyText.includes('Invoices'),
          hasInspections: bodyText.includes('Inspections'),
          hasWorkOrders: bodyText.includes('Work Orders'),
          hasReports: bodyText.includes('Reports')
        };
      });
      
      console.log('Manager content check:', managerContent);
      
      const managerFeatures = Object.values(managerContent).filter(Boolean).length;
      console.log(`Manager features found: ${managerFeatures}/9`);
      
      if (managerFeatures >= 5) {
        console.log('✅ Manager functionality working!');
      } else {
        console.log('⚠️ Manager functionality may have issues');
      }
      
    } else {
      console.log('❌ Manager login failed');
    }
    
  } catch (error) {
    console.error('❌ Manager test failed:', error);
  } finally {
    await browser.close();
  }
}

testManagerFunctionality().catch(console.error);
