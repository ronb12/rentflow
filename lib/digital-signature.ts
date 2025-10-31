/**
 * Digital Signature Implementation
 * Provides cryptographic signing and verification for documents
 */

import crypto from 'crypto';

export interface SignaturePayload {
  documentId: string;
  signerName: string;
  signerEmail: string;
  timestamp: number;
  documentHash: string;
  signature: string;
}

export interface VerificationResult {
  valid: boolean;
  message: string;
  errors: string[];
}

/**
 * Generate RSA key pair for signing
 * In production, these should be stored securely (HSM, cloud KMS, etc.)
 */
export function generateKeyPair(): { publicKey: string; privateKey: string } {
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

/**
 * Hash the document content using SHA-256
 */
export function hashDocument(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Create a digital signature for a document
 */
export function signDocument(
  documentId: string,
  content: string,
  signerName: string,
  signerEmail: string,
  privateKey: string
): SignaturePayload {
  const timestamp = Date.now();
  const documentHash = hashDocument(content);

  // Create the payload to sign
  const payload = JSON.stringify({
    documentId,
    signerName,
    signerEmail,
    timestamp,
    documentHash
  });

  // Create the signature
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

/**
 * Verify a digital signature
 */
export function verifySignature(
  content: string,
  signature: SignaturePayload,
  publicKey: string
): VerificationResult {
  const errors: string[] = [];

  // 1. Verify the document hash matches
  const computedHash = hashDocument(content);
  if (computedHash !== signature.documentHash) {
    errors.push('Document has been tampered with - hash mismatch');
  }

  // 2. Verify the signature
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

  // 3. Verify timestamp is reasonable (optional check)
  const ageInDays = (Date.now() - signature.timestamp) / (1000 * 60 * 60 * 24);
  if (ageInDays > 365 * 100) { // More than 100 years old
    errors.push('Signature timestamp appears invalid');
  }

  return {
    valid: errors.length === 0,
    message: errors.length === 0 
      ? 'Signature is valid and document is authentic' 
      : 'Signature verification failed',
    errors
  };
}

/**
 * Create a certificate for public key
 */
export function createCertificate(
  publicKey: string,
  issuer: string = 'RentFlow',
  subject: string
): string {
  // This is a simplified certificate format
  // In production, use X.509 certificates
  return JSON.stringify({
    version: '1.0',
    issuer,
    subject,
    publicKey,
    validFrom: Date.now(),
    validTo: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
    algorithm: 'RSA-SHA256'
  });
}

