const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'http://localhost:3004';
const ERRORS_FILE = '/tmp/test-errors.log';
const RESULTS_FILE = '/tmp/test-results.json';

// Clear previous logs
if (fs.existsSync(ERRORS_FILE)) fs.unlinkSync(ERRORS_FILE);
if (fs.existsSync(RESULTS_FILE)) fs.unlinkSync(RESULTS_FILE);

const errors = [];
const results = {
  passed: [],
  failed: [],
  warnings: []
};

function logError(message, details = '') {
  const error = { message, details, timestamp: new Date().toISOString() };
  errors.push(error);
  fs.appendFileSync(ERRORS_FILE, JSON.stringify(error) + '\n');
  console.error(`❌ ERROR: ${message}`, details ? `- ${details}` : '');
}

function logWarning(message) {
  results.warnings.push(message);
  console.warn(`⚠️  WARNING: ${message}`);
}

function logSuccess(test) {
  results.passed.push(test);
  console.log(`✅ ${test}`);
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testModalsAndButtons() {
  console.log('🚀 Starting automated modal and button functionality tests...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    timeout: 30000
  });

  const page = await browser.newPage();
  
  // Monitor console errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      logError('Browser Console Error', text);
    }
  });

  // Monitor page errors
  page.on('pageerror', error => {
    logError('Page Error', error.message);
  });

  // Monitor request failures
  page.on('requestfailed', request => {
    logWarning(`Request failed: ${request.url()} - ${request.failure()?.errorText}`);
  });

  try {
    console.log('📍 Navigating to home page...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle0', timeout: 15000 });
    await wait(2000);
    
    // Check for redirects or errors
    const url = page.url();
    console.log(`Current URL: ${url}`);

    // Helper to test modal
    async function testModal(pageName, buttonSelector, modalSelector, testName) {
      try {
        console.log(`\n🧪 Testing: ${testName}`);
        await page.waitForSelector(buttonSelector, { timeout: 5000 });
        await page.click(buttonSelector);
        await wait(500);
        
        const modal = await page.$(modalSelector);
        if (modal) {
          logSuccess(`${testName} - Modal opened`);
          
          // Try to close
          const closeSelectors = [
            'button[aria-label="Close"]',
            'button:has-text("Cancel")',
            'button:has-text("Close")',
            '[role="dialog"] button:last-child',
            'button[data-state="open"]'
          ];
          
          let closed = false;
          for (const selector of closeSelectors) {
            try {
              const closeBtn = await page.$(selector);
              if (closeBtn) {
                await closeBtn.click();
                await wait(300);
                closed = true;
                break;
              }
            } catch (e) {}
          }
          
          if (!closed) {
            await page.keyboard.press('Escape');
            await wait(300);
          }
        } else {
          throw new Error('Modal not found after clicking button');
        }
      } catch (error) {
        logError(`${testName} - ${error.message}`);
        results.failed.push({ test: testName, error: error.message });
      }
    }

    // Test Tenants Page
    console.log('\n📋 Testing Tenants Page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/tenants`, { waitUntil: 'networkidle0', timeout: 15000 });
      await wait(2000);
      
      const addButtons = await page.$$('button:has-text("Add"), button:has-text("Tenant")');
      if (addButtons.length > 0) {
        await testModal('Tenants', 'button:has-text("Add")', '[role="dialog"]', 'Add Tenant Modal');
      } else {
        logWarning('Tenants: No add button found');
      }
    } catch (error) {
      logError('Tenants Page', error.message);
    }

    // Test Properties Page
    console.log('\n🏢 Testing Properties Page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/properties`, { waitUntil: 'networkidle0', timeout: 15000 });
      await wait(2000);
      
      const addButton = await page.$('button:has-text("Add"), button:has-text("Property")');
      if (addButton) {
        await testModal('Properties', 'button:has-text("Add")', '[role="dialog"]', 'Add Property Modal');
      } else {
        logWarning('Properties: No add button found');
      }
    } catch (error) {
      logError('Properties Page', error.message);
    }

    // Test Leases Page
    console.log('\n📄 Testing Leases Page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/leases`, { waitUntil: 'networkidle0', timeout: 15000 });
      await wait(2000);
      
      const addButton = await page.$('button:has-text("Add"), button:has-text("Lease")');
      if (addButton) {
        await testModal('Leases', 'button:has-text("Add")', '[role="dialog"]', 'Add Lease Modal');
      } else {
        logWarning('Leases: No add button found');
      }
    } catch (error) {
      logError('Leases Page', error.message);
    }

    // Test Documents Page
    console.log('\n📁 Testing Documents Page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/documents`, { waitUntil: 'networkidle0', timeout: 15000 });
      await wait(3000);
      
      // Test Upload button
      const uploadBtn = await page.$('button:has-text("Upload")');
      if (uploadBtn) {
        await testModal('Documents', 'button:has-text("Upload")', '[role="dialog"]', 'Upload Document Modal');
      }
      
      await wait(1000);
      
      // Test Create button
      const createBtn = await page.$('button:has-text("Create")');
      if (createBtn) {
        await testModal('Documents', 'button:has-text("Create")', '[role="dialog"]', 'Create Document Modal');
      }
    } catch (error) {
      logError('Documents Page', error.message);
    }

    // Test Invoices Page
    console.log('\n💰 Testing Invoices Page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/invoices`, { waitUntil: 'networkidle0', timeout: 15000 });
      await wait(3000);
      
      // Test View/Edit buttons if invoices exist
      const viewButtons = await page.$$('button:has-text("View"), button:has-text("Edit")');
      if (viewButtons.length > 0) {
        await viewButtons[0].click();
        await wait(1000);
        const modal = await page.$('[role="dialog"]');
        if (modal) {
          logSuccess('Invoice View/Edit Modal opened');
          await page.keyboard.press('Escape');
          await wait(300);
        }
      } else {
        logWarning('Invoices: No view/edit buttons found (may be empty)');
      }
    } catch (error) {
      logError('Invoices Page', error.message);
    }

    // Test Payments Page
    console.log('\n💳 Testing Payments Page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/payments`, { waitUntil: 'networkidle0', timeout: 15000 });
      await wait(2000);
      
      const addBtn = await page.$('button:has-text("Add"), button:has-text("Payment")');
      if (addBtn) {
        await testModal('Payments', 'button:has-text("Add")', '[role="dialog"]', 'Add Payment Modal');
      } else {
        logWarning('Payments: No add button found');
      }
    } catch (error) {
      logError('Payments Page', error.message);
    }

    // Print summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${results.passed.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⚠️  Warnings: ${results.warnings.length}`);
    console.log(`🔴 Errors logged: ${errors.length}`);
    
    if (results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      results.failed.forEach(({ test, error }) => {
        console.log(`   - ${test}: ${error}`);
      });
    }
    
    if (results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      results.warnings.forEach(w => console.log(`   - ${w}`));
    }
    
    if (errors.length > 0) {
      console.log('\n🔴 Errors Detected:');
      errors.slice(0, 10).forEach(err => {
        console.log(`   - ${err.message}${err.details ? `: ${err.details}` : ''}`);
      });
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more errors (see ${ERRORS_FILE})`);
      }
    }
    
    console.log('\n✅ Passed Tests:');
    results.passed.forEach(test => console.log(`   - ${test}`));
    
    // Save results
    fs.writeFileSync(RESULTS_FILE, JSON.stringify({ results, errors }, null, 2));
    console.log(`\n📄 Full results saved to: ${RESULTS_FILE}`);
    console.log(`📄 Errors logged to: ${ERRORS_FILE}`);
    
    return results;

  } catch (error) {
    logError('Test Suite Fatal Error', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run tests
testModalsAndButtons()
  .then(results => {
    const exitCode = results.failed.length > 0 ? 1 : 0;
    console.log(`\n\n🏁 Tests completed. Exit code: ${exitCode}`);
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });


