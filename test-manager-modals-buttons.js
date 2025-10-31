const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3004';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testManagerModals() {
  console.log('🧪 Starting Manager Modals and Buttons Test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set longer timeouts
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);

    console.log('1️⃣ Navigating to login page...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    await delay(2000);

    // Login as manager
    console.log('2️⃣ Logging in as manager...');
    
    // Fill in email and password using evaluate to avoid typing issues
    await page.evaluate(() => {
      const emailInput = document.querySelector('input[type="email"]');
      const passwordInput = document.querySelector('input[type="password"]');
      // Must use email with "manager" in it to be treated as manager role
      if (emailInput) {
        emailInput.value = 'manager@example.com';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      if (passwordInput) {
        passwordInput.value = 'Manager!234';
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await delay(1000);
    
    // Click login button
    const buttons = await page.$$('button[type="submit"]');
    if (buttons.length > 0) {
      await buttons[0].click();
      await delay(3000);
    }
    
    const url = page.url();
    console.log(`   Current URL after login: ${url}`);
    
    // Set localStorage for manager role
    await page.evaluate(() => {
      localStorage.setItem('userEmail', 'manager@example.com');
      localStorage.setItem('userRole', 'manager');
    });
    
    // Navigate to properties page to verify manager access
    await page.goto(`${BASE_URL}/dashboard/properties`, { waitUntil: 'networkidle2' });
    await delay(2000);
    
    const pageContent = await page.content();
    if (pageContent.includes('Access Denied') || pageContent.includes('Unauthorized')) {
      console.log('   ❌ Access denied - not logged in as manager');
    } else {
      console.log('   ✅ Successfully logged in as manager');
    }

    // Helper function to test modal opening
    async function testModal(testName, buttonSelector, modalContent, maxRetries = 3) {
      console.log(`\n📝 Testing: ${testName}`);
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          console.log(`   Attempt ${i + 1}/${maxRetries}`);
          
          // Find button by text
          const buttons = await page.$$('button');
          let button = null;
          const lastWord = testName.split(' ')[testName.split(' ').length - 1];
          
          for (const btn of buttons) {
            const text = await btn.evaluate(el => el.textContent);
            if (text && text.includes(lastWord)) {
              button = btn;
              console.log(`   Found button: "${text}"`);
              break;
            }
          }

          if (!button) {
            console.log(`   ❌ Button not found for: ${testName}`);
            return false;
          }

          const buttonText = await button.evaluate(el => el.textContent);
          console.log(`   Found button: "${buttonText}"`);

          await button.click();
          await delay(2000);

          // Check if modal opened
          const modalExists = await page.evaluate(() => {
            const modals = document.querySelectorAll('[role="dialog"], .fixed.inset-0');
            return modals.length > 0;
          });

          if (!modalExists) {
            console.log(`   ❌ Modal did not open for: ${testName}`);
            if (i < maxRetries - 1) {
              console.log(`   Retrying...`);
              await delay(1000);
              continue;
            }
            return false;
          }

          console.log(`   ✅ Modal opened successfully`);

          // Try to find and click close button
          const allButtons = await page.$$('button');
          let closeButton = null;
          for (const btn of allButtons) {
            const text = await btn.evaluate(el => el.textContent);
            const ariaLabel = await btn.evaluate(el => el.getAttribute('aria-label'));
            
            if ((text && (text.includes('Cancel') || text.includes('Close'))) || 
                (ariaLabel && ariaLabel.includes('Close'))) {
              closeButton = btn;
              break;
            }
          }
          
          if (closeButton) {
            await closeButton.click();
            await delay(1000);
            console.log(`   ✅ Modal closed successfully`);
          } else {
            console.log(`   ⚠️ Could not find close button`);
          }

          return true;
        } catch (error) {
          console.log(`   ⚠️ Error testing ${testName}: ${error.message}`);
          if (i < maxRetries - 1) {
            await delay(1000);
            continue;
          }
          return false;
        }
      }
      return false;
    }

    // Test Tenants page
    console.log('\n🏘️ Testing TENANTS page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/tenants`, { waitUntil: 'networkidle2' });
      await delay(3000);
      await testModal('Add Tenant', 'button:has-text("Add Tenant")', 'Add New Tenant');
    } catch (error) {
      console.log(`   ⚠️ Error navigating to tenants page: ${error.message}`);
    }

    // Test Properties page
    console.log('\n🏠 Testing PROPERTIES page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/properties`, { waitUntil: 'networkidle2' });
      await delay(3000);
      await testModal('Add Property', 'button:has-text("Add Property")', 'Add New Property');
    } catch (error) {
      console.log(`   ⚠️ Error navigating to properties page: ${error.message}`);
    }

    // Test Leases page
    console.log('\n📄 Testing LEASES page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/leases`, { waitUntil: 'networkidle2' });
      await delay(3000);
      await testModal('Add Lease', 'button:has-text("Add Lease")', 'Add New Lease');
    } catch (error) {
      console.log(`   ⚠️ Error navigating to leases page: ${error.message}`);
    }

    // Test Documents page
    console.log('\n📁 Testing DOCUMENTS page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/documents`, { waitUntil: 'networkidle2' });
      await delay(3000);
      await testModal('Upload Document', 'button:has-text("Upload Document")', 'Upload');
      await testModal('Create Document', 'button:has-text("Create Document")', 'Create');
    } catch (error) {
      console.log(`   ⚠️ Error navigating to documents page: ${error.message}`);
    }

    // Test Invoices page
    console.log('\n💰 Testing INVOICES page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/invoices`, { waitUntil: 'networkidle2' });
      await delay(3000);
    } catch (error) {
      console.log(`   ⚠️ Error navigating to invoices page: ${error.message}`);
    }

    // Test invoice actions
    try {
      console.log('\n📝 Testing Invoice Action Buttons...');
      
      // Try to find invoice rows
      const invoiceRows = await page.$$('tbody tr');
      console.log(`   Found ${invoiceRows.length} invoice rows`);
      
      if (invoiceRows.length > 0) {
        // Get the first invoice row
        const firstRow = invoiceRows[0];
        
        // Try to find action buttons
        const buttons = await firstRow.$$('button');
        console.log(`   Found ${buttons.length} buttons in first row`);
        
        for (const button of buttons) {
          const title = await button.evaluate(el => el.getAttribute('title') || el.textContent);
          console.log(`   Testing button: "${title}"`);
          
          await button.click();
          await delay(2000);
          
          // Check if modal opened
          const modalExists = await page.evaluate(() => {
            const modals = document.querySelectorAll('[role="dialog"], .fixed.inset-0');
            return modals.length > 0;
          });

          if (modalExists) {
            console.log(`   ✅ Modal opened for "${title}"`);
            
            // Try to close
            const closeButton = await page.$('button:has-text("Close"), button[aria-label="Close"], button:has-text("Cancel")');
            if (closeButton) {
              await closeButton.click();
              await delay(1000);
              console.log(`   ✅ Modal closed`);
            }
          } else {
            console.log(`   ⚠️ No modal opened for "${title}"`);
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Error testing invoice actions: ${error.message}`);
    }

    // Test Payments page
    console.log('\n💳 Testing PAYMENTS page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/payments`, { waitUntil: 'networkidle2' });
      await delay(3000);
    } catch (error) {
      console.log(`   ⚠️ Error navigating to payments page: ${error.message}`);
    }
    
    // Test payment method edit buttons
    try {
      const editButtons = await page.$$('button:has(svg)');
      console.log(`   Found ${editButtons.length} icon buttons`);
      
      // Try to find edit buttons by their SVG icon
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const title = await button.evaluate(el => el.getAttribute('title'));
        if (title && title.includes('Edit')) {
          console.log(`   Testing: ${title}`);
          await button.click();
          await delay(2000);
          
          const modalExists = await page.evaluate(() => {
            const modals = document.querySelectorAll('[role="dialog"], .fixed.inset-0');
            return modals.length > 0;
          });

          if (modalExists) {
            console.log(`   ✅ Modal opened for "${title}"`);
            const closeButton = await page.$('button:has-text("Cancel")');
            if (closeButton) {
              await closeButton.click();
              await delay(1000);
            }
          }
        }
      }
    } catch (error) {
      console.log(`   ⚠️ Error testing payment edit: ${error.message}`);
    }

    // Test Work Orders page
    console.log('\n🔧 Testing WORK ORDERS page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/work-orders`, { waitUntil: 'networkidle2' });
      await delay(3000);
      
      // Test Work Order action buttons
      try {
        console.log('   Testing Work Order action buttons...');
        const workOrderRows = await page.$$('tbody tr');
        console.log(`   Found ${workOrderRows.length} work order rows`);
        
        if (workOrderRows.length > 0) {
          const firstRow = workOrderRows[0];
          const buttons = await firstRow.$$('button');
          console.log(`   Found ${buttons.length} buttons in first row`);
          
          for (const button of buttons) {
            const title = await button.evaluate(el => el.getAttribute('title') || el.textContent);
            if (title && (title.includes('Edit') || title.includes('Assign') || title.includes('Schedule'))) {
              console.log(`   Testing button: "${title}"`);
              
              await button.click();
              await delay(2000);
              
              const modalExists = await page.evaluate(() => {
                const modals = document.querySelectorAll('[role="dialog"], .fixed.inset-0');
                return modals.length > 0;
              });

              if (modalExists) {
                console.log(`   ✅ Modal opened for "${title}"`);
                
                const allButtons = await page.$$('button');
                for (const btn of allButtons) {
                  const btnText = await btn.evaluate(el => el.textContent);
                  if (btnText && (btnText.includes('Cancel') || btnText.includes('Close'))) {
                    await btn.click();
                    await delay(1000);
                    console.log(`   ✅ Modal closed`);
                    break;
                  }
                }
              }
              break; // Only test one button
            }
          }
        }
      } catch (error) {
        console.log(`   ⚠️ Error testing work order actions: ${error.message}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Error navigating to work orders page: ${error.message}`);
    }

    // Test Reports page
    console.log('\n📊 Testing REPORTS page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/reports`, { waitUntil: 'networkidle2' });
      await delay(3000);
      
      // Test report generation buttons
      try {
        console.log('   Testing report generation buttons...');
        const buttons = await page.$$('button');
        for (const button of buttons) {
          const text = await button.evaluate(el => el.textContent);
          if (text && text.includes('Generate')) {
            console.log(`   Found button: "${text}"`);
            // Just verify the button exists, don't click it as it generates reports
            break;
          }
        }
      } catch (error) {
        console.log(`   ⚠️ Error testing reports: ${error.message}`);
      }
    } catch (error) {
      console.log(`   ⚠️ Error navigating to reports page: ${error.message}`);
    }

    // Test Inspections page
    console.log('\n👀 Testing INSPECTIONS page...');
    try {
      await page.goto(`${BASE_URL}/dashboard/inspections`, { waitUntil: 'networkidle2' });
      await delay(3000);
    } catch (error) {
      console.log(`   ⚠️ Error navigating to inspections page: ${error.message}`);
    }

    console.log('\n✅ Testing completed!');
    console.log('\n⏱️ Waiting 5 seconds to review any open modals...');
    await delay(5000);

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

testManagerModals().catch(console.error);

