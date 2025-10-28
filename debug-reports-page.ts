// Simple test to check what's happening with the reports page
import puppeteer from 'puppeteer';

async function debugReportsPage() {
  console.log('🔍 Debugging Reports Page...');
  
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
    
    // Get page title
    const title = await page.title();
    console.log('Page title:', title);
    
    // Get current URL
    const url = page.url();
    console.log('Current URL:', url);
    
    // Get all text content
    const bodyText = await page.evaluate(() => document.body.textContent);
    console.log('Body text length:', bodyText?.length);
    console.log('First 500 chars:', bodyText?.substring(0, 500));
    
    // Check for specific elements
    const h1Count = await page.$$eval('h1', els => els.length);
    console.log('H1 count:', h1Count);
    
    const buttonCount = await page.$$eval('button', els => els.length);
    console.log('Button count:', buttonCount);
    
    // Check if page is loading
    const isLoading = await page.evaluate(() => {
      return document.readyState;
    });
    console.log('Document ready state:', isLoading);
    
    // Take a screenshot
    await page.screenshot({ path: 'reports-page-debug.png', fullPage: true });
    console.log('Screenshot saved as reports-page-debug.png');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await browser.close();
  }
}

debugReportsPage().catch(console.error);
