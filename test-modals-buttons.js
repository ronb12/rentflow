const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3004';

async function testModalsAndButtons() {
  console.log('🚀 Starting modal and button functionality tests...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100, // Slow down for visibility
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const results = {
    passed: [],
    failed: []
  };

  try {
    // Helper function to test modal
    async function testModal(buttonSelector, modalSelector, testName) {
      try {
        console.log(`Testing: ${testName}`);
        await page.waitForSelector(buttonSelector, { timeout: 5000 });
        await page.click(buttonSelector);
        await page.waitForSelector(modalSelector, { timeout: 3000 });
        console.log(`  ✅ ${testName} - Modal opened`);
        
        // Try to close modal (look for close button or backdrop click)
        const closeButton = await page.$('button[aria-label="Close"], button:has-text("Cancel"), button:has-text("×")');
        if (closeButton) {
          await closeButton.click();
          await new Promise(resolve => setTimeout(resolve, 300));
        } else {
          // Try ESC key
          await page.keyboard.press('Escape');
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        results.passed.push(testName);
      } catch (error) {
        console.log(`  ❌ ${testName} - ${error.message}`);
        results.failed.push({ test: testName, error: error.message });
      }
    }

    // Navigate to dashboard
    console.log('\n📍 Navigating to dashboard...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 10000 });
        await new Promise(resolve => setTimeout(resolve, 2000));

    // Test Tenants Page
    console.log('\n📋 Testing Tenants Page...');
    await page.goto(`${BASE_URL}/dashboard/tenants`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    await testModal('button:has-text("Add Tenant"), button:has-text("Add")', '[role="dialog"]', 'Add Tenant Modal');

    // Test Properties Page
    console.log('\n🏢 Testing Properties Page...');
    await page.goto(`${BASE_URL}/dashboard/properties`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    await testModal('button:has-text("Add Property"), button:has-text("Add")', '[role="dialog"]', 'Add Property Modal');

    // Test Leases Page
    console.log('\n📄 Testing Leases Page...');
    await page.goto(`${BASE_URL}/dashboard/leases`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    await testModal('button:has-text("Add Lease"), button:has-text("Add")', '[role="dialog"]', 'Add Lease Modal');

    // Test Documents Page
    console.log('\n📁 Testing Documents Page...');
    await page.goto(`${BASE_URL}/dashboard/documents`, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test Upload Document Modal
    await testModal('button:has-text("Upload"), button:has-text("Upload Document")', '[role="dialog"]', 'Upload Document Modal');
    
    // Test Create Document Modal
        await new Promise(resolve => setTimeout(resolve, 500));
    await testModal('button:has-text("Create"), button:has-text("Create Document")', '[role="dialog"]', 'Create Document Modal');

    // Test Invoices Page
    console.log('\n💰 Testing Invoices Page...');
    await page.goto(`${BASE_URL}/dashboard/invoices`, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test invoice view/edit buttons (if invoices exist)
    const viewButtons = await page.$$('button:has-text("View"), button:has-text("Edit")');
    if (viewButtons.length > 0) {
      try {
        await viewButtons[0].click();
        await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
        console.log('  ✅ Invoice View/Edit Modal opened');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
        results.passed.push('Invoice View/Edit Modal');
      } catch (error) {
        console.log(`  ❌ Invoice View/Edit Modal - ${error.message}`);
        results.failed.push({ test: 'Invoice View/Edit Modal', error: error.message });
      }
    }

    // Test Payments Page
    console.log('\n💳 Testing Payments Page...');
    await page.goto(`${BASE_URL}/dashboard/payments`, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(1000);
    
    // Test Add Payment button
    const addPaymentBtn = await page.$('button:has-text("Add Payment"), button:has-text("Add")');
    if (addPaymentBtn) {
      await testModal('button:has-text("Add Payment"), button:has-text("Add")', '[role="dialog"]', 'Add Payment Modal');
    }

    // Test Navigation buttons
    console.log('\n🧭 Testing Navigation Buttons...');
    const navLinks = ['/dashboard', '/dashboard/tenants', '/dashboard/properties', '/dashboard/leases'];
    for (const link of navLinks) {
      try {
        await page.goto(`${BASE_URL}${link}`, { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pageTitle = await page.$eval('h1', el => el.textContent).catch(() => '');
        console.log(`  ✅ Navigation to ${link} - ${pageTitle}`);
        results.passed.push(`Navigation: ${link}`);
      } catch (error) {
        console.log(`  ❌ Navigation to ${link} - ${error.message}`);
        results.failed.push({ test: `Navigation: ${link}`, error: error.message });
      }
    }

    // Print summary
    console.log('\n\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    
    if (results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      results.failed.forEach(({ test, error }) => {
        console.log(`  - ${test}: ${error}`);
      });
    }
    
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => {
      console.log(`  - ${test}`);
    });
    
    return results;

  } catch (error) {
    console.error('❌ Test suite error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run tests
testModalsAndButtons()
  .then(results => {
    const exitCode = results.failed.length > 0 ? 1 : 0;
    console.log(`\n\nTests completed. Exit code: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

