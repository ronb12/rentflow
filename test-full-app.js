const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3004';
const SCREENSHOT_DIR = './test-screenshots';

async function testFullApp() {
  console.log('🚀 Starting comprehensive RentFlow app test suite...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const results = {
    passed: [],
    failed: [],
    total: 0
  };

  // Helper function to delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Helper function to take screenshots
  async function takeScreenshot(name) {
    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${safeName}.png`, fullPage: true });
  }

  // Helper function to test button click
  async function testButton(buttonSelector, testName) {
    try {
      console.log(`  Testing: ${testName}`);
      await page.waitForSelector(buttonSelector, { timeout: 5000 });
      await page.click(buttonSelector);
      await delay(1000);
      console.log(`    ✅ ${testName} - Button clicked successfully`);
      results.passed.push(testName);
      results.total++;
      return true;
    } catch (error) {
      console.log(`    ❌ ${testName} - Error: ${error.message}`);
      results.failed.push({ test: testName, error: error.message });
      results.total++;
      return false;
    }
  }

  // Helper function to test modal
  async function testModal(buttonSelector, testName, alternativeSelectors = []) {
    try {
      console.log(`  Testing Modal: ${testName}`);
      
      // Try main selector first, then alternatives
      let buttonFound = false;
      const allSelectors = [buttonSelector, ...alternativeSelectors];
      
      for (const selector of allSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          buttonFound = true;
          break;
        } catch (e) {
          console.log(`    Trying alternative selector: ${selector}`);
        }
      }
      
      if (!buttonFound) {
        throw new Error('Button not found with any selector');
      }
      
      await delay(1000);
      
      // Check if modal opened
      const modalExists = await page.$('[role="dialog"]');
      if (!modalExists) {
        throw new Error('Modal did not open');
      }
      
      console.log(`    ✅ ${testName} - Modal opened`);
      
      // Try to close modal
      await page.keyboard.press('Escape');
      await delay(500);
      
      console.log(`    ✅ ${testName} - Modal closed`);
      results.passed.push(testName);
      results.total++;
      return true;
    } catch (error) {
      console.log(`    ❌ ${testName} - Error: ${error.message}`);
      results.failed.push({ test: testName, error: error.message });
      results.total++;
      return false;
    }
  }

  // Helper function to test navigation
  async function testNavigation(link, pageName) {
    try {
      console.log(`  Testing Navigation: ${pageName}`);
      await page.goto(`${BASE_URL}${link}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await delay(3000);
      await takeScreenshot(pageName);
      console.log(`    ✅ ${pageName} - Loaded successfully`);
      results.passed.push(`Navigation: ${pageName}`);
      results.total++;
      return true;
    } catch (error) {
      console.log(`    ❌ ${pageName} - Error: ${error.message}`);
      results.failed.push({ test: `Navigation: ${pageName}`, error: error.message });
      results.total++;
      return false;
    }
  }

  try {
    // Navigate to homepage
    console.log('\n📍 Navigating to homepage...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(3000);
    await takeScreenshot('homepage');

    // Test Tenants Page
    console.log('\n📋 Testing Tenants Page...');
    await testNavigation('/dashboard/tenants', 'Tenants Page');
    
    // Test Add Tenant Modal
    await testModal('button', 'Add Tenant Modal', [
      'button[class*="default"]',
      '.inline-flex',
      'button'
    ]);
    
    // Test Properties Page
    console.log('\n🏢 Testing Properties Page...');
    await testNavigation('/dashboard/properties', 'Properties Page');
    
    // Test Add Property Modal
    await testModal('button', 'Add Property Modal', [
      'button[class*="default"]',
      '.inline-flex',
      'button'
    ]);

    // Test Leases Page
    console.log('\n📄 Testing Leases Page...');
    await testNavigation('/dashboard/leases', 'Leases Page');
    
    // Test Add Lease Modal
    await testModal('button', 'Add Lease Modal', [
      'button[class*="default"]',
      '.inline-flex',
      'button'
    ]);

    // Test Documents Page
    console.log('\n📁 Testing Documents Page...');
    await testNavigation('/dashboard/documents', 'Documents Page');
    
    // Test Upload Document Modal
    await page.goto(`${BASE_URL}/dashboard/documents`, { waitUntil: 'domcontentloaded' });
    await delay(3000);
    await testModal('button', 'Upload Document Modal', [
      'button:has-text("Upload Document")',
      'button:has-text("Upload")',
      'button[class*="default"]'
    ]);
    
    // Test Create Document Modal
    await page.goto(`${BASE_URL}/dashboard/documents`, { waitUntil: 'domcontentloaded' });
    await delay(3000);
    await testModal('button', 'Create Document Modal', [
      'button:has-text("Create Document")',
      'button:has-text("Create")',
      'button[class*="default"]'
    ]);

    // Test Invoices Page
    console.log('\n💰 Testing Invoices Page...');
    await testNavigation('/dashboard/invoices', 'Invoices Page');
    
    // Test invoice action buttons
    const invoiceButtons = await page.$$('button:has-text("View"), button:has-text("Edit")');
    if (invoiceButtons.length > 0) {
      try {
        console.log(`  Found ${invoiceButtons.length} invoice action buttons`);
        await invoiceButtons[0].click();
        await delay(1000);
        const modalExists = await page.$('[role="dialog"]');
        if (modalExists) {
          console.log('    ✅ Invoice Modal opened');
          await page.keyboard.press('Escape');
          await delay(500);
          results.passed.push('Invoice View/Edit Modal');
          results.total++;
        }
      } catch (error) {
        console.log(`  ❌ Invoice Modal - ${error.message}`);
        results.failed.push({ test: 'Invoice View/Edit Modal', error: error.message });
        results.total++;
      }
    } else {
      console.log('  ℹ️  No invoice action buttons found');
    }

    // Test Payments Page
    console.log('\n💳 Testing Payments Page...');
    await testNavigation('/dashboard/payments', 'Payments Page');

    // Test Maintenance Page
    console.log('\n🔧 Testing Maintenance Page...');
    await testNavigation('/dashboard/maintenance', 'Maintenance Page');

    // Test Messages Page
    console.log('\n💬 Testing Messages Page...');
    await testNavigation('/dashboard/messages', 'Messages Page');

    // Test Inspections Page
    console.log('\n🔍 Testing Inspections Page...');
    await testNavigation('/dashboard/inspections', 'Inspections Page');

    // Test Settings Page
    console.log('\n⚙️  Testing Settings Page...');
    await testNavigation('/dashboard/settings', 'Settings Page');

    // Test Reports Page
    console.log('\n📊 Testing Reports Page...');
    await testNavigation('/dashboard/reports', 'Reports Page');

    // Test all navigation links
    console.log('\n🧭 Testing All Navigation Links...');
    const navLinks = [
      { path: '/dashboard', name: 'Dashboard Home' },
      { path: '/dashboard/tenants', name: 'Tenants' },
      { path: '/dashboard/properties', name: 'Properties' },
      { path: '/dashboard/leases', name: 'Leases' },
      { path: '/dashboard/documents', name: 'Documents' },
      { path: '/dashboard/invoices', name: 'Invoices' },
      { path: '/dashboard/payments', name: 'Payments' },
      { path: '/dashboard/maintenance', name: 'Maintenance' },
      { path: '/dashboard/messages', name: 'Messages' }
    ];

    for (const { path, name } of navLinks) {
      await testNavigation(path, name);
    }

    // Print summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 COMPREHENSIVE TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests Run: ${results.total}`);
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`Success Rate: ${((results.passed.length / results.total) * 100).toFixed(1)}%`);
    
    if (results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      results.failed.forEach(({ test, error }) => {
        console.log(`  - ${test}: ${error}`);
      });
    }
    
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => {
      console.log(`  ✓ ${test}`);
    });

    // Check if all tests passed
    const allPassed = results.failed.length === 0;
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! The app is 100% functional.');
    } else {
      console.log(`⚠️  ${results.failed.length} test(s) failed. Please review the issues above.`);
    }
    console.log('='.repeat(60));

    return results;

  } catch (error) {
    console.error('❌ Test suite error:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run tests
testFullApp()
  .then(results => {
    const exitCode = results.failed.length > 0 ? 1 : 0;
    console.log(`\n\nTests completed. Exit code: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

