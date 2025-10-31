const puppeteer = require('puppeteer');

(async () => {
  const APP_URL = process.env.APP_URL || 'http://localhost:3004';
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const [page] = await browser.pages();
  page.setDefaultTimeout(30000);
  await page.goto(`${APP_URL}/dashboard/payments/schedules`, { waitUntil: 'domcontentloaded' });

  // Wait for heading
  await page.waitForSelector('h1');
  const title = await page.$eval('h1', el => el.textContent?.trim() || '');
  console.log('Title:', title);

  // Count schedule cards
  await new Promise(r => setTimeout(r, 1000));
  const cards = await page.$$('[data-testid="schedule-card"], .grid .card, .grid [class*="CardContent"]');
  console.log('Found cards (rough):', cards.length);

  // Fallback: check for text "Schedule" occurrences
  const scheduleTextCount = await page.$$eval('*', els => els.filter(e => /Schedule/i.test(e.textContent || '')).length);
  console.log('Nodes containing "Schedule":', scheduleTextCount);

  // Screenshot
  await page.screenshot({ path: 'schedule-page.png', fullPage: true });
  console.log('Saved screenshot: schedule-page.png');

  // Do not close so user can watch; close after short delay
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });


