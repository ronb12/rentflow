const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Testing Invoice Action Buttons...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Monitor console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log('❌ Page Error:', error.message);
  });

  try {
    console.log('📍 Navigating to invoices page...');
    await page.goto('http://localhost:3004/dashboard/invoices', { 
      waitUntil: 'networkidle0', 
      timeout: 15000 
    });
    
    await new Promise(r => setTimeout(r, 3000));
    
    // Check if invoice table is rendered
    const invoiceTable = await page.$('table');
    console.log(`✅ Invoice table found: ${!!invoiceTable}`);
    
    // Test View Button
    console.log('\n🔍 Testing View Button...');
    const viewButtons = await page.$$('button[title="View Invoice"]');
    console.log(`   Found ${viewButtons.length} View button(s)`);
    
    if (viewButtons.length > 0) {
      const beforeClick = await page.$('[role="dialog"]');
      console.log(`   Dialog before click: ${!!beforeClick}`);
      
      await viewButtons[0].click();
      await new Promise(r => setTimeout(r, 1500));
      
      const afterClick = await page.$('[role="dialog"]');
      console.log(`   ✅ Dialog after click: ${!!afterClick}`);
      
      if (afterClick) {
        const dialogTitle = await page.$eval('[role="dialog"]', el => el.textContent).catch(() => '');
        console.log(`   Dialog content visible: ${dialogTitle.includes('Invoice Details')}`);
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
      } else {
        console.log('   ❌ Dialog did not open!');
      }
    }
    
    // Test Edit Button
    console.log('\n✏️  Testing Edit Button...');
    const editButtons = await page.$$('button[title="Edit Invoice"]');
    console.log(`   Found ${editButtons.length} Edit button(s)`);
    
    if (editButtons.length > 0) {
      await editButtons[0].click();
      await new Promise(r => setTimeout(r, 1500));
      
      const dialog = await page.$('[role="dialog"]');
      console.log(`   ✅ Dialog after click: ${!!dialog}`);
      
      if (dialog) {
        const dialogTitle = await page.$eval('[role="dialog"]', el => el.textContent).catch(() => '');
        console.log(`   Dialog content visible: ${dialogTitle.includes('Edit Invoice')}`);
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
      } else {
        console.log('   ❌ Dialog did not open!');
      }
    }
    
    // Test Download Button
    console.log('\n📥 Testing Download Button...');
    const downloadButtons = await page.$$('button[title="Download PDF"]');
    console.log(`   Found ${downloadButtons.length} Download button(s)`);
    
    if (downloadButtons.length > 0) {
      // Intercept network requests to check if PDF endpoint is called
      let pdfRequested = false;
      page.on('response', async response => {
        if (response.url().includes('/api/invoices/') && response.url().includes('/pdf')) {
          pdfRequested = true;
          console.log(`   ✅ PDF API called: ${response.status()}`);
        }
      });
      
      await downloadButtons[0].click();
      await new Promise(r => setTimeout(r, 2000));
      
      console.log(`   PDF download requested: ${pdfRequested}`);
      
      if (!pdfRequested && errors.length === 0) {
        console.log('   ⚠️  PDF request not detected (may need more time or API issue)');
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ View buttons found: ${viewButtons.length}`);
    console.log(`✅ Edit buttons found: ${editButtons.length}`);
    console.log(`✅ Download buttons found: ${downloadButtons.length}`);
    console.log(`❌ Errors encountered: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach((err, i) => console.log(`   ${i+1}. ${err}`));
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();


