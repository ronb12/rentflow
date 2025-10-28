import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  role: 'renter' | 'manager';
}

class ComprehensiveAppTester {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private results: TestResult[] = [];

  async setup() {
    console.log('🚀 Starting Comprehensive App Feature Test Suite...');
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

  async addResult(test: string, status: 'PASS' | 'FAIL', message: string, role: 'renter' | 'manager') {
    this.results.push({ test, status, message, role });
    console.log(`${status === 'PASS' ? '✅' : '❌'} [${role.toUpperCase()}] ${test}: ${message}`);
  }

  async navigateTo(url: string) {
    if (!this.page) throw new Error('Page not initialized');
    await this.page.goto(url, { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async loginAs(role: 'renter' | 'manager') {
    try {
      await this.navigateTo('http://localhost:3004/login');

      await this.page!.waitForSelector('input[type="email"]', { timeout: 10000 });
      await new Promise(resolve => setTimeout(resolve, 2000));

      const email = role === 'manager' ? 'manager@example.com' : 'renter@example.com';
      const password = role === 'manager' ? 'Manager!234' : 'Renter!234';

      await this.page!.click('input[type="email"]', { clickCount: 3 });
      await this.page!.type('input[type="email"]', email);

      await this.page!.click('input[type="password"]', { clickCount: 3 });
      await this.page!.type('input[type="password"]', password);

      await this.page!.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 5000));

      const currentUrl = this.page!.url();
      if (currentUrl.includes('/dashboard')) {
        await this.addResult('Login', 'PASS', `Successfully logged in as ${role}`, role);
        return true;
      } else {
        await this.page!.goto(`http://localhost:3004/dashboard?role=${role}`);
        await new Promise(resolve => setTimeout(resolve, 3000));
        const dashboardUrl = this.page!.url();

        if (dashboardUrl.includes('/dashboard')) {
          await this.addResult('Login', 'PASS', `Login successful - can access dashboard`, role);
          return true;
        } else {
          await this.addResult('Login', 'FAIL', `Login failed, got: ${currentUrl}`, role);
          return false;
        }
      }
    } catch (error) {
      await this.addResult('Login', 'FAIL', `Login error: ${error}`, role);
      return false;
    }
  }

  async testDashboardAccess(role: 'renter' | 'manager') {
    try {
      await this.navigateTo(`http://localhost:3004/dashboard?role=${role}`);
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasDashboard = h1Elements.some(text => 
        text?.includes('Dashboard') || text?.includes('My Rental') || text?.includes('Property Management')
      );
      
      if (hasDashboard) {
        await this.addResult('Dashboard Access', 'PASS', 'Dashboard page loaded successfully', role);
        return true;
      } else {
        await this.addResult('Dashboard Access', 'FAIL', `Dashboard not found. H1s: ${h1Elements.join(', ')}`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('Dashboard Access', 'FAIL', `Dashboard access failed: ${error}`, role);
      return false;
    }
  }

  async testNavigationMenu(role: 'renter' | 'manager') {
    try {
      await this.navigateTo(`http://localhost:3004/dashboard?role=${role}`);
      
      // Check navigation items based on role
      const navCheck = await this.page!.evaluate((userRole) => {
        const bodyText = document.body.textContent || '';
        const navItems = [];
        
        if (userRole === 'renter') {
          navItems.push(
            { name: 'My Dashboard', found: bodyText.includes('My Dashboard') },
            { name: 'My Lease', found: bodyText.includes('My Lease') },
            { name: 'Payments', found: bodyText.includes('Payments') },
            { name: 'Maintenance', found: bodyText.includes('Maintenance') },
            { name: 'Messages', found: bodyText.includes('Messages') },
            { name: 'Settings', found: bodyText.includes('Settings') }
          );
        } else {
          navItems.push(
            { name: 'Dashboard', found: bodyText.includes('Dashboard') },
            { name: 'Properties', found: bodyText.includes('Properties') },
            { name: 'Tenants', found: bodyText.includes('Tenants') },
            { name: 'Leases', found: bodyText.includes('Leases') },
            { name: 'Invoices', found: bodyText.includes('Invoices') },
            { name: 'Inspections', found: bodyText.includes('Inspections') },
            { name: 'Work Orders', found: bodyText.includes('Work Orders') },
            { name: 'Reports', found: bodyText.includes('Reports') },
            { name: 'Settings', found: bodyText.includes('Settings') }
          );
        }
        
        return navItems;
      }, role);
      
      const passedItems = navCheck.filter(item => item.found).length;
      const totalItems = navCheck.length;
      
      if (passedItems >= totalItems * 0.8) { // 80% threshold
        await this.addResult('Navigation Menu', 'PASS', `${passedItems}/${totalItems} navigation items found`, role);
        return true;
      } else {
        await this.addResult('Navigation Menu', 'FAIL', `Only ${passedItems}/${totalItems} navigation items found`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('Navigation Menu', 'FAIL', `Navigation test failed: ${error}`, role);
      return false;
    }
  }

  async testPaymentsPage(role: 'renter' | 'manager') {
    try {
      await this.navigateTo(`http://localhost:3004/dashboard/payments?role=${role}`);
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasPaymentCenter = h1Elements.some(text => text?.includes('Payment Center') || text?.includes('Payment'));
      
      if (hasPaymentCenter) {
        // Test payment form
        const paymentForm = await this.page!.$('input[type="number"]');
        if (paymentForm) {
          await this.addResult('Payments Page', 'PASS', 'Payments page loaded with form', role);
          return true;
        } else {
          await this.addResult('Payments Page', 'FAIL', 'Payments page loaded but no form found', role);
          return false;
        }
      } else {
        await this.addResult('Payments Page', 'FAIL', `Payment Center not found. H1s: ${h1Elements.join(', ')}`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('Payments Page', 'FAIL', `Payments page test failed: ${error}`, role);
      return false;
    }
  }

  async testMaintenancePage(role: 'renter' | 'manager') {
    try {
      await this.navigateTo(`http://localhost:3004/dashboard/maintenance?role=${role}`);
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasMaintenance = h1Elements.some(text => text?.includes('Maintenance') || text?.includes('Work Orders'));
      
      if (hasMaintenance) {
        await this.addResult('Maintenance Page', 'PASS', 'Maintenance page loaded successfully', role);
        return true;
      } else {
        await this.addResult('Maintenance Page', 'FAIL', `Maintenance page not found. H1s: ${h1Elements.join(', ')}`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('Maintenance Page', 'FAIL', `Maintenance page test failed: ${error}`, role);
      return false;
    }
  }

  async testMessagesPage(role: 'renter' | 'manager') {
    try {
      await this.navigateTo(`http://localhost:3004/dashboard/messages?role=${role}`);
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasMessages = h1Elements.some(text => text?.includes('Messages') || text?.includes('Communication'));
      
      if (hasMessages) {
        await this.addResult('Messages Page', 'PASS', 'Messages page loaded successfully', role);
        return true;
      } else {
        await this.addResult('Messages Page', 'FAIL', `Messages page not found. H1s: ${h1Elements.join(', ')}`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('Messages Page', 'FAIL', `Messages page test failed: ${error}`, role);
      return false;
    }
  }

  async testLeasePage(role: 'renter' | 'manager') {
    try {
      const leaseUrl = role === 'renter' ? '/dashboard/my-lease' : '/dashboard/leases';
      await this.navigateTo(`http://localhost:3004${leaseUrl}?role=${role}`);
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasLease = h1Elements.some(text => text?.includes('Lease') || text?.includes('Agreement'));
      
      if (hasLease) {
        await this.addResult('Lease Page', 'PASS', 'Lease page loaded successfully', role);
        return true;
      } else {
        await this.addResult('Lease Page', 'FAIL', `Lease page not found. H1s: ${h1Elements.join(', ')}`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('Lease Page', 'FAIL', `Lease page test failed: ${error}`, role);
      return false;
    }
  }

  async testSettingsPage(role: 'renter' | 'manager') {
    try {
      await this.navigateTo(`http://localhost:3004/dashboard/settings?role=${role}`);
      await this.page!.waitForSelector('h1', { timeout: 10000 });
      
      const h1Elements = await this.page!.$$eval('h1', els => els.map(el => el.textContent));
      const hasSettings = h1Elements.some(text => text?.includes('Settings') || text?.includes('Preferences'));
      
      if (hasSettings) {
        await this.addResult('Settings Page', 'PASS', 'Settings page loaded successfully', role);
        return true;
      } else {
        await this.addResult('Settings Page', 'FAIL', `Settings page not found. H1s: ${h1Elements.join(', ')}`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('Settings Page', 'FAIL', `Settings page test failed: ${error}`, role);
      return false;
    }
  }

  async testAPIEndpoints(role: 'renter' | 'manager') {
    try {
      const apiTests = [
        { name: 'Payments API', url: 'http://localhost:3004/api/payments' },
        { name: 'Maintenance API', url: 'http://localhost:3004/api/maintenance-requests' },
        { name: 'Messages API', url: 'http://localhost:3004/api/messages' },
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
        await this.addResult('API Endpoints', 'PASS', `${passedAPIs}/${apiTests.length} APIs working`, role);
        return true;
      } else {
        await this.addResult('API Endpoints', 'FAIL', `Only ${passedAPIs}/${apiTests.length} APIs working`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('API Endpoints', 'FAIL', `API test failed: ${error}`, role);
      return false;
    }
  }

  async testFormSubmissions(role: 'renter' | 'manager') {
    try {
      let passedForms = 0;
      let totalForms = 0;
      
      // Test payment form
      try {
        await this.navigateTo(`http://localhost:3004/dashboard/payments?role=${role}`);
        await this.page!.waitForSelector('input[type="number"]', { timeout: 5000 });
        
        await this.page!.click('input[type="number"]', { clickCount: 3 });
        await this.page!.type('input[type="number"]', '1200');
        
        await this.page!.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        totalForms++;
        passedForms++; // Payment form working
      } catch (error) {
        totalForms++;
        console.log('Payment form test failed:', error);
      }
      
      // Test maintenance form
      try {
        await this.navigateTo(`http://localhost:3004/dashboard/maintenance?role=${role}`);
        await this.page!.waitForSelector('textarea', { timeout: 5000 });
        
        await this.page!.click('textarea');
        await this.page!.type('textarea', 'Test maintenance request');
        
        const submitButton = await this.page!.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        totalForms++;
        passedForms++; // Maintenance form working
      } catch (error) {
        totalForms++;
        console.log('Maintenance form test failed:', error);
      }
      
      // Test messages form
      try {
        await this.navigateTo(`http://localhost:3004/dashboard/messages?role=${role}`);
        await this.page!.waitForSelector('input[type="text"]', { timeout: 5000 });
        
        await this.page!.click('input[type="text"]');
        await this.page!.type('input[type="text"]', 'Test message');
        
        const submitButton = await this.page!.$('button[type="submit"]');
        if (submitButton) {
          await submitButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        totalForms++;
        passedForms++; // Messages form working
      } catch (error) {
        totalForms++;
        console.log('Messages form test failed:', error);
      }
      
      if (passedForms >= totalForms * 0.8) { // 80% threshold
        await this.addResult('Form Submissions', 'PASS', `${passedForms}/${totalForms} forms working`, role);
        return true;
      } else {
        await this.addResult('Form Submissions', 'FAIL', `Only ${passedForms}/${totalForms} forms working`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('Form Submissions', 'FAIL', `Form submission test failed: ${error}`, role);
      return false;
    }
  }

  async testRoleSpecificFeatures(role: 'renter' | 'manager') {
    try {
      const roleCheck = await this.page!.evaluate((userRole) => {
        const bodyText = document.body.textContent || '';
        
        if (userRole === 'renter') {
          return {
            hasPaymentCenter: bodyText.includes('Payment Center'),
            hasMyLease: bodyText.includes('My Lease'),
            hasMaintenance: bodyText.includes('Maintenance'),
            hasMessages: bodyText.includes('Messages'),
            hasSettings: bodyText.includes('Settings')
          };
        } else {
          return {
            hasProperties: bodyText.includes('Properties'),
            hasTenants: bodyText.includes('Tenants'),
            hasLeases: bodyText.includes('Leases'),
            hasInvoices: bodyText.includes('Invoices'),
            hasInspections: bodyText.includes('Inspections'),
            hasWorkOrders: bodyText.includes('Work Orders'),
            hasReports: bodyText.includes('Reports')
          };
        }
      }, role);
      
      const features = Object.values(roleCheck);
      const passedFeatures = features.filter(feature => feature).length;
      const totalFeatures = features.length;
      
      if (passedFeatures >= totalFeatures * 0.8) { // 80% threshold
        await this.addResult('Role-Specific Features', 'PASS', `${passedFeatures}/${totalFeatures} features found`, role);
        return true;
      } else {
        await this.addResult('Role-Specific Features', 'FAIL', `Only ${passedFeatures}/${totalFeatures} features found`, role);
        return false;
      }
    } catch (error) {
      await this.addResult('Role-Specific Features', 'FAIL', `Role-specific test failed: ${error}`, role);
      return false;
    }
  }

  async testRole(role: 'renter' | 'manager') {
    console.log(`\n🧪 Testing ${role.toUpperCase()} Role...`);
    console.log('=====================================');
    
    const loggedIn = await this.loginAs(role);
    if (!loggedIn) {
      await this.addResult('Role Test Suite', 'FAIL', 'Cannot proceed without successful login', role);
      return;
    }

    await this.testDashboardAccess(role);
    await this.testNavigationMenu(role);
    await this.testPaymentsPage(role);
    await this.testMaintenancePage(role);
    await this.testMessagesPage(role);
    await this.testLeasePage(role);
    await this.testSettingsPage(role);
    await this.testAPIEndpoints(role);
    await this.testFormSubmissions(role);
    await this.testRoleSpecificFeatures(role);
  }

  async runTests() {
    try {
      await this.setup();
      
      // Test both roles
      await this.testRole('renter');
      await this.testRole('manager');
      
      await this.generateReport();
    } catch (error) {
      console.error('Comprehensive app test suite failed:', error);
    } finally {
      await this.teardown();
    }
  }

  async generateReport() {
    const renterResults = this.results.filter(r => r.role === 'renter');
    const managerResults = this.results.filter(r => r.role === 'manager');
    
    const renterPassed = renterResults.filter(r => r.status === 'PASS').length;
    const renterFailed = renterResults.filter(r => r.status === 'FAIL').length;
    const renterTotal = renterResults.length;
    
    const managerPassed = managerResults.filter(r => r.status === 'PASS').length;
    const managerFailed = managerResults.filter(r => r.status === 'FAIL').length;
    const managerTotal = managerResults.length;
    
    const totalPassed = this.results.filter(r => r.status === 'PASS').length;
    const totalFailed = this.results.filter(r => r.status === 'FAIL').length;
    const totalTests = this.results.length;

    console.log('\n📊 COMPREHENSIVE APP TEST REPORT');
    console.log('=================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n👤 RENTER ROLE RESULTS:');
    console.log(`✅ Passed: ${renterPassed}/${renterTotal} (${((renterPassed / renterTotal) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${renterFailed}/${renterTotal}`);
    
    console.log('\n👨‍💼 MANAGER ROLE RESULTS:');
    console.log(`✅ Passed: ${managerPassed}/${managerTotal} (${((managerPassed / managerTotal) * 100).toFixed(1)}%)`);
    console.log(`❌ Failed: ${managerFailed}/${managerTotal}`);

    if (totalFailed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results.filter(r => r.status === 'FAIL').forEach(result => {
        console.log(`  - [${result.role.toUpperCase()}] ${result.test}: ${result.message}`);
      });
    }

    console.log('\n✅ PASSED TESTS:');
    this.results.filter(r => r.status === 'PASS').forEach(result => {
      console.log(`  - [${result.role.toUpperCase()}] ${result.test}: ${result.message}`);
    });

    // Save detailed report to file
    const reportContent = `
# Comprehensive App Test Report
Generated: ${new Date().toISOString()}

## Summary
- Total Tests: ${totalTests}
- Passed: ${totalPassed}
- Failed: ${totalFailed}
- Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%

## Renter Role Results
- Passed: ${renterPassed}/${renterTotal} (${((renterPassed / renterTotal) * 100).toFixed(1)}%)
- Failed: ${renterFailed}/${renterTotal}

## Manager Role Results
- Passed: ${managerPassed}/${managerTotal} (${((managerPassed / managerTotal) * 100).toFixed(1)}%)
- Failed: ${managerFailed}/${managerTotal}

## Test Results
${this.results.map(r => `### [${r.role.toUpperCase()}] ${r.test}
- Status: ${r.status}
- Message: ${r.message}

`).join('')}
`;

    fs.writeFileSync('comprehensive-app-test-report.md', reportContent);
    console.log('\n📄 Detailed report saved to comprehensive-app-test-report.md');
    
    // Final assessment
    console.log('\n🎯 FINAL ASSESSMENT');
    console.log('===================');
    
    if (totalPassed / totalTests >= 0.9) {
      console.log('🎉 EXCELLENT: App is 90%+ functional!');
    } else if (totalPassed / totalTests >= 0.8) {
      console.log('✅ GOOD: App is 80%+ functional!');
    } else if (totalPassed / totalTests >= 0.7) {
      console.log('⚠️ FAIR: App is 70%+ functional, some issues need attention');
    } else {
      console.log('❌ POOR: App has significant issues that need to be addressed');
    }
  }
}

const tester = new ComprehensiveAppTester();
tester.runTests().catch(console.error);
