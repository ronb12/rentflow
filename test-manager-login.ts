// Test manager login specifically
import puppeteer from 'puppeteer';

async function testManagerLogin() {
  console.log('🧪 Testing Manager Login...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Go to login page
    console.log('1. Going to login page...');
    await page.goto('http://localhost:3004/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Fill in manager credentials
    console.log('2. Filling manager credentials...');
    await page.click('input[type="email"]', { clickCount: 3 });
    await page.type('input[type="email"]', 'manager@example.com');
    
    await page.click('input[type="password"]', { clickCount: 3 });
    await page.type('input[type="password"]', 'Manager!234');
    
    // Submit form
    console.log('3. Submitting login form...');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    console.log('4. Waiting for navigation...');
    await page.waitForNavigation({ timeout: 10000 });
    
    const currentUrl = page.url();
    console.log('5. Current URL:', currentUrl);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Manager login successful!');
      
      // Check if we can access manager-specific pages
      console.log('6. Testing manager dashboard...');
      await page.goto('http://localhost:3004/dashboard?role=manager');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const h1Elements = await page.$$eval('h1', els => els.map(el => el.textContent));
      console.log('H1 elements:', h1Elements);
      
      const hasManagerContent = h1Elements.some(text => 
        text?.includes('Property Management') || text?.includes('Manager')
      );
      
      if (hasManagerContent) {
        console.log('✅ Manager dashboard working!');
      } else {
        console.log('⚠️ Manager dashboard may not be showing manager content');
      }
      
    } else {
      console.log('❌ Manager login failed, redirected to:', currentUrl);
    }
    
  } catch (error) {
    console.error('❌ Manager login test failed:', error);
  } finally {
    await browser.close();
  }
}

testManagerLogin().catch(console.error);
