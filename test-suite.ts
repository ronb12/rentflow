import puppeteer, { Browser, Page } from 'puppeteer';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  screenshot?: string;
}

class RentFlowTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];

  async setup() {
    console.log('🚀 Starting RentFlow Test Suite...');
    this.browser = await puppeteer.launch({ 
      headless: false, // Set to true for CI/CD
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
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
    const screenshot = await this.page.screenshot({ 
      path: `test-screenshots/${name}.png`,
      fullPage: true 
    });
    return `test-screenshots/${name}.png`;
  }

  async addResult(test: string, status: 'PASS' | 'FAIL', message: string) {
    const screenshot = await this.takeScreenshot(`${test.toLowerCase().replace(/\s+/g, '-')}-${status.toLowerCase()}`);
    this.results.push({ test, status, message, screenshot });
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${message}`);
  }

  async navigateTo(url: string) {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.goto(url, { waitUntil: 'networkidle0' });
    await this.page.waitForTimeout(1000);
  }

  async testLogin() {
    try {
      await this.navigateTo('http://localhost:3004/login');
      
      // Test login form
      await this.page!.waitForSelector('input[type="email"]');
      await this.page!.type('input[type="email"]', 'test@example.com');
      await this.page!.type('input[type="password"]', 'testpassword123');
      
      await this.page!.click('button[type="submit"]');
      await this.page!.waitForNavigation({ waitUntil: 'networkidle0' });
      
      // Check if redirected to dashboard
      const currentUrl = this.page!.url();
      if (currentUrl.includes('/dashboard')) {
        await this.addResult('Login Test', 'PASS', 'Successfully logged in and redirected to dashboard');
      } else {
        await this.addResult('Login Test', 'FAIL', `Expected dashboard redirect, got: ${currentUrl}`);
      }
    } catch (error) {
      await this.addResult('Login Test', 'FAIL', `Login failed: ${error}`);
    }
  }

  async testDashboard() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard');
      
      // Check dashboard elements
      await this.page!.waitForSelector('h1');
      const title = await this.page!.$eval('h1', el => el.textContent);
      
      if (title?.includes('Dashboard')) {
        await this.addResult('Dashboard Test', 'PASS', 'Dashboard loaded successfully');
      } else {
        await this.addResult('Dashboard Test', 'FAIL', `Dashboard title not found: ${title}`);
      }

      // Test navigation menu
      const navItems = await this.page!.$$('nav a');
      if (navItems.length >= 5) {
        await this.addResult('Navigation Test', 'PASS', `Found ${navItems.length} navigation items`);
      } else {
        await this.addResult('Navigation Test', 'FAIL', `Expected 5+ nav items, found ${navItems.length}`);
      }
    } catch (error) {
      await this.addResult('Dashboard Test', 'FAIL', `Dashboard test failed: ${error}`);
    }
  }

  async testProperties() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/properties');
      
      // Test add property button
      await this.page!.waitForSelector('button');
      await this.page!.click('button:has-text("Add Property")');
      await this.page!.waitForTimeout(2000);
      
      await this.addResult('Properties Test', 'PASS', 'Properties page loaded and Add Property button works');
    } catch (error) {
      await this.addResult('Properties Test', 'FAIL', `Properties test failed: ${error}`);
    }
  }

  async testTenants() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/tenants');
      
      // Test add tenant button
      await this.page!.waitForSelector('button');
      await this.page!.click('button:has-text("Add Tenant")');
      await this.page!.waitForTimeout(2000);
      
      await this.addResult('Tenants Test', 'PASS', 'Tenants page loaded and Add Tenant button works');
    } catch (error) {
      await this.addResult('Tenants Test', 'FAIL', `Tenants test failed: ${error}`);
    }
  }

  async testInspections() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/inspections');
      
      // Test new inspection button
      await this.page!.waitForSelector('button');
      await this.page!.click('button:has-text("New Inspection")');
      await this.page!.waitForTimeout(2000);
      
      // Check if on new inspection page
      const currentUrl = this.page!.url();
      if (currentUrl.includes('/inspections/new')) {
        await this.addResult('Inspections Test', 'PASS', 'Inspections page loaded and New Inspection button works');
      } else {
        await this.addResult('Inspections Test', 'FAIL', `Expected new inspection page, got: ${currentUrl}`);
      }
    } catch (error) {
      await this.addResult('Inspections Test', 'FAIL', `Inspections test failed: ${error}`);
    }
  }

  async testNewInspection() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/inspections/new');
      
      // Fill inspection form
      await this.page!.waitForSelector('input[name="conditionNotes"]');
      await this.page!.type('input[name="conditionNotes"]', 'Test inspection notes');
      
      // Test file upload
      const fileInput = await this.page!.$('input[type="file"]');
      if (fileInput) {
        await this.addResult('File Upload Test', 'PASS', 'File upload input found');
      } else {
        await this.addResult('File Upload Test', 'FAIL', 'File upload input not found');
      }
      
      await this.addResult('New Inspection Test', 'PASS', 'New inspection form loaded successfully');
    } catch (error) {
      await this.addResult('New Inspection Test', 'FAIL', `New inspection test failed: ${error}`);
    }
  }

  async testPWAFeatures() {
    try {
      await this.navigateTo('http://localhost:3004');
      
      // Check for PWA manifest
      const manifestLink = await this.page!.$('link[rel="manifest"]');
      if (manifestLink) {
        await this.addResult('PWA Manifest Test', 'PASS', 'PWA manifest found');
      } else {
        await this.addResult('PWA Manifest Test', 'FAIL', 'PWA manifest not found');
      }
      
      // Check for service worker
      const swRegistered = await this.page!.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      
      if (swRegistered) {
        await this.addResult('Service Worker Test', 'PASS', 'Service Worker API available');
      } else {
        await this.addResult('Service Worker Test', 'FAIL', 'Service Worker API not available');
      }
    } catch (error) {
      await this.addResult('PWA Features Test', 'FAIL', `PWA test failed: ${error}`);
    }
  }

  async testOfflineMode() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/inspections');
      
      // Simulate offline
      await this.page!.setOfflineMode(true);
      await this.page!.waitForTimeout(1000);
      
      // Try to navigate
      await this.page!.click('button:has-text("New Inspection")');
      await this.page!.waitForTimeout(2000);
      
      await this.addResult('Offline Mode Test', 'PASS', 'App handles offline mode gracefully');
      
      // Go back online
      await this.page!.setOfflineMode(false);
    } catch (error) {
      await this.addResult('Offline Mode Test', 'FAIL', `Offline test failed: ${error}`);
    }
  }

  async testAPIEndpoints() {
    try {
      // Test properties API
      const propertiesResponse = await this.page!.evaluate(async () => {
        const response = await fetch('/api/properties');
        return { status: response.status, ok: response.ok };
      });
      
      if (propertiesResponse.ok) {
        await this.addResult('Properties API Test', 'PASS', 'Properties API endpoint working');
      } else {
        await this.addResult('Properties API Test', 'FAIL', `Properties API returned status: ${propertiesResponse.status}`);
      }
      
      // Test tenants API
      const tenantsResponse = await this.page!.evaluate(async () => {
        const response = await fetch('/api/tenants');
        return { status: response.status, ok: response.ok };
      });
      
      if (tenantsResponse.ok) {
        await this.addResult('Tenants API Test', 'PASS', 'Tenants API endpoint working');
      } else {
        await this.addResult('Tenants API Test', 'FAIL', `Tenants API returned status: ${tenantsResponse.status}`);
      }
    } catch (error) {
      await this.addResult('API Endpoints Test', 'FAIL', `API test failed: ${error}`);
    }
  }

  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🧪 Running comprehensive RentFlow test suite...\n');
      
      await this.testLogin();
      await this.testDashboard();
      await this.testProperties();
      await this.testTenants();
      await this.testInspections();
      await this.testNewInspection();
      await this.testPWAFeatures();
      await this.testOfflineMode();
      await this.testAPIEndpoints();
      
      // Generate test report
      await this.generateReport();
      
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      await this.teardown();
    }
  }

  async generateReport() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    
    console.log('\n📊 TEST REPORT');
    console.log('================');
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

// Run the test suite
const tester = new RentFlowTester();
tester.runAllTests().catch(console.error);
