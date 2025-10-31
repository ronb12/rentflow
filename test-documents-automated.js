const puppeteer = require('puppeteer');

async function run() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3004';
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  const log = (m) => console.log(`[TEST] ${m}`);

  try {
    // Login first
    log(`Opening ${baseUrl}/login ...`);
    await page.goto(`${baseUrl}/login`, { waitUntil: 'networkidle2' });
    await page.waitForSelector('input#email', { timeout: 60000 });
    await page.type('#email', 'manager@example.com');
    await page.type('#password', 'Manager!234');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => /dashboard/i.test(window.location.pathname), { timeout: 60000 });

    // Navigate to documents
    log(`Opening ${baseUrl}/dashboard/documents ...`);
    await page.goto(`${baseUrl}/dashboard/documents`, { waitUntil: 'networkidle2' });

    // Wait for Documents header
    await page.waitForFunction(() => {
      const h1 = document.querySelector('h1');
      return h1 && /Documents/i.test(h1.textContent || '');
    });
    log('Documents page loaded');

    // Count rows in table
    const initialCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return rows.length;
    });
    log(`Initial documents count: ${initialCount}`);

    // Try to click a "Sign" button if available
    const clickedSign = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => /Sign$/i.test(b.textContent || ''));
      if (btn) { btn.click(); return true; }
      return false;
    });
    if (clickedSign) {
      log('Clicked Sign on a document');
      // Fill signer name minimally and submit
      await page.waitForSelector('input#signerName, input[name="signerName"], input');
      await page.evaluate(() => {
        const name = document.querySelector('#signerName') || document.querySelector('input');
        if (name) name.value = 'Automated Tester';
      });
      // Draw a tiny stroke on canvas
      const canvas = await page.$('canvas');
      if (canvas) {
        const box = await canvas.boundingBox();
        if (box) {
          await page.mouse.move(box.x + 10, box.y + 10);
          await page.mouse.down();
          await page.mouse.move(box.x + 80, box.y + 30);
          await page.mouse.up();
        }
      }
      // Click Sign Document button
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const submit = btns.find(b => /Sign Document/i.test(b.textContent || '')) || btns.find(b => /Sign$/i.test(b.textContent || ''));
        if (submit) submit.click();
      });
      // Wait a moment for refresh
      await page.waitForTimeout(1500);
    } else {
      log('No pending document to sign');
    }

    // Verify list still visible and count >= 1
    const finalCount = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      return rows.length;
    });
    log(`Final documents count: ${finalCount}`);
    if (finalCount < 1) throw new Error('Documents list is empty after signing');

    // Open View on first row
    const openedView = await page.evaluate(() => {
      const row = document.querySelector('table tbody tr');
      if (!row) return false;
      const viewBtn = Array.from(row.querySelectorAll('button')).find(b => /View/i.test(b.textContent || ''));
      if (viewBtn) { viewBtn.click(); return true; }
      return false;
    });
    if (openedView) {
      // Wait for modal content to appear
      await page.waitForTimeout(800);
      const hasPreview = await page.evaluate(() => {
        const title = Array.from(document.querySelectorAll('h4, h3, h2')).some(x => /Signatures|Document Preview/i.test(x.textContent || ''));
        const img = !!document.querySelector('img');
        const htmlBlock = !!document.querySelector('.doc');
        return title || img || htmlBlock;
      });
      log(`Preview modal content detected: ${hasPreview}`);
      if (!hasPreview) throw new Error('Signed document preview content not detected');
    } else {
      log('Could not find View button on first row');
    }

    log('Documents automated test PASSED');
    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('[TEST ERROR]', e && e.message ? e.message : e);
    await browser.close();
    process.exit(1);
  }
}

run();


