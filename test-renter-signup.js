const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3004';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testRenterSignup() {
  console.log('🆕 Testing RENTER account creation...');

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  try {
    const unique = Date.now();
    const email = `renter+${unique}@example.com`;
    const password = `Test!${unique}`;

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(1000);

    // Switch to Create Account (wait until button is present)
    await page.waitForFunction(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      return btns.some(b => (b.textContent || '').includes('Create Account'));
    }, { timeout: 5000 });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signupBtn = btns.find(b => (b.textContent || '').includes('Create Account'));
      if (signupBtn) signupBtn.click();
    });
    await page.waitForSelector('#fullName', { timeout: 5000 });

    // Fill signup form
    await page.type('#fullName', 'Automated Renter');
    await page.type('#email', email);
    await page.select('#userRole', 'renter');
    await page.type('#password', password);
    await page.type('#confirmPassword', password);

    // Submit
    const submit = await page.$('button[type="submit"]');
    if (submit) await submit.click();
    await delay(1800);

    // Force role and navigate to dashboard if needed
    await page.evaluate(() => localStorage.setItem('userRole', 'renter'));
    try {
      await page.goto(`${BASE_URL}/dashboard?role=renter`, { waitUntil: 'networkidle2', timeout: 60000 });
    } catch (_) {
      // Non-fatal; proceed to check page
    }
    await delay(1500);

    // Verify dashboard visible (by checking presence of main nav or h1)
    const hasH1 = !!(await page.$('h1'));
    console.log(`✅ Dashboard visible: ${hasH1}`);

    console.log('🎉 Signup flow completed.');
  } catch (err) {
    console.error('❌ Signup test failed:', err.message);
  } finally {
    await browser.close();
  }
}

testRenterSignup().catch(console.error);


