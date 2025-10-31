const puppeteer = require('puppeteer');

async function clickByText(page, selector, text, exact = false) {
  const handles = await page.$$(selector);
  for (const h of handles) {
    const t = (await page.evaluate(el => el.textContent || '', h)).trim();
    if (exact ? t === text : t.toLowerCase().includes(text.toLowerCase())) {
      try {
        await h.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' }));
        await new Promise(r => setTimeout(r, 200));
        await h.click();
        return true;
      } catch (_) {
        try {
          await page.evaluate(el => {
            el.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
            el.click();
          }, h);
          return true;
        } catch (e) {
          // retry once after small delay
          await new Promise(r => setTimeout(r, 300));
          try { await h.click(); return true; } catch {}
        }
      }
    }
  }
  return false;
}

(async () => {
  const APP_URL = process.env.APP_URL || 'http://localhost:3004';
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const [page] = await browser.pages();
  page.setDefaultTimeout(30000);

  // 1) Submit Maintenance Request
  await page.goto(`${APP_URL}/dashboard/maintenance`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  // Fill Description via data-testid
  const desc = await page.$('[data-testid="maint-description"], textarea, [name="description"], input[placeholder*="Description" i]');
  if (desc) {
    await desc.click({ clickCount: 3 });
    await desc.type('Leaking sink under bathroom vanity.');
  }
  // Attempt to select a priority if a select exists
  try { await page.select('select', 'Medium'); } catch {}
  // Submit
  const submitBtn = await page.$('[data-testid="maint-submit"]');
  if (submitBtn) { await submitBtn.click(); } else if (!(await clickByText(page, 'button', 'Submit'))) { await clickByText(page, 'button', 'Submit Request'); }
  await new Promise(r => setTimeout(r, 1500));

  // 2) Send Message
  await page.goto(`${APP_URL}/dashboard/messages`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 800));
  const msgInput = await page.$('[data-testid="msg-input"], textarea, input[type="text"], [name*="message" i]');
  if (msgInput) {
    await msgInput.type('Hello manager, just testing the messaging feature.');
  }
  const sendBtn = await page.$('[data-testid="msg-send"]');
  if (sendBtn) { await sendBtn.click(); } else { await clickByText(page, 'button', 'Send'); }
  await new Promise(r => setTimeout(r, 1200));

  // 3) Open Document modal (View or Upload)
  await page.goto(`${APP_URL}/dashboard/documents`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  if (!(await clickByText(page, 'button,a', 'View'))) {
    // fallback: open Upload modal to show modal behavior
    await clickByText(page, 'button', 'Upload');
    await new Promise(r => setTimeout(r, 800));
  } else {
    await new Promise(r => setTimeout(r, 1200));
  }

  // 4) Submit Schedule Change Request (tenant)
  await page.goto(`${APP_URL}/dashboard/payments/schedules`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1000));
  if (await clickByText(page, '[data-testid="request-change"], button', 'Request Change')) {
    // Fill due day
    const dueInput = await page.$('input[type="number"]');
    if (dueInput) {
      await dueInput.click({ clickCount: 3 });
      await dueInput.type('8');
    }
    // Select reason
    await page.select('select', 'Align with biweekly pay dates');
    await clickByText(page, 'button', 'Submit');
    await new Promise(r => setTimeout(r, 1200));
  }

  // Keep browser open briefly for user to observe final state
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})().catch(err => { console.error(err); process.exit(1); });


