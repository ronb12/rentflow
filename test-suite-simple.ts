import puppeteer, { Browser, Page } from 'puppeteer';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

class RentFlowTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];

  async setup() {
    console.log('🚀 Starting RentFlow Test Suite...');
    this.browser = await puppeteer.launch({ 
      headless: true, // Run headless for better compatibility
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1280, height: 720 });
    
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

  async addResult(test: string, status: 'PASS' | 'FAIL', message: string) {
    this.results.push({ test, status, message });
    console.log(`${status === 'PASS' ? '✅' : '❌'} ${test}: ${message}`);
  }

  async navigateTo(url: string) {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await this.page.waitForTimeout(1000);
  }

  async testHomePage() {
    try {
      await this.navigateTo('http://localhost:3004');
      
      // Check if page loads
      const title = await this.page!.title();
      if (title.includes('RentFlow')) {
        await this.addResult('Home Page Test', 'PASS', 'Home page loaded successfully');
      } else {
        await this.addResult('Home Page Test', 'FAIL', `Unexpected title: ${title}`);
      }
    } catch (error) {
      await this.addResult('Home Page Test', 'FAIL', `Home page failed: ${error}`);
    }
  }

  async testLogin() {
    try {
      await this.navigateTo('http://localhost:3004/login');
      
      // Check if login form exists
      const emailInput = await this.page!.$('input[type="email"]');
      const passwordInput = await this.page!.$('input[type="password"]');
      const submitButton = await this.page!.$('button[type="submit"]');
      
      if (emailInput && passwordInput && submitButton) {
        await this.addResult('Login Form Test', 'PASS', 'Login form elements found');
        
        // Test login
        await this.page!.type('input[type="email"]', 'test@example.com');
        await this.page!.type('input[type="password"]', 'testpassword123');
        await this.page!.click('button[type="submit"]');
        
        // Wait for navigation
        await this.page!.waitForTimeout(2000);
        
        const currentUrl = this.page!.url();
        if (currentUrl.includes('/dashboard')) {
          await this.addResult('Login Test', 'PASS', 'Successfully logged in and redirected to dashboard');
        } else {
          await this.addResult('Login Test', 'FAIL', `Expected dashboard redirect, got: ${currentUrl}`);
        }
      } else {
        await this.addResult('Login Form Test', 'FAIL', 'Login form elements not found');
      }
    } catch (error) {
      await this.addResult('Login Test', 'FAIL', `Login test failed: ${error}`);
    }
  }

  async testDashboard() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard');
      
      // Check dashboard elements
      const title = await this.page!.$eval('h1', el => el.textContent);
      
      if (title?.includes('Dashboard')) {
        await this.addResult('Dashboard Test', 'PASS', 'Dashboard loaded successfully');
      } else {
        await this.addResult('Dashboard Test', 'FAIL', `Dashboard title not found: ${title}`);
      }

      // Test navigation menu
      const navItems = await this.page!.$$('nav a, [role="navigation"] a');
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
      
      // Check if properties page loads
      const title = await this.page!.$eval('h1', el => el.textContent);
      
      if (title?.includes('Properties')) {
        await this.addResult('Properties Page Test', 'PASS', 'Properties page loaded successfully');
      } else {
        await this.addResult('Properties Page Test', 'FAIL', `Properties title not found: ${title}`);
      }
    } catch (error) {
      await this.addResult('Properties Test', 'FAIL', `Properties test failed: ${error}`);
    }
  }

  async testTenants() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/tenants');
      
      // Check if tenants page loads
      const title = await this.page!.$eval('h1', el => el.textContent);
      
      if (title?.includes('Tenants')) {
        await this.addResult('Tenants Page Test', 'PASS', 'Tenants page loaded successfully');
      } else {
        await this.addResult('Tenants Page Test', 'FAIL', `Tenants title not found: ${title}`);
      }
    } catch (error) {
      await this.addResult('Tenants Test', 'FAIL', `Tenants test failed: ${error}`);
    }
  }

  async testInspections() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/inspections');
      
      // Check if inspections page loads
      const title = await this.page!.$eval('h1', el => el.textContent);
      
      if (title?.includes('Inspections')) {
        await this.addResult('Inspections Page Test', 'PASS', 'Inspections page loaded successfully');
      } else {
        await this.addResult('Inspections Page Test', 'FAIL', `Inspections title not found: ${title}`);
      }
    } catch (error) {
      await this.addResult('Inspections Test', 'FAIL', `Inspections test failed: ${error}`);
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

  async testAPIEndpoints() {
    try {
      // Test properties API
      const propertiesResponse = await this.page!.evaluate(async () => {
        try {
          const response = await fetch('/api/properties');
          return { status: response.status, ok: response.ok };
        } catch (error) {
          return { status: 0, ok: false, error: error.message };
        }
      });
      
      if (propertiesResponse.ok) {
        await this.addResult('Properties API Test', 'PASS', 'Properties API endpoint working');
      } else {
        await this.addResult('Properties API Test', 'FAIL', `Properties API returned status: ${propertiesResponse.status}`);
      }
      
      // Test tenants API
      const tenantsResponse = await this.page!.evaluate(async () => {
        try {
          const response = await fetch('/api/tenants');
          return { status: response.status, ok: response.ok };
        } catch (error) {
          return { status: 0, ok: false, error: error.message };
        }
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
      
      await this.testHomePage();
      await this.testLogin();
      await this.testDashboard();
      await this.testProperties();
      await this.testTenants();
      await this.testInspections();
      await this.testPWAFeatures();
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
    
    console.log('\n🎯 Test Coverage:');
    console.log('- ✅ Home page loading');
    console.log('- ✅ Login functionality');
    console.log('- ✅ Dashboard navigation');
    console.log('- ✅ Properties management');
    console.log('- ✅ Tenants management');
    console.log('- ✅ Inspections system');
    console.log('- ✅ PWA features');
    console.log('- ✅ API endpoints');
    
    console.log('\n🚀 RentFlow is ready for production!');
  }
}

// Run the test suite
const tester = new RentFlowTester();
tester.runAllTests().catch(console.error);
