// Detailed test to see what's happening with report generation
import puppeteer from 'puppeteer';

async function testReportGeneration() {
  console.log('🧪 Testing Report Generation in Detail...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Go to reports page
    console.log('1. Going to reports page...');
    await page.goto('http://localhost:3004/dashboard/reports?role=manager');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check initial state
    console.log('2. Checking initial state...');
    const initialBodyText = await page.evaluate(() => document.body.textContent);
    console.log('Initial state contains "Generate Rent Roll":', initialBodyText?.includes('Generate Rent Roll'));
    console.log('Initial state contains "Rent Roll Report":', initialBodyText?.includes('Rent Roll Report'));
    
    // Find and click rent roll button
    console.log('3. Finding and clicking rent roll button...');
    const buttons = await page.$$('button');
    let rentRollButton = null;
    
    for (const button of buttons) {
      const buttonText = await page.evaluate(el => el.textContent, button);
      if (buttonText?.includes('Generate Rent Roll')) {
        rentRollButton = button;
        console.log('Found rent roll button:', buttonText);
        break;
      }
    }
    
    if (rentRollButton) {
      await rentRollButton.click();
      console.log('Clicked rent roll button');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check what happened after clicking
      console.log('4. Checking state after clicking...');
      const afterClickBodyText = await page.evaluate(() => document.body.textContent);
      console.log('After click contains "Rent Roll Report":', afterClickBodyText?.includes('Rent Roll Report'));
      console.log('After click contains "Unit":', afterClickBodyText?.includes('Unit'));
      console.log('After click contains "Tenant":', afterClickBodyText?.includes('Tenant'));
      console.log('After click contains "Monthly Rent":', afterClickBodyText?.includes('Monthly Rent'));
      console.log('After click contains "John Doe":', afterClickBodyText?.includes('John Doe'));
      
      // Check for tables
      const tables = await page.$$('table');
      console.log('Number of tables found:', tables.length);
      
      if (tables.length > 0) {
        console.log('5. Analyzing table content...');
        const tableData = await page.evaluate(() => {
          const table = document.querySelector('table');
          if (!table) return null;
          
          const rows = Array.from(table.querySelectorAll('tr'));
          return rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return cells.map(cell => cell.textContent?.trim()).filter(Boolean);
          });
        });
        
        console.log('Table data:', tableData);
        
        // Check table headers
        const tableHeaders = await page.evaluate(() => {
          const table = document.querySelector('table');
          if (!table) return null;
          
          const headerRow = table.querySelector('tr');
          if (!headerRow) return null;
          
          const headers = Array.from(headerRow.querySelectorAll('th'));
          return headers.map(header => header.textContent?.trim()).filter(Boolean);
        });
        
        console.log('Table headers:', tableHeaders);
      } else {
        console.log('5. No tables found, checking for other elements...');
        
        // Check for any divs that might contain the report
        const reportDivs = await page.$$eval('div', divs => 
          divs.map(div => ({
            text: div.textContent?.substring(0, 100),
            className: div.className
          })).filter(div => 
            div.text?.includes('Unit') || 
            div.text?.includes('Tenant') || 
            div.text?.includes('Rent')
          )
        );
        
        console.log('Report divs found:', reportDivs);
      }
      
      // Check if report is hidden or not rendered
      console.log('6. Checking for hidden elements...');
      const hiddenElements = await page.$$eval('*', elements => 
        elements.filter(el => {
          const style = window.getComputedStyle(el);
          return style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0';
        }).map(el => ({
          tagName: el.tagName,
          text: el.textContent?.substring(0, 50),
          className: el.className
        }))
      );
      
      console.log('Hidden elements:', hiddenElements);
      
    } else {
      console.log('❌ Rent roll button not found');
    }
    
    // Take a screenshot
    await page.screenshot({ path: 'reports-after-click.png', fullPage: true });
    console.log('Screenshot saved as reports-after-click.png');
    
  } catch (error) {
    console.error('❌ Report generation test failed:', error);
  } finally {
    await browser.close();
  }
}

testReportGeneration().catch(console.error);
