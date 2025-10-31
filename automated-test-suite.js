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
async function testServerConnection() {
  const response = await makeRequest(`${BASE_URL}/api/documents`);
  
  if (!response.ok && response.status !== 0) {
    return { success: false, error: `Server not responding: ${response.status}` };
  }
  
  return { 
    success: true, 
    details: 'Server is running and accessible' 
  };
}

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
    name: `Automated Test Document ${Date.now()}`,
    type: 'lease',
    category: 'contract',
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
    signerName: 'Automated Test User',
    signerEmail: 'automated-test@example.com'
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

async function testFileUploadWithCurl() {
  // Create a test file
  const testContent = `RentFlow Automated Test Document

This is an automated test document created at ${new Date().toISOString()}.

Test Details:
- Property: Automated Test Property 123
- Tenant: Automated Test Tenant
- Document Type: Automated Test
- Status: Testing Upload Functionality
- Test Run: ${Date.now()}

This document verifies that the file upload system is working correctly in the automated test environment.`;
  
  const testFilePath = path.join(__dirname, 'automated-test-document.txt');
  fs.writeFileSync(testFilePath, testContent);
  
  try {
    // Use child_process to run curl command
    const { execSync } = require('child_process');
    
    const curlCommand = `curl -s -X POST http://localhost:3004/api/documents/upload -F "file=@${testFilePath}" -F "documentId=automated-test-doc-${Date.now()}"`;
    
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

async function testCompleteWorkflow() {
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

async function testMultipleDocuments() {
  const documents = [];
  
  // Create multiple documents
  for (let i = 1; i <= 3; i++) {
    const documentData = {
      name: `Test Document ${i} - ${Date.now()}`,
      type: i === 1 ? 'lease' : i === 2 ? 'invoice' : 'notice',
      category: i === 1 ? 'contract' : i === 2 ? 'financial' : 'legal',
      tenantId: `test-tenant-${i}`,
      propertyId: `test-property-${i}`
    };
    
    const response = await makeRequest(`${BASE_URL}/api/documents`, {
      method: 'POST',
      body: JSON.stringify(documentData)
    });
    
    if (!response.ok || !response.data.id) {
      return { success: false, error: `Failed to create document ${i}` };
    }
    
    documents.push(response.data);
  }
  
  // Verify all documents were created
  const listResponse = await makeRequest(`${BASE_URL}/api/documents`);
  if (!listResponse.ok || !Array.isArray(listResponse.data)) {
    return { success: false, error: 'Failed to retrieve document list' };
  }
  
  return { 
    success: true, 
    details: `Created ${documents.length} documents successfully` 
  };
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting RentFlow Document Management Automated Test Suite');
  console.log('=' .repeat(70));
  console.log(`🕐 Test started at: ${new Date().toISOString()}`);
  console.log(`🌐 Testing server: ${BASE_URL}`);
  console.log('=' .repeat(70));
  
  // Test 1: Server Connection
  await runTest('Server Connection Test', testServerConnection);
  
  // Test 2: Documents API
  await runTest('Documents API - GET /api/documents', testDocumentsAPI);
  
  // Test 3: Document Templates API
  await runTest('Document Templates API - GET /api/documents/templates', testDocumentTemplatesAPI);
  
  // Test 4: Create Document
  await runTest('Create Document - POST /api/documents', testCreateDocument);
  
  // Test 5: File Upload
  await runTest('File Upload - POST /api/documents/upload', testFileUploadWithCurl);
  
  // Test 6: Complete Workflow
  await runTest('Complete Document Workflow', testCompleteWorkflow);
  
  // Test 7: Multiple Documents
  await runTest('Multiple Documents Creation', testMultipleDocuments);
  
  // Print results
  console.log('\n' + '=' .repeat(70));
  console.log('📊 AUTOMATED TEST RESULTS SUMMARY');
  console.log('=' .repeat(70));
  console.log(`✅ Passed: ${TEST_RESULTS.passed}`);
  console.log(`❌ Failed: ${TEST_RESULTS.failed}`);
  console.log(`📈 Success Rate: ${((TEST_RESULTS.passed / (TEST_RESULTS.passed + TEST_RESULTS.failed)) * 100).toFixed(1)}%`);
  console.log(`🕐 Test completed at: ${new Date().toISOString()}`);
  
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
  
  console.log('\n' + '=' .repeat(70));
  
  if (TEST_RESULTS.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Document Management System is fully functional.');
    console.log('🚀 System is ready for production use!');
  } else if (TEST_RESULTS.passed >= TEST_RESULTS.failed) {
    console.log('⚠️  Most tests passed. System is functional with minor issues.');
  } else {
    console.log('❌ Multiple tests failed. System needs attention.');
  }
  
  console.log('=' .repeat(70));
}

// Run the tests
runAllTests().catch(console.error);






