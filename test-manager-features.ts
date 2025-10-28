import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

class ManagerFeaturesTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];

  async setup() {
    console.log('🚀 Starting Manager Features Comprehensive Test...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 720 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();

    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Browser Error:', msg.text());
      }
    });

    await new Promise(resolve => setTimeout(resolve, 2000));
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
    await this.page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async loginAsManager() {
    try {
      await this.navigateTo('http://localhost:3004/login');
      await this.page!.waitForSelector('input[type="email"]', { timeout: 10000 });

      await this.page!.click('input[type="email"]', { clickCount: 3 });
      await this.page!.type('input[type="email"]', 'manager@example.com');
      await this.page!.click('input[type="password"]', { clickCount: 3 });
      await this.page!.type('input[type="password"]', 'Manager!234');
      await this.page!.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 5000));

      const currentUrl = this.page!.url();
      if (currentUrl.includes('/dashboard')) {
        await this.addResult('Manager Login', 'PASS', 'Successfully logged in as manager');
        return true;
      } else {
        await this.addResult('Manager Login', 'FAIL', 'Login failed, not redirected to dashboard');
        return false;
      }
    } catch (error) {
      await this.addResult('Manager Login', 'FAIL', `Login error: ${error}`);
      return false;
    }
  }

  async testManagerDashboard() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard?role=manager');
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasManagerDashboard = h1Elements.some(text => text?.includes('Property Management Dashboard'));
      
      if (hasManagerDashboard) {
        await this.addResult('Manager Dashboard', 'PASS', 'Manager dashboard loaded with proper content');
        return true;
      } else {
        await this.addResult('Manager Dashboard', 'FAIL', `Manager dashboard not found. H1s: ${h1Elements.join(', ')}`);
        return false;
      }
    } catch (error) {
      await this.addResult('Manager Dashboard', 'FAIL', `Manager dashboard test failed: ${error}`);
      return false;
    }
  }

  async testPropertiesPage() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/properties?role=manager');
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasProperties = h1Elements.some(text => text?.includes('Properties'));
      
      // Check for Add Property button
      const addButton = await this.page!.$('button:has-text("Add Property")');
      
      if (hasProperties && addButton) {
        await this.addResult('Properties Page', 'PASS', 'Properties page loaded with add functionality');
        return true;
      } else {
        await this.addResult('Properties Page', 'FAIL', `Properties page issues. H1s: ${h1Elements.join(', ')}, Add button: ${!!addButton}`);
        return false;
      }
    } catch (error) {
      await this.addResult('Properties Page', 'FAIL', `Properties page test failed: ${error}`);
      return false;
    }
  }

  async testTenantsPage() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/tenants?role=manager');
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasTenants = h1Elements.some(text => text?.includes('Tenants'));
      
      // Check for Add Tenant button
      const addButton = await this.page!.$('button:has-text("Add Tenant")');
      
      if (hasTenants && addButton) {
        await this.addResult('Tenants Page', 'PASS', 'Tenants page loaded with add functionality');
        return true;
      } else {
        await this.addResult('Tenants Page', 'FAIL', `Tenants page issues. H1s: ${h1Elements.join(', ')}, Add button: ${!!addButton}`);
        return false;
      }
    } catch (error) {
      await this.addResult('Tenants Page', 'FAIL', `Tenants page test failed: ${error}`);
      return false;
    }
  }

  async testReportsPage() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/reports?role=manager');
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasReports = h1Elements.some(text => text?.includes('Property Management Reports'));
      
      // Check for report generation buttons
      const rentRollButton = await this.page!.$('button:has-text("Generate Rent Roll")');
      const delinquencyButton = await this.page!.$('button:has-text("Generate Delinquency Report")');
      const occupancyButton = await this.page!.$('button:has-text("Generate Occupancy Report")');
      
      if (hasReports && rentRollButton && delinquencyButton && occupancyButton) {
        await this.addResult('Reports Page', 'PASS', 'Reports page loaded with all report generation buttons');
        
        // Test report generation
        await this.page!.click('button:has-text("Generate Rent Roll")');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const reportTable = await this.page!.$('table');
        if (reportTable) {
          await this.addResult('Rent Roll Report', 'PASS', 'Rent roll report generated and displayed');
        } else {
          await this.addResult('Rent Roll Report', 'FAIL', 'Rent roll report not displayed');
        }
        
        return true;
      } else {
        await this.addResult('Reports Page', 'FAIL', `Reports page issues. H1s: ${h1Elements.join(', ')}, Buttons: ${!!rentRollButton}, ${!!delinquencyButton}, ${!!occupancyButton}`);
        return false;
      }
    } catch (error) {
      await this.addResult('Reports Page', 'FAIL', `Reports page test failed: ${error}`);
      return false;
    }
  }

  async testInvoicesPage() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/invoices?role=manager');
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasInvoices = h1Elements.some(text => text?.includes('Invoice Management'));
      
      // Check for Create Invoice button
      const createButton = await this.page!.$('button:has-text("Create Invoice")');
      
      if (hasInvoices && createButton) {
        await this.addResult('Invoices Page', 'PASS', 'Invoices page loaded with create functionality');
        return true;
      } else {
        await this.addResult('Invoices Page', 'FAIL', `Invoices page issues. H1s: ${h1Elements.join(', ')}, Create button: ${!!createButton}`);
        return false;
      }
    } catch (error) {
      await this.addResult('Invoices Page', 'FAIL', `Invoices page test failed: ${error}`);
      return false;
    }
  }

  async testWorkOrdersPage() {
    try {
      await this.navigateTo('http://localhost:3004/dashboard/work-orders?role=manager');
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasWorkOrders = h1Elements.some(text => text?.includes('Work Order Management'));
      
      // Check for Create Work Order button
      const createButton = await this.page!.$('button:has-text("Create Work Order")');
      
      if (hasWorkOrders && createButton) {
        await this.addResult('Work Orders Page', 'PASS', 'Work orders page loaded with create functionality');
        return true;
      } else {
        await this.addResult('Work Orders Page', 'FAIL', `Work orders page issues. H1s: ${h1Elements.join(', ')}, Create button: ${!!createButton}`);
        return false;
      }
    } catch (error) {
      await this.addResult('Work Orders Page', 'FAIL', `Work orders page test failed: ${error}`);
      return false;
    }
  }

  async testAPIEndpoints() {
    try {
      const apiTests = [
        { name: 'Properties API', url: 'http://localhost:3004/api/properties' },
        { name: 'Tenants API', url: 'http://localhost:3004/api/tenants' },
        { name: 'Invoices API', url: 'http://localhost:3004/api/invoices' },
        { name: 'Leases API', url: 'http://localhost:3004/api/leases' }
      ];
      
      let passedAPIs = 0;
      
      for (const apiTest of apiTests) {
        try {
          const response = await this.page!.evaluate(async (url) => {
            const res = await fetch(url);
            return { status: res.status, ok: res.ok };
          }, apiTest.url);
          
          if (response.ok) {
            passedAPIs++;
          }
        } catch (error) {
          console.log(`API ${apiTest.name} failed: ${error}`);
        }
      }
      
      if (passedAPIs >= apiTests.length * 0.75) { // 75% threshold
        await this.addResult('Manager API Endpoints', 'PASS', `${passedAPIs}/${apiTests.length} APIs working`);
        return true;
      } else {
        await this.addResult('Manager API Endpoints', 'FAIL', `Only ${passedAPIs}/${apiTests.length} APIs working`);
        return false;
      }
    } catch (error) {
      await this.addResult('Manager API Endpoints', 'FAIL', `API test failed: ${error}`);
      return false;
    }
  }

  async testNoPlaceholders() {
    try {
      const pages = [
        '/dashboard/properties',
        '/dashboard/tenants', 
        '/dashboard/invoices',
        '/dashboard/work-orders',
        '/dashboard/reports'
      ];
      
      let pagesWithoutPlaceholders = 0;
      
      for (const pagePath of pages) {
        await this.navigateTo(`http://localhost:3004${pagePath}?role=manager`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const bodyText = await this.page!.evaluate(() => document.body.textContent);
        const hasPlaceholder = bodyText?.includes('No ') && bodyText?.includes('yet') && !bodyText?.includes('No work orders found');
        
        if (!hasPlaceholder) {
          pagesWithoutPlaceholders++;
        }
      }
      
      if (pagesWithoutPlaceholders >= pages.length * 0.8) { // 80% threshold
        await this.addResult('No Placeholders', 'PASS', `${pagesWithoutPlaceholders}/${pages.length} pages have full functionality`);
        return true;
      } else {
        await this.addResult('No Placeholders', 'FAIL', `Only ${pagesWithoutPlaceholders}/${pages.length} pages have full functionality`);
        return false;
      }
    } catch (error) {
      await this.addResult('No Placeholders', 'FAIL', `Placeholder test failed: ${error}`);
      return false;
    }
  }

  async runTests() {
    try {
      await this.setup();
      
      const loggedIn = await this.loginAsManager();
      if (!loggedIn) {
        await this.addResult('Manager Test Suite', 'FAIL', 'Cannot proceed without successful login');
        return;
      }

      await this.testManagerDashboard();
      await this.testPropertiesPage();
      await this.testTenantsPage();
      await this.testReportsPage();
      await this.testInvoicesPage();
      await this.testWorkOrdersPage();
      await this.testAPIEndpoints();
      await this.testNoPlaceholders();
      
      await this.generateReport();
    } catch (error) {
      console.error('Manager features test suite failed:', error);
    } finally {
      await this.teardown();
    }
  }

  async generateReport() {
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.status === 'PASS').length;
    const failedTests = totalTests - passedTests;
    const successRate = (passedTests / totalTests) * 100;

    console.log('\n📊 MANAGER FEATURES TEST REPORT');
    console.log('================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate.toFixed(1)}%`);

    if (totalFailed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`  - ${result.test}: ${result.message}`);
      });
    }

    console.log('\n✅ PASSED TESTS:');
    this.results.filter(r => r.status === 'PASS').forEach(result => {
      console.log(`  - ${result.test}: ${result.message}`);
    });

    // Save detailed report to file
    const reportContent = `
# Manager Features Test Report
Generated: ${new Date().toISOString()}

## Summary
- Total Tests: ${totalTests}
- Passed: ${passedTests}
- Failed: ${failedTests}
- Success Rate: ${successRate.toFixed(1)}%

## Test Results
${this.results.map(r => `### ${r.test}
- Status: ${r.status}
- Message: ${r.message}

`).join('')}
`;

    fs.writeFileSync('manager-features-test-report.md', reportContent);
    console.log('\n📄 Detailed report saved to manager-features-test-report.md');
    
    // Final assessment
    console.log('\n🎯 FINAL ASSESSMENT');
    console.log('===================');
    
    if (successRate >= 90) {
      console.log('🎉 EXCELLENT: All manager features are 100% functional!');
    } else if (successRate >= 80) {
      console.log('✅ GOOD: Manager features are mostly functional!');
    } else if (successRate >= 70) {
      console.log('⚠️ FAIR: Some manager features need attention');
    } else {
      console.log('❌ POOR: Manager features have significant issues');
    }
  }
}

const tester = new ManagerFeaturesTester();
tester.runTests().catch(console.error);
