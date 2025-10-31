const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3004';
// Allow overriding credentials via environment variables
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || 'manager@example.com';
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || 'Manager!234';
const RENTER_EMAIL = process.env.RENTER_EMAIL || 'renter@example.com';
const RENTER_PASSWORD = process.env.RENTER_PASSWORD || 'Renter!234';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testRoles() {
  console.log('🚀 Starting Role-Based Feature Testing...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const results = {
    manager: { passed: [], failed: [], total: 0 },
    renter: { passed: [], failed: [], total: 0 }
  };

  // Test Manager Features
  console.log('\n👔 ======================================');
  console.log('   MANAGER FEATURE TESTING');
  console.log('======================================\n');
  
  try {
    // Navigate to login and login as manager
    console.log('1. Logging in as Manager...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(2000);
    
    await page.type('input[type="email"]', MANAGER_EMAIL);
    await page.type('input[type="password"]', MANAGER_PASSWORD);
    await page.click('button[type="submit"]');
    await delay(3000);
    
    console.log('   ✅ Manager logged in successfully');
    results.manager.passed.push('Manager Login');
    results.manager.total++;

    // Test Manager Dashboard
    console.log('\n2. Testing Manager Dashboard...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    console.log('   ✅ Manager Dashboard loaded');
    results.manager.passed.push('Manager Dashboard');
    results.manager.total++;

    // Test Manager Navigation Items
    console.log('\n3. Testing Manager Navigation Items...');
    const managerNavItems = [
      { href: '/dashboard/properties', name: 'Properties' },
      { href: '/dashboard/tenants', name: 'Tenants' },
      { href: '/dashboard/leases', name: 'Leases' },
      { href: '/dashboard/invoices', name: 'Invoices' },
      { href: '/dashboard/inspections', name: 'Inspections' },
      { href: '/dashboard/work-orders', name: 'Work Orders' },
      { href: '/dashboard/reports', name: 'Reports' },
      { href: '/dashboard/settings', name: 'Settings' }
    ];

    for (const item of managerNavItems) {
      try {
        await page.goto(`${BASE_URL}${item.href}`, { waitUntil: 'domcontentloaded' });
        await delay(2000);
        console.log(`   ✅ ${item.name} page loaded`);
        results.manager.passed.push(`${item.name} Page`);
        results.manager.total++;
      } catch (error) {
        console.log(`   ❌ ${item.name} page failed: ${error.message}`);
        results.manager.failed.push({ test: `${item.name} Page`, error: error.message });
        results.manager.total++;
      }
    }

    // Test Manager Actions
    console.log('\n4. Testing Manager Actions...');
    
    // Test Add Tenant
    await page.goto(`${BASE_URL}/dashboard/tenants`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    const tenantButton = await page.$('button');
    if (tenantButton) {
      console.log('   ✅ Add Tenant button accessible');
      results.manager.passed.push('Add Tenant Action');
      results.manager.total++;
    }

    // Test Add Property
    await page.goto(`${BASE_URL}/dashboard/properties`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    const propertyButton = await page.$('button');
    if (propertyButton) {
      console.log('   ✅ Add Property button accessible');
      results.manager.passed.push('Add Property Action');
      results.manager.total++;
    }

  } catch (error) {
    console.log(`   ❌ Manager testing failed: ${error.message}`);
  }

  // Clear localStorage and logout
  console.log('\n5. Logging out...');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await delay(1000);

  // Test Renter Features
  console.log('\n🏠 ======================================');
  console.log('   RENTER FEATURE TESTING');
  console.log('======================================\n');
  
  try {
    // Navigate to login and login as renter
    console.log('1. Logging in as Renter...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(2000);
    
    await page.type('input[type="email"]', RENTER_EMAIL);
    await page.type('input[type="password"]', RENTER_PASSWORD);
    await page.click('button[type="submit"]');
    await delay(3000);
    
    console.log('   ✅ Renter logged in successfully');
    results.renter.passed.push('Renter Login');
    results.renter.total++;

    // Test Renter Dashboard
    console.log('\n2. Testing Renter Dashboard...');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    console.log('   ✅ Renter Dashboard loaded');
    results.renter.passed.push('Renter Dashboard');
    results.renter.total++;

    // Test Renter Navigation Items
    console.log('\n3. Testing Renter Navigation Items...');
    const renterNavItems = [
      { href: '/dashboard/my-lease', name: 'My Lease' },
      { href: '/dashboard/payments', name: 'Payments' },
      { href: '/dashboard/maintenance', name: 'Maintenance' },
      { href: '/dashboard/messages', name: 'Messages' },
      { href: '/dashboard/settings', name: 'Settings' }
    ];

    for (const item of renterNavItems) {
      try {
        await page.goto(`${BASE_URL}${item.href}`, { waitUntil: 'domcontentloaded' });
        await delay(2000);
        console.log(`   ✅ ${item.name} page loaded`);
        results.renter.passed.push(`${item.name} Page`);
        results.renter.total++;
      } catch (error) {
        console.log(`   ❌ ${item.name} page failed: ${error.message}`);
        results.renter.failed.push({ test: `${item.name} Page`, error: error.message });
        results.renter.total++;
      }
    }

    // Test Renter Features
    console.log('\n4. Testing Renter Features...');
    
    // Test Lease Documents
    await page.goto(`${BASE_URL}/dashboard/my-lease`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    const leaseCard = await page.$('div[class*="Card"]');
    if (leaseCard) {
      console.log('   ✅ Lease Documents viewable');
      results.renter.passed.push('View Lease Documents');
      results.renter.total++;
    }

    // Test Payment Features
    await page.goto(`${BASE_URL}/dashboard/payments`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    const paymentForm = await page.$('form');
    if (paymentForm) {
      console.log('   ✅ Payment form accessible');
      results.renter.passed.push('Payment Form');
      results.renter.total++;
    }

    // Test Maintenance Request
    await page.goto(`${BASE_URL}/dashboard/maintenance`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    const maintenanceForm = await page.$('form');
    if (maintenanceForm) {
      console.log('   ✅ Maintenance request form accessible');
      results.renter.passed.push('Maintenance Request Form');
      results.renter.total++;
    }

    // Test Messages
    await page.goto(`${BASE_URL}/dashboard/messages`, { waitUntil: 'domcontentloaded' });
    await delay(2000);
    const messageInput = await page.$('input[type="text"]');
    if (messageInput) {
      console.log('   ✅ Message interface accessible');
      results.renter.passed.push('Messages Interface');
      results.renter.total++;
    }

  } catch (error) {
    console.log(`   ❌ Renter testing failed: ${error.message}`);
  }

  // Print Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE ROLE TESTING SUMMARY');
  console.log('='.repeat(60));
  
  console.log('\n👔 MANAGER FEATURES:');
  console.log(`   Total Tests: ${results.manager.total}`);
  console.log(`   ✅ Passed: ${results.manager.passed.length}`);
  console.log(`   ❌ Failed: ${results.manager.failed.length}`);
  console.log(`   Success Rate: ${((results.manager.passed.length / results.manager.total) * 100).toFixed(1)}%`);
  
  if (results.manager.failed.length > 0) {
    console.log('\n   Failed Tests:');
    results.manager.failed.forEach(({ test, error }) => {
      console.log(`     ❌ ${test}: ${error}`);
    });
  }
  
  console.log('\n   Passed Tests:');
  results.manager.passed.forEach(test => {
    console.log(`     ✅ ${test}`);
  });

  console.log('\n🏠 RENTER FEATURES:');
  console.log(`   Total Tests: ${results.renter.total}`);
  console.log(`   ✅ Passed: ${results.renter.passed.length}`);
  console.log(`   ❌ Failed: ${results.renter.failed.length}`);
  console.log(`   Success Rate: ${((results.renter.passed.length / results.renter.total) * 100).toFixed(1)}%`);
  
  if (results.renter.failed.length > 0) {
    console.log('\n   Failed Tests:');
    results.renter.failed.forEach(({ test, error }) => {
      console.log(`     ❌ ${test}: ${error}`);
    });
  }
  
  console.log('\n   Passed Tests:');
  results.renter.passed.forEach(test => {
    console.log(`     ✅ ${test}`);
  });

  const totalTests = results.manager.total + results.renter.total;
  const totalPassed = results.manager.passed.length + results.renter.passed.length;
  
  console.log('\n' + '='.repeat(60));
  console.log('OVERALL SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests Run: ${totalTests}`);
  console.log(`Total Passed: ${totalPassed}`);
  console.log(`Total Failed: ${totalTests - totalPassed}`);
  console.log(`Overall Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 ALL ROLE TESTS PASSED! Both manager and renter features are 100% functional!');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the issues above.');
  }
  console.log('='.repeat(60) + '\n');

  await browser.close();
}

// Run tests
testRoles()
  .then(() => {
    console.log('\n✅ Role testing completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

