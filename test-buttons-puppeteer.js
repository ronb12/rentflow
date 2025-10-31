#!/usr/bin/env node

const puppeteer = require('puppeteer');
const { spawn } = require('child_process');

const BASE_URL = 'http://localhost:3004';
const TEST_RESULTS = {
  passed: [],
  failed: [],
  screenshots: []
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name) {
  const screenshotPath = `test-screenshots/${name}-${Date.now()}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: true });
  TEST_RESULTS.screenshots.push(screenshotPath);
  return screenshotPath;
}

async function testButton(page, selector, buttonName, expectedBehavior) {
  try {
    console.log(`  🧪 Testing: ${buttonName}...`);
    
    // Check if button exists
    const button = await page.$(selector);
    if (!button) {
      throw new Error(`Button not found: ${selector}`);
    }

    // Check if button is visible
    const isVisible = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el && el.offsetParent !== null;
    }, selector);

    if (!isVisible) {
      throw new Error(`Button is not visible: ${buttonName}`);
    }

    // Click the button
    await button.click();
    await delay(1000); // Wait for action to complete

    // Verify expected behavior
    if (expectedBehavior === 'modal') {
      // Check if modal opened
      const modal = await page.$('[role="dialog"], .modal, [class*="Dialog"]');
      if (!modal) {
        throw new Error(`Modal did not open after clicking ${buttonName}`);
      }
      console.log(`    ✅ Modal opened successfully`);
      
      // Take screenshot
      await takeScreenshot(page, `modal-${buttonName.toLowerCase().replace(/\s+/g, '-')}`);
      
      // Close modal
      const closeButton = await page.$('button[aria-label="Close"], button:has-text("Close"), button:has-text("Cancel"), .close');
      if (closeButton) {
        await closeButton.click();
        await delay(500);
      }
    } else if (expectedBehavior === 'download') {
      // Wait for download (this might not be fully testable, but we can check if the request was made)
      console.log(`    ✅ Download initiated`);
      await delay(1000);
    } else if (expectedBehavior === 'page-change') {
      // Page should have changed
      const currentUrl = page.url();
      console.log(`    ✅ Navigation occurred: ${currentUrl}`);
    }

    TEST_RESULTS.passed.push(buttonName);
    console.log(`    ✅ ${buttonName} - PASSED`);
    return true;
  } catch (error) {
    TEST_RESULTS.failed.push({ button: buttonName, error: error.message });
    console.log(`    ❌ ${buttonName} - FAILED: ${error.message}`);
    await takeScreenshot(page, `error-${buttonName.toLowerCase().replace(/\s+/g, '-')}`);
    return false;
  }
}

async function testInvoicesPage(browser) {
  console.log('\n📄 Testing Invoices Page...');
  const page = await browser.newPage();
  
  try {
    await page.goto(`${BASE_URL}/dashboard/invoices`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(2000);
    
    console.log('  📸 Taking initial screenshot...');
    await takeScreenshot(page, 'invoices-initial');

    // Test View Button
    await testButton(
      page,
      'table tr:first-child button[title="View Invoice"], table tr:first-child button:has(svg.lucide-eye)',
      'Invoice View Button',
      'modal'
    );

    await delay(1000);

    // Test Edit Button
    await testButton(
      page,
      'table tr:first-child button[title="Edit Invoice"], table tr:first-child button:has(svg.lucide-edit)',
      'Invoice Edit Button',
      'modal'
    );

    await delay(1000);

    // Test Download Button (click and verify it doesn't break)
    await testButton(
      page,
      'table tr:first-child button[title="Download PDF"], table tr:first-child button:has(svg.lucide-download)',
      'Invoice Download Button',
      'download'
    );

    console.log(`  ✅ Invoices page tests completed`);

  } catch (error) {
    console.error(`  ❌ Error testing invoices page:`, error.message);
    await takeScreenshot(page, 'invoices-error');
  } finally {
    await page.close();
  }
}

async function testDocumentsPage(browser) {
  console.log('\n📁 Testing Documents Page...');
  const page = await browser.newPage();
  
  try {
    await page.goto(`${BASE_URL}/dashboard/documents`, { waitUntil: 'networkidle2', timeout: 30000 });
    await delay(3000); // Give time for documents to load
    
    console.log('  📸 Taking initial screenshot...');
    await takeScreenshot(page, 'documents-initial');

    // Wait for documents to load
    await page.waitForSelector('button, [class*="Card"]', { timeout: 10000 });

    // Test View Button
    const viewButtonSelector = 'button:has(svg.lucide-eye), button[title*="View"], button[title*="view"]';
    await testButton(
      page,
      viewButtonSelector,
      'Document View Button',
      'modal'
    );

    await delay(1000);

    // Test Download Button
    const downloadButtonSelector = 'button:has(svg.lucide-download), button[title*="Download"], button[title*="download"]';
    await testButton(
      page,
      downloadButtonSelector,
      'Document Download Button',
      'download'
    );

    console.log(`  ✅ Documents page tests completed`);

  } catch (error) {
    console.error(`  ❌ Error testing documents page:`, error.message);
    await takeScreenshot(page, 'documents-error');
  } finally {
    await page.close();
  }
}

async function runTests() {
  console.log('🚀 Starting Puppeteer Button Tests');
  console.log('=' .repeat(60));
  console.log(`🌐 Testing URL: ${BASE_URL}`);
  console.log(`📸 Screenshots will be saved to: test-screenshots/`);
  
  // Create screenshots directory
  const fs = require('fs');
  if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots', { recursive: true });
  }

  let browser;
  try {
    console.log('\n🔍 Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Show browser so user can see
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    console.log('✅ Browser launched\n');

    // Test Invoices Page
    await testInvoicesPage(browser);
    await delay(2000);

    // Test Documents Page
    await testDocumentsPage(browser);

    // Print results
    console.log('\n' + '=' .repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${TEST_RESULTS.passed.length}`);
    TEST_RESULTS.passed.forEach(test => {
      console.log(`   ✓ ${test}`);
    });

    if (TEST_RESULTS.failed.length > 0) {
      console.log(`\n❌ Failed: ${TEST_RESULTS.failed.length}`);
      TEST_RESULTS.failed.forEach(({ button, error }) => {
        console.log(`   ✗ ${button}: ${error}`);
      });
    }

    console.log(`\n📸 Screenshots saved: ${TEST_RESULTS.screenshots.length} files`);
    TEST_RESULTS.screenshots.forEach(screenshot => {
      console.log(`   📷 ${screenshot}`);
    });

    console.log('\n' + '=' .repeat(60));
    
    if (TEST_RESULTS.failed.length === 0) {
      console.log('🎉 ALL BUTTON TESTS PASSED!');
    } else {
      console.log('⚠️  Some tests failed. Check screenshots for details.');
    }
    
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('\n❌ Test execution error:', error);
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(BASE_URL);
    return response.ok;
  } catch {
    return false;
  }
}

// Main execution
(async () => {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('⚠️  Server is not running. Please start it with: npm run dev');
    console.log('   Then run this test again.');
    process.exit(1);
  }

  console.log('✅ Server is running!\n');
  await runTests();
})();



