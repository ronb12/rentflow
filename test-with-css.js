const puppeteer = require('puppeteer');

(async () => {
  console.log('🧪 Testing with CSS visibility check...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  
  // Set viewport to ensure styles are applied
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    console.log('📍 Navigating to invoices page...');
    await page.goto('http://localhost:3004/dashboard/invoices', { 
      waitUntil: 'networkidle0', 
      timeout: 15000 
    });
    
    // Wait for CSS to be fully loaded
    await page.evaluate(() => {
      return new Promise((resolve) => {
        // Wait for all stylesheets to be loaded
        if (document.styleSheets.length > 0) {
          let loaded = 0;
          const sheets = Array.from(document.styleSheets);
          
          sheets.forEach((sheet, index) => {
            try {
              if (sheet.cssRules && sheet.cssRules.length > 0) {
                loaded++;
              }
            } catch (e) {
              // Cross-origin stylesheets
              loaded++;
            }
          });
          
          if (loaded === sheets.length || sheets.length === 0) {
            resolve();
          } else {
            setTimeout(resolve, 1000);
          }
        } else {
          setTimeout(resolve, 2000);
        }
      });
    });
    
    // Additional wait for Next.js hydration
    await new Promise(r => setTimeout(r, 2000));
    
    // Check CSS visibility
    console.log('\n🎨 Checking CSS styling...');
    
    // Check if Tailwind classes are applied
    const hasTailwindStyling = await page.evaluate(() => {
      // Check if common Tailwind classes are in the DOM
      const body = document.body;
      const hasFlex = Array.from(body.querySelectorAll('*')).some(el => 
        getComputedStyle(el).display === 'flex' || 
        getComputedStyle(el).display === 'grid'
      );
      
      // Check computed styles of a button
      const button = document.querySelector('button');
      if (button) {
        const styles = getComputedStyle(button);
        return {
          hasDisplay: styles.display !== 'none',
          hasPadding: parseInt(styles.paddingTop) > 0,
          hasBorder: parseInt(styles.borderWidth) > 0,
          hasFlexClasses: hasFlex,
          buttonVisible: styles.display !== 'none',
          backgroundColor: styles.backgroundColor,
          color: styles.color
        };
      }
      return { hasDisplay: false };
    });
    
    console.log('CSS Styling Check:', JSON.stringify(hasTailwindStyling, null, 2));
    
    // Check specific styled elements
    const cardStyle = await page.evaluate(() => {
      const card = document.querySelector('[class*="Card"]') || 
                   document.querySelector('.rounded-lg') ||
                   document.querySelector('[class*="card"]');
      if (card) {
        const styles = getComputedStyle(card);
        return {
          borderRadius: styles.borderRadius,
          backgroundColor: styles.backgroundColor,
          padding: styles.padding,
          display: styles.display,
          visible: styles.display !== 'none'
        };
      }
      return null;
    });
    
    console.log('\n📦 Card Styling:', JSON.stringify(cardStyle, null, 2));
    
    // Take a screenshot to verify visual styling
    await page.screenshot({ 
      path: '/tmp/invoice-page-with-css.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot saved to: /tmp/invoice-page-with-css.png');
    
    // Check button styling
    const buttonStyles = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).slice(0, 3);
      return buttons.map((btn, i) => {
        const styles = getComputedStyle(btn);
        return {
          buttonIndex: i,
          display: styles.display,
          padding: styles.padding,
          borderRadius: styles.borderRadius,
          backgroundColor: styles.backgroundColor,
          borderColor: styles.borderColor,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          cursor: styles.cursor,
          visible: styles.display !== 'none' && styles.opacity !== '0'
        };
      });
    });
    
    console.log('\n🔘 Button Styles:');
    buttonStyles.forEach((style, i) => {
      console.log(`   Button ${i + 1}:`, {
        visible: style.visible,
        styled: style.padding !== '0px' && style.borderRadius !== '0px',
        bgColor: style.backgroundColor,
        fontSize: style.fontSize
      });
    });
    
    // Test View button with styling check
    console.log('\n🔍 Testing View Button with CSS check...');
    const viewButton = await page.$('button[title="View Invoice"]');
    if (viewButton) {
      const beforeStyles = await page.evaluate((btn) => {
        const styles = window.getComputedStyle(btn);
        return {
          opacity: styles.opacity,
          display: styles.display,
          visibility: styles.visibility,
          pointerEvents: styles.pointerEvents
        };
      }, viewButton);
      
      console.log('   Button styles before click:', beforeStyles);
      
      await viewButton.click();
      await new Promise(r => setTimeout(r, 1000));
      
      const dialog = await page.$('[role="dialog"]');
      if (dialog) {
        const dialogStyles = await page.evaluate((dlg) => {
          const styles = window.getComputedStyle(dlg);
          return {
            display: styles.display,
            opacity: styles.opacity,
            visibility: styles.visibility,
            zIndex: styles.zIndex,
            position: styles.position
          };
        }, dialog);
        
        console.log('   ✅ Dialog opened with styles:', dialogStyles);
        await page.keyboard.press('Escape');
        await new Promise(r => setTimeout(r, 500));
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 CSS VISIBILITY SUMMARY');
    console.log('='.repeat(50));
    console.log('✅ CSS loaded and applied:', cardStyle && cardStyle.visible);
    console.log('✅ Buttons styled:', buttonStyles.some(b => b.styled));
    console.log('✅ Screenshot taken: /tmp/invoice-page-with-css.png');
    console.log('\n💡 If CSS is not visible in tests:');
    console.log('   1. Check screenshot to verify visual rendering');
    console.log('   2. Ensure waitUntil: "networkidle0" is used');
    console.log('   3. Wait for CSS to load explicitly');
    console.log('   4. Check Tailwind CSS is properly configured');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();


