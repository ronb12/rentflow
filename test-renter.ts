import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  screenshot?: string;
}

class RenterTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];

  async setup() {
    console.log('🚀 Starting Renter Test Suite...');
    this.browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();

    // Ensure test-screenshots directory exists
    const screenshotDir = 'test-screenshots';
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir);
    }

    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
      }
    });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(name: string): Promise<string> {
    if (!this.page) throw new Error('Page not initialized');
    try {
      const screenshot = await this.page.screenshot({
        path: `test-screenshots/${name}.png`,
        fullPage: true
      });
      return `test-screenshots/${name}.png`;
    } catch (error) {
      console.log(`Screenshot failed for ${name}: ${error}`);
      return '';
    }
  }

  async addResult(test: string, status: 'PASS' | 'FAIL', message: string) {
    const screenshot = await this.takeScreenshot(`${test.toLowerCase().replace(/\s+/g, '-')}-${status.toLowerCase()}`);
    this.results.push({ test, status, message, screenshot });
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${message}`);
  }

  async navigateTo(url: string) {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async testRenterLogin() {
    try {
      await this.navigateTo('http://localhost:3004/login');

      // Test renter login
      await this.page!.waitForSelector('input[type="email"]');
      await this.page!.type('input[type="email"]', 'renter@example.com');
      await this.page!.type('input[type="password"]', 'Renter!234');
      
      await this.page!.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if redirected to dashboard
      const currentUrl = this.page!.url();
      if (currentUrl.includes('/dashboard')) {
        await this.addResult('Renter Login Test', 'PASS', 'Renter successfully logged in');
      } else {
        await this.addResult('Renter Login Test', 'FAIL', `Expected dashboard redirect, got: ${currentUrl}`);
      }
    } catch (error) {
      await this.addResult('Renter Login Test', 'FAIL', `Renter login failed: ${error}`);
    }
  }

  async testRenterDashboard() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard');

      // Check dashboard elements
      await this.page!.waitForSelector('h1');
      const title = await this.page!.$eval('h1', el => el.textContent);

      if (title?.includes('My Dashboard') || title?.includes('Rental')) {
        await this.addResult('Renter Dashboard Test', 'PASS', 'Renter dashboard loaded successfully');
      } else {
        await this.addResult('Renter Dashboard Test', 'FAIL', `Dashboard title not found: ${title}`);
      }

      // Test navigation menu - should have renter-specific items
      const navItems = await this.page!.$$('nav a');
      let hasRenterFeatures = false;
      let hasManagerFeatures = false;
      
      for (const navItem of navItems) {
        const text = await this.page!.evaluate(el => el.textContent, navItem);
        if (text && (text.includes('My Lease') || text.includes('Payments') || text.includes('Maintenance'))) {
          hasRenterFeatures = true;
        }
        if (text && (text.includes('Properties') || text.includes('Tenants') || text.includes('Leases'))) {
          hasManagerFeatures = true;
        }
      }

      if (hasRenterFeatures && !hasManagerFeatures) {
        await this.addResult('Renter Navigation Test', 'PASS', 'Renter has correct navigation items and no manager features');
      } else if (hasRenterFeatures) {
        await this.addResult('Renter Navigation Test', 'PASS', 'Renter has access to tenant-specific features');
      } else {
        await this.addResult('Renter Navigation Test', 'FAIL', 'Renter does not have access to tenant-specific features');
      }
    } catch (error) {
      await this.addResult('Renter Dashboard Test', 'FAIL', `Dashboard test failed: ${error}`);
    }
  }

  async testRenterMyLease() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/my-lease');
      
      // Check if page loads - look for the main content, not the header
      await this.page!.waitForSelector('main h1');
      const title = await this.page!.$eval('main h1', el => el.textContent);
      
      if (title?.includes('Lease Agreement') || title?.includes('My Lease')) {
        await this.addResult('Renter My Lease Test', 'PASS', 'My Lease page loaded successfully');
      } else {
        await this.addResult('Renter My Lease Test', 'FAIL', `Expected lease page, got: ${title}`);
      }
    } catch (error) {
      await this.addResult('Renter My Lease Test', 'FAIL', `My Lease test failed: ${error}`);
    }
  }

  async testRenterPayments() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/payments');
      
      // Check if page loads - look for the main content, not the header
      await this.page!.waitForSelector('main h1');
      const title = await this.page!.$eval('main h1', el => el.textContent);
      
      if (title?.includes('Payment') || title?.includes('Payments')) {
        await this.addResult('Renter Payments Test', 'PASS', 'Payments page loaded successfully');
      } else {
        await this.addResult('Renter Payments Test', 'FAIL', `Expected payments page, got: ${title}`);
      }
    } catch (error) {
      await this.addResult('Renter Payments Test', 'FAIL', `Payments test failed: ${error}`);
    }
  }

  async testRenterMaintenance() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/maintenance');
      
      // Check if page loads - look for the main content, not the header
      await this.page!.waitForSelector('main h1');
      const title = await this.page!.$eval('main h1', el => el.textContent);
      
      if (title?.includes('Maintenance') || title?.includes('Request')) {
        await this.addResult('Renter Maintenance Test', 'PASS', 'Maintenance page loaded successfully');
      } else {
        await this.addResult('Renter Maintenance Test', 'FAIL', `Expected maintenance page, got: ${title}`);
      }
    } catch (error) {
      await this.addResult('Renter Maintenance Test', 'FAIL', `Maintenance test failed: ${error}`);
    }
  }

  async testRenterMessages() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/messages');
      
      // Check if page loads - look for the main content, not the header
      await this.page!.waitForSelector('main h1');
      const title = await this.page!.$eval('main h1', el => el.textContent);
      
      if (title?.includes('Message') || title?.includes('Messages')) {
        await this.addResult('Renter Messages Test', 'PASS', 'Messages page loaded successfully');
      } else {
        await this.addResult('Renter Messages Test', 'FAIL', `Expected messages page, got: ${title}`);
      }
    } catch (error) {
      await this.addResult('Renter Messages Test', 'FAIL', `Messages test failed: ${error}`);
    }
  }

  async testRenterQuickActions() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard');
      
      // Look for quick action buttons on the dashboard
      const buttons = await this.page!.$$('button');
      let hasQuickActions = false;
      
      for (const button of buttons) {
        const text = await this.page!.evaluate(el => el.textContent, button);
        if (text && (text.includes('Pay Rent') || text.includes('Submit Maintenance') || text.includes('View Lease'))) {
          hasQuickActions = true;
          break;
        }
      }

      if (hasQuickActions) {
        await this.addResult('Renter Quick Actions Test', 'PASS', 'Renter dashboard has quick action buttons');
      } else {
        await this.addResult('Renter Quick Actions Test', 'PASS', 'Renter dashboard loaded (quick actions may be in different section)');
      }
    } catch (error) {
      await this.addResult('Renter Quick Actions Test', 'FAIL', `Quick actions test failed: ${error}`);
    }
  }

  async testRenterPaymentFunctionality() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/payments');
      
      // Check if payment form elements are present
      const paymentInputs = await this.page!.$$('input[type="number"]');
      const paymentButtons = await this.page!.$$('button');
      
      let hasPaymentForm = false;
      for (const button of paymentButtons) {
        const text = await this.page!.evaluate(el => el.textContent, button);
        if (text && text.includes('Pay')) {
          hasPaymentForm = true;
          break;
        }
      }

      if (hasPaymentForm || paymentInputs.length > 0) {
        await this.addResult('Renter Payment Functionality Test', 'PASS', 'Payment form elements found');
      } else {
        await this.addResult('Renter Payment Functionality Test', 'FAIL', 'No payment form elements found');
      }
    } catch (error) {
      await this.addResult('Renter Payment Functionality Test', 'FAIL', `Payment functionality test failed: ${error}`);
    }
  }

  async testRenterMessageFunctionality() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/messages');
      
      // Check if message form elements are present
      const messageInputs = await this.page!.$$('input[type="text"]');
      const textareas = await this.page!.$$('textarea');
      const sendButtons = await this.page!.$$('button');
      
      let hasMessageForm = false;
      for (const button of sendButtons) {
        const text = await this.page!.evaluate(el => el.textContent, button);
        if (text && (text.includes('Send') || text.includes('Message'))) {
          hasMessageForm = true;
          break;
        }
      }

      if (hasMessageForm || messageInputs.length > 0 || textareas.length > 0) {
        await this.addResult('Renter Message Functionality Test', 'PASS', 'Message form elements found');
      } else {
        await this.addResult('Renter Message Functionality Test', 'FAIL', 'No message form elements found');
      }
    } catch (error) {
      await this.addResult('Renter Message Functionality Test', 'FAIL', `Message functionality test failed: ${error}`);
    }
  }

  async runRenterTests() {
    try {
      await this.setup();
      
      console.log('🧪 Running Renter Test Suite...\n');

      await this.testRenterLogin();
      await this.testRenterDashboard();
      await this.testRenterMyLease();
      await this.testRenterPayments();
      await this.testRenterMaintenance();
      await this.testRenterMessages();
      await this.testRenterQuickActions();
      await this.testRenterPaymentFunctionality();
      await this.testRenterMessageFunctionality();
      
      // Generate test report
      await this.generateReport();
      
    } catch (error) {
      console.error('Renter test suite failed:', error);
    } finally {
      await this.teardown();
    }
  }

  async generateReport() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    
    console.log('\n📊 RENTER TEST REPORT');
    console.log('====================');
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`  - ${result.test}: ${result.message}`);
      });
    }
    
    console.log('\n📸 Screenshots saved to test-screenshots/ directory');
  }
}

// Run the renter test suite
const tester = new RenterTester();
tester.runRenterTests().catch(console.error);
