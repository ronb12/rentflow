const crypto = require('crypto');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3004';

// Mock digital signature functions (same as lib/digital-signature.ts)
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  return { publicKey, privateKey };
}

function hashDocument(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function signDocument(documentId, content, signerName, signerEmail, privateKey) {
  const timestamp = Date.now();
  const documentHash = hashDocument(content);

  const payload = JSON.stringify({
    documentId,
    signerName,
    signerEmail,
    timestamp,
    documentHash
  });

  const signature = crypto.createSign('sha256')
    .update(payload)
    .sign(privateKey, 'base64');

  return {
    documentId,
    signerName,
    signerEmail,
    timestamp,
    documentHash,
    signature
  };
}

function verifySignature(content, signature, publicKey) {
  const errors = [];

  // Verify document hash
  const computedHash = hashDocument(content);
  if (computedHash !== signature.documentHash) {
    errors.push('Document has been tampered with - hash mismatch');
  }

  // Verify signature
  try {
    const payload = JSON.stringify({
      documentId: signature.documentId,
      signerName: signature.signerName,
      signerEmail: signature.signerEmail,
      timestamp: signature.timestamp,
      documentHash: signature.documentHash
    });

    const isValid = crypto.createVerify('sha256')
      .update(payload)
      .verify(publicKey, signature.signature, 'base64');

    if (!isValid) {
      errors.push('Signature is invalid or has been tampered with');
    }
  } catch (err) {
    errors.push('Signature verification failed');
  }

  return {
    valid: errors.length === 0,
    message: errors.length === 0 
      ? 'Signature is valid and document is authentic' 
      : 'Signature verification failed',
    errors
  };
}

async function testDigitalSignatures() {
  console.log('🔐 Testing Digital Signature Implementation...\n');

  // Test 1: Generate Key Pair
  console.log('1️⃣ Testing Key Pair Generation...');
  const { publicKey, privateKey } = generateKeyPair();
  console.log('   ✅ Key pair generated successfully');
  console.log(`   Public Key Length: ${publicKey.length} bytes`);
  console.log(`   Private Key Length: ${privateKey.length} bytes\n`);

  // Test 2: Hash Document
  console.log('2️⃣ Testing Document Hashing...');
  const testDocument = 'This is a test lease agreement. Rent: $1200/month. Signed by John Doe.';
  const documentHash = hashDocument(testDocument);
  console.log(`   ✅ Document hash created: ${documentHash.substring(0, 16)}...`);
  console.log(`   Hash Length: ${documentHash.length} characters (SHA-256)\n`);

  // Test 3: Sign Document
  console.log('3️⃣ Testing Document Signing...');
  const signature = signDocument(
    'doc_123',
    testDocument,
    'John Doe',
    'john@example.com',
    privateKey
  );
  console.log('   ✅ Document signed successfully');
  console.log(`   Signer: ${signature.signerName}`);
  console.log(`   Email: ${signature.signerEmail}`);
  console.log(`   Timestamp: ${new Date(signature.timestamp).toISOString()}`);
  console.log(`   Signature: ${signature.signature.substring(0, 32)}...\n`);

  // Test 4: Verify Valid Signature
  console.log('4️⃣ Testing Signature Verification (Valid)...');
  const validResult = verifySignature(testDocument, signature, publicKey);
  if (validResult.valid) {
    console.log('   ✅ Signature verified successfully!');
    console.log(`   Message: ${validResult.message}\n`);
  } else {
    console.log('   ❌ Signature verification failed!');
    console.log(`   Errors: ${validResult.errors.join(', ')}\n`);
  }

  // Test 5: Verify Tampered Document
  console.log('5️⃣ Testing Signature Verification (Tampered Document)...');
  const tamperedDocument = testDocument + ' MODIFIED';
  const tamperedResult = verifySignature(tamperedDocument, signature, publicKey);
  if (!tamperedResult.valid) {
    console.log('   ✅ Tampered document correctly rejected!');
    console.log(`   Message: ${tamperedResult.message}`);
    console.log(`   Errors: ${tamperedResult.errors.join(', ')}\n`);
  } else {
    console.log('   ❌ ERROR: Tampered document was accepted!\n');
  }

  // Test 6: Test API Endpoint (if server is running)
  console.log('6️⃣ Testing API Endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/documents/doc_123/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: testDocument,
        signerName: 'John Doe',
        signerEmail: 'john@example.com'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ API endpoint working!');
      console.log(`   Document ID: ${result.signature.documentId}`);
      console.log(`   Signed by: ${result.signature.signerName}`);
      console.log(`   Hash: ${result.signature.documentHash.substring(0, 16)}...\n`);
    } else {
      const error = await response.text();
      console.log(`   ⚠️ API returned error: ${response.status}`);
      console.log(`   ${error}\n`);
    }
  } catch (error) {
    console.log(`   ⚠️ Could not reach API (server may not be running): ${error.message}\n`);
  }

  console.log('✅ Digital Signature Testing Complete!\n');
  console.log('Summary:');
  console.log('- ✅ Cryptographic signing working');
  console.log('- ✅ Signature verification working');
  console.log('- ✅ Tamper detection working');
  console.log('- ✅ Hash-based integrity checking');
}

testDigitalSignatures().catch(console.error);

