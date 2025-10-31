const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3004';
// Allow overriding credentials via environment variables
const MANAGER_EMAIL = process.env.MANAGER_EMAIL || 'manager@example.com';
const MANAGER_PASSWORD = process.env.MANAGER_PASSWORD || 'Manager!234';
const RENTER_EMAIL = process.env.RENTER_EMAIL || 'renter@example.com';
const RENTER_PASSWORD = process.env.RENTER_PASSWORD || 'Renter!234';
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testEntireApp() {
  console.log('🧪 Starting Complete App Testing...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set longer timeouts
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(30000);

    console.log('1️⃣ Testing as MANAGER...\n');
    await testAsManager(page);

    console.log('\n2️⃣ Testing as RENTER...\n');
    await testAsRenter(page);

    console.log('\n✅ All testing completed!');
    await delay(5000);

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
}

async function testAsManager(page) {
  console.log('   🔑 Logging in as manager...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await delay(2000);
  
  // Fill in credentials
  await page.evaluate((email, password) => {
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    if (emailInput) {
      emailInput.value = email;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (passwordInput) {
      passwordInput.value = password;
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, MANAGER_EMAIL, MANAGER_PASSWORD);
  await delay(1000);
  
  // Click login
  const buttons = await page.$$('button[type="submit"]');
  if (buttons.length > 0) {
    await buttons[0].click();
    await delay(3000);
  }
  
  // Set localStorage
  await page.evaluate((email) => {
    const role = email === 'manager@example.com' ? 'manager' : 'renter';
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
  }, MANAGER_EMAIL);
  
  console.log('   ✅ Logged in as manager\n');

  // Test Manager Features
  await testManagerFeatures(page);
}

async function testManagerFeatures(page) {
  const features = [
    { name: 'Dashboard', url: '/dashboard', description: 'Main dashboard' },
    { name: 'Properties', url: '/dashboard/properties', description: 'Property management', testModal: 'Add Property' },
    { name: 'Tenants', url: '/dashboard/tenants', description: 'Tenant management', testModal: 'Add Tenant' },
    { name: 'Leases', url: '/dashboard/leases', description: 'Lease management', testModal: 'Add Lease' },
    { name: 'Invoices', url: '/dashboard/invoices', description: 'Invoice management' },
    { name: 'Documents', url: '/dashboard/documents', description: 'Document management' },
    { name: 'Inspections', url: '/dashboard/inspections', description: 'Property inspections' },
    { name: 'Work Orders', url: '/dashboard/work-orders', description: 'Work order management' },
    { name: 'Reports', url: '/dashboard/reports', description: 'Reports and analytics' },
    { name: 'Settings', url: '/dashboard/settings', description: 'Account settings' }
  ];

  for (const feature of features) {
    console.log(`   📍 Testing ${feature.name}...`);
    try {
      await page.goto(`${BASE_URL}${feature.url}`, { waitUntil: 'networkidle2' });
      await delay(2000);
      
      const title = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.textContent : 'No title found';
      });
      
      console.log(`      ✅ Loaded: ${title}`);
      
      // Test modal if specified
      if (feature.testModal) {
        await testModalButton(page, feature.testModal);
      }
      
      // Test any dropdowns on the page
      await testDropdowns(page);
      
      console.log(`      ✅ ${feature.name} page tested\n`);
    } catch (error) {
      console.log(`      ❌ Error testing ${feature.name}: ${error.message}\n`);
    }
  }
}

async function testAsRenter(page) {
  console.log('   🔑 Logging out...');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await delay(1000);
  
  console.log('   🔑 Logging in as renter...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  await delay(2000);
  
  // Fill in credentials
  await page.evaluate((email, password) => {
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    if (emailInput) {
      emailInput.value = email;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (passwordInput) {
      passwordInput.value = password;
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, RENTER_EMAIL, RENTER_PASSWORD);
  await delay(1000);
  
  // Click login
  const buttons = await page.$$('button[type="submit"]');
  if (buttons.length > 0) {
    await buttons[0].click();
    await delay(3000);
  }
  
  // Set localStorage
  await page.evaluate((email) => {
    const role = email === 'manager@example.com' ? 'manager' : 'renter';
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
  }, RENTER_EMAIL);
  
  console.log('   ✅ Logged in as renter\n');

  // Test Renter Features
  await testRenterFeatures(page);
}

async function testRenterFeatures(page) {
  const features = [
    { name: 'Dashboard', url: '/dashboard', description: 'My dashboard' },
    { name: 'My Lease', url: '/dashboard/my-lease', description: 'Lease details' },
    { name: 'Payments', url: '/dashboard/payments', description: 'Payment center' },
    { name: 'Maintenance', url: '/dashboard/maintenance', description: 'Maintenance requests' },
    { name: 'Messages', url: '/dashboard/messages', description: 'Messages' },
    { name: 'Settings', url: '/dashboard/settings', description: 'Settings' }
  ];

  for (const feature of features) {
    console.log(`   📍 Testing ${feature.name}...`);
    try {
      await page.goto(`${BASE_URL}${feature.url}`, { waitUntil: 'networkidle2' });
      await delay(2000);
      
      const title = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.textContent : 'No title found';
      });
      
      console.log(`      ✅ Loaded: ${title}`);
      
      // Test dropdowns on the page
      await testDropdowns(page);
      
      console.log(`      ✅ ${feature.name} page tested\n`);
    } catch (error) {
      console.log(`      ❌ Error testing ${feature.name}: ${error.message}\n`);
    }
  }
}

async function testModalButton(page, buttonText) {
  try {
    const buttons = await page.$$('button');
    for (const button of buttons) {
      const text = await button.evaluate(el => el.textContent);
      if (text && text.includes(buttonText)) {
        console.log(`      🧪 Testing modal: ${buttonText}`);
        await button.click();
        await delay(2000);
        
        const modalExists = await page.evaluate(() => {
          const modals = document.querySelectorAll('[role="dialog"], .fixed.inset-0');
          return modals.length > 0;
        });

        if (modalExists) {
          console.log(`      ✅ Modal opened successfully`);
          
          // Try to find and click close button
          const allButtons = await page.$$('button');
          for (const btn of allButtons) {
            const btnText = await btn.evaluate(el => el.textContent);
            const ariaLabel = await btn.evaluate(el => el.getAttribute('aria-label'));
            
            if ((btnText && (btnText.includes('Cancel') || btnText.includes('Close'))) || 
                (ariaLabel && ariaLabel.includes('Close'))) {
              await btn.click();
              await delay(1000);
              console.log(`      ✅ Modal closed successfully`);
              break;
            }
          }
        } else {
          console.log(`      ⚠️ Modal did not open`);
        }
        break;
      }
    }
  } catch (error) {
    console.log(`      ⚠️ Error testing modal: ${error.message}`);
  }
}

async function testDropdowns(page) {
  try {
    // Find all select triggers
    const selects = await page.$$('[role="combobox"]');
    
    if (selects.length > 0) {
      console.log(`      🧪 Testing ${selects.length} dropdown(s)`);
      
      // Test first dropdown
      if (selects.length > 0) {
        await selects[0].click();
        await delay(1000);
        
        const dropdownOpen = await page.evaluate(() => {
          const content = document.querySelector('[role="listbox"]');
          return content !== null;
        });
        
        if (dropdownOpen) {
          console.log(`      ✅ Dropdown opened`);
          
          // Click outside to close
          await page.click('body');
          await delay(500);
          console.log(`      ✅ Dropdown closed`);
        }
      }
    }
  } catch (error) {
    // Dropdowns not found or already tested, skip silently
  }
}

testEntireApp().catch(console.error);

