// Simple test to check if the reports page is loading
import puppeteer from 'puppeteer';

async function testReportsPageLoading() {
  console.log('🔍 Testing Reports Page Loading...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 720 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // Enable console logging
    page.on('console', msg => {
      console.log('Browser Console:', msg.text());
    });
    
    page.on('pageerror', error => {
      console.log('Page Error:', error.message);
    });
    
    // Go to reports page
    console.log('1. Going to reports page...');
    await page.goto('http://localhost:3004/dashboard/reports?role=manager', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Get page info
    const title = await page.title();
    console.log('Page title:', title);
    
    const url = page.url();
    console.log('Current URL:', url);
    
    // Check if page is loading
    const isLoading = await page.evaluate(() => {
      return document.readyState;
    });
    console.log('Document ready state:', isLoading);
    
    // Get all text content
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('Body text length:', bodyText?.length);
    
    // Check for specific content
    console.log('Contains "Property Management Reports":', bodyText?.includes('Property Management Reports'));
    console.log('Contains "Generate Rent Roll":', bodyText?.includes('Generate Rent Roll'));
    console.log('Contains "Generate Delinquency Report":', bodyText?.includes('Generate Delinquency Report'));
    console.log('Contains "Generate Occupancy Report":', bodyText?.includes('Generate Occupancy Report'));
    
    // Check for React components
    const reactRoot = await page.$('#__next');
    console.log('React root found:', !!reactRoot);
    
    // Check for any errors in the page
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[data-error]');
      return Array.from(errorElements).map(el => el.textContent);
    });
    console.log('Error elements:', errors);
    
    // Check if the page is showing a loading state
    const loadingElements = await page.$$eval('*', elements => 
      elements.filter(el => {
        const text = el.textContent;
        return text?.includes('Loading') || text?.includes('loading');
      }).map(el => el.textContent)
    );
    console.log('Loading elements:', loadingElements);
    
    // Take a screenshot
    await page.screenshot({ path: 'reports-page-loading.png', fullPage: true });
    console.log('Screenshot saved as reports-page-loading.png');
    
    // Check if there are any JavaScript errors
    const jsErrors = await page.evaluate(() => {
      return window.console.error ? 'Console.error available' : 'No console.error';
    });
    console.log('JavaScript errors check:', jsErrors);
    
  } catch (error) {
    console.error('❌ Reports page loading test failed:', error);
  } finally {
    await browser.close();
  }
}

testReportsPageLoading().catch(console.error);
