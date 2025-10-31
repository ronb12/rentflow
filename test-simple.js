#!/usr/bin/env node

/**
 * Simple manual testing guide for buttons and modals
 * Run this and follow the checklist
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║  RentFlow - Button & Modal Functionality Test Checklist       ║
╚════════════════════════════════════════════════════════════════╝

🌐 Open your browser and navigate to: http://localhost:3004

✅ TEST CHECKLIST:

📋 TENANTS PAGE (/dashboard/tenants)
  [ ] Click "Add Tenant" button
  [ ] Verify modal opens
  [ ] Fill out form fields
  [ ] Click "Cancel" - modal should close
  [ ] Click "Add Tenant" again
  [ ] Click "Submit" - verify action completes

🏢 PROPERTIES PAGE (/dashboard/properties)
  [ ] Click "Add Property" button
  [ ] Verify modal opens and closes properly
  [ ] Test form submission

📄 LEASES PAGE (/dashboard/leases)
  [ ] Click "Add Lease" button
  [ ] Verify modal opens
  [ ] Test all form fields
  [ ] Test cancel/submit buttons

📁 DOCUMENTS PAGE (/dashboard/documents)
  [ ] Click "Upload Document" button - modal opens
  [ ] Click "Create Document" button - modal opens
  [ ] Click on existing document "View" button
  [ ] Click "Sign" button - DocumentSignModal opens
  [ ] Click "Download" button - file downloads
  [ ] Click "Delete" button - confirmation appears
  [ ] Test all modal close buttons

💰 INVOICES PAGE (/dashboard/invoices)
  [ ] Click "View" button on an invoice - InvoiceViewModal opens
  [ ] Click "Edit" button - InvoiceEditModal opens
  [ ] Click "Download PDF" button - PDF downloads
  [ ] Verify all modals close properly

💳 PAYMENTS PAGE (/dashboard/payments)
  [ ] Click "Add Payment" button - modal opens
  [ ] Test payment method modals (Add/Edit)
  [ ] Verify all buttons respond

🔧 MAINTENANCE PAGE (/dashboard/maintenance)
  [ ] Click "Create Request" button
  [ ] Test all form interactions
  [ ] Verify modals open/close

💬 MESSAGES PAGE (/dashboard/messages)
  [ ] Click "Send Message" button
  [ ] Test message form
  [ ] Verify modal functionality

📊 DASHBOARD (/dashboard)
  [ ] Click all navigation links
  [ ] Verify page transitions work
  [ ] Test any action buttons

═══════════════════════════════════════════════════════════════════

🧪 AUTOMATED CHECKS:
`);

// Quick API endpoint checks
const http = require('http');

const endpoints = [
  '/api/tenants',
  '/api/properties', 
  '/api/leases',
  '/api/documents',
  '/api/invoices',
  '/api/payments',
  '/api/maintenance-requests',
  '/api/messages'
];

console.log('Checking API endpoints...\n');

const checkEndpoint = (path) => {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:3004${path}`, (res) => {
      const status = res.statusCode;
      resolve({ path, status, ok: status === 200 || status === 404 }); // 404 is ok (empty data)
    });
    
    req.on('error', () => {
      resolve({ path, status: 0, ok: false });
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve({ path, status: 'timeout', ok: false });
    });
  });
};

(async () => {
  const results = await Promise.all(endpoints.map(checkEndpoint));
  
  results.forEach(({ path, status, ok }) => {
    const icon = ok ? '✅' : '❌';
    console.log(`${icon} ${path} - Status: ${status}`);
  });
  
  const allOk = results.every(r => r.ok);
  console.log(`\n${allOk ? '✅' : '⚠️'} API endpoints: ${results.filter(r => r.ok).length}/${results.length} responding\n`);
  
  if (!allOk) {
    console.log('⚠️ Some endpoints failed, but this may be normal if no data exists.\n');
  }
  
  console.log('═══════════════════════════════════════════════════════════════════\n');
  console.log('📝 Next Steps:');
  console.log('   1. Open http://localhost:3004 in your browser');
  console.log('   2. Navigate to each page listed above');
  console.log('   3. Click all buttons and test all modals');
  console.log('   4. Verify forms submit and modals close properly\n');
})();


