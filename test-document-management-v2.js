#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3004';
const TEST_RESULTS = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }
    
    return {
      ok: response.ok,
      status: response.status,
      data: jsonData
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message
    };
  }
}

// Test helper function
function runTest(testName, testFunction) {
  return new Promise(async (resolve) => {
    try {
      console.log(`🧪 Running: ${testName}`);
      const result = await testFunction();
      
      if (result.success) {
        console.log(`✅ PASSED: ${testName}`);
        TEST_RESULTS.passed++;
        TEST_RESULTS.tests.push({ name: testName, status: 'PASSED', details: result.details });
      } else {
        console.log(`❌ FAILED: ${testName}`);
        console.log(`   Error: ${result.error}`);
        TEST_RESULTS.failed++;
        TEST_RESULTS.tests.push({ name: testName, status: 'FAILED', error: result.error });
      }
    } catch (error) {
      console.log(`❌ FAILED: ${testName}`);
      console.log(`   Error: ${error.message}`);
      TEST_RESULTS.failed++;
      TEST_RESULTS.tests.push({ name: testName, status: 'FAILED', error: error.message });
    }
    resolve();
  });
}

// Test functions
async function testDocumentsAPI() {
  const response = await makeRequest(`${BASE_URL}/api/documents`);
  
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}` };
  }
  
  if (!Array.isArray(response.data)) {
    return { success: false, error: 'Response is not an array' };
  }
  
  return { 
    success: true, 
    details: `Found ${response.data.length} documents` 
  };
}

async function testDocumentTemplatesAPI() {
  const response = await makeRequest(`${BASE_URL}/api/documents/templates`);
  
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}` };
  }
  
  if (!Array.isArray(response.data) || response.data.length === 0) {
    return { success: false, error: 'No templates found' };
  }
  
  const expectedTemplates = ['lease-agreement', 'rent-invoice', 'maintenance-notice', 'eviction-notice'];
  const foundTemplates = response.data.map(t => t.id);
  
  for (const template of expectedTemplates) {
    if (!foundTemplates.includes(template)) {
      return { success: false, error: `Missing template: ${template}` };
    }
  }
  
  return { 
    success: true, 
    details: `Found ${response.data.length} templates: ${foundTemplates.join(', ')}` 
  };
}

async function testCreateDocument() {
  const documentData = {
    name: `Test Document ${Date.now()}`,
    type: 'other',
    category: 'test',
    tenantId: 'test-tenant-001',
    propertyId: 'test-property-001'
  };
  
  const response = await makeRequest(`${BASE_URL}/api/documents`, {
    method: 'POST',
    body: JSON.stringify(documentData)
  });
  
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}: ${JSON.stringify(response.data)}` };
  }
  
  if (!response.data.id) {
    return { success: false, error: 'Document ID not returned' };
  }
  
  return { 
    success: true, 
    details: `Created document with ID: ${response.data.id}`,
    documentId: response.data.id
  };
}

async function testDocumentSigning(documentId) {
  const signatureData = {
    documentId: documentId,
    signatureData: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    signerName: 'Test User',
    signerEmail: 'test@example.com'
  };
  
  const response = await makeRequest(`${BASE_URL}/api/documents/sign`, {
    method: 'POST',
    body: JSON.stringify(signatureData)
  });
  
  if (!response.ok) {
    return { success: false, error: `API returned ${response.status}: ${JSON.stringify(response.data)}` };
  }
  
  if (!response.data.message || !response.data.message.includes('successfully')) {
    return { success: false, error: 'Signing failed' };
  }
  
  return { 
    success: true, 
    details: `Document signed successfully by ${signatureData.signerName}` 
  };
}

async function testDocumentsPage() {
  const response = await makeRequest(`${BASE_URL}/dashboard/documents`);
  
  if (!response.ok) {
    return { success: false, error: `Page returned ${response.status}` };
  }
  
  if (!response.data.includes('RentFlow') || !response.data.includes('documents')) {
    return { success: false, error: 'Page content not as expected' };
  }
  
  return { 
    success: true, 
    details: 'Documents page loads correctly' 
  };
}

async function testDocumentWorkflow() {
  // Create a document
  const createResult = await testCreateDocument();
  if (!createResult.success) {
    return createResult;
  }
  
  const documentId = createResult.documentId;
  
  // Sign the document
  const signResult = await testDocumentSigning(documentId);
  if (!signResult.success) {
    return signResult;
  }
  
  return { 
    success: true, 
    details: `Complete workflow successful: Created → Signed (Document ID: ${documentId})` 
  };
}

async function testFileUploadWithCurl() {
  // Create a test file
  const testContent = `RentFlow Document Management Test

This is an automated test document created at ${new Date().toISOString()}.

Test Details:
- Property: Test Property 123
- Tenant: Test Tenant
- Document Type: Automated Test
- Status: Testing Upload Functionality

This document verifies that the file upload system is working correctly.`;
  
  const testFilePath = path.join(__dirname, 'test-upload-document.txt');
  fs.writeFileSync(testFilePath, testContent);
  
  try {
    // Use child_process to run curl command
    const { execSync } = require('child_process');
    
    const curlCommand = `curl -s -X POST http://localhost:3004/api/documents/upload -F "file=@${testFilePath}" -F "documentId=test-doc-${Date.now()}"`;
    
    const output = execSync(curlCommand, { encoding: 'utf8' });
    
    let jsonData;
    try {
      jsonData = JSON.parse(output);
    } catch {
      return { success: false, error: 'Invalid JSON response from upload' };
    }
    
    if (!jsonData.fileName || !jsonData.filePath) {
      return { success: false, error: 'Upload response missing file information' };
    }
    
    // Verify file was created
    if (!fs.existsSync(jsonData.filePath)) {
      return { success: false, error: 'Uploaded file not found on disk' };
    }
    
    return { 
      success: true, 
      details: `File uploaded successfully: ${jsonData.fileName}` 
    };
    
  } catch (error) {
    return { success: false, error: `Upload failed: ${error.message}` };
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting RentFlow Document Management Test Suite');
  console.log('=' .repeat(60));
  
  // Test 1: Documents API
  await runTest('Documents API - GET /api/documents', testDocumentsAPI);
  
  // Test 2: Document Templates API
  await runTest('Document Templates API - GET /api/documents/templates', testDocumentTemplatesAPI);
  
  // Test 3: Create Document
  await runTest('Create Document - POST /api/documents', testCreateDocument);
  
  // Test 4: File Upload (using curl)
  await runTest('File Upload - POST /api/documents/upload', testFileUploadWithCurl);
  
  // Test 5: Documents Page
  await runTest('Documents Page - GET /dashboard/documents', testDocumentsPage);
  
  // Test 6: Complete Workflow
  await runTest('Complete Document Workflow', testDocumentWorkflow);
  
  // Print results
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${TEST_RESULTS.passed}`);
  console.log(`❌ Failed: ${TEST_RESULTS.failed}`);
  console.log(`📈 Success Rate: ${((TEST_RESULTS.passed / (TEST_RESULTS.passed + TEST_RESULTS.failed)) * 100).toFixed(1)}%`);
  
  if (TEST_RESULTS.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    TEST_RESULTS.tests
      .filter(test => test.status === 'FAILED')
      .forEach(test => {
        console.log(`   • ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n🎯 DETAILED RESULTS:');
  TEST_RESULTS.tests.forEach(test => {
    const icon = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} ${test.name}`);
    if (test.details) {
      console.log(`   ${test.details}`);
    }
  });
  
  console.log('\n' + '=' .repeat(60));
  
  if (TEST_RESULTS.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Document Management System is fully functional.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('=' .repeat(60));
}

// Run the tests
runAllTests().catch(console.error);






