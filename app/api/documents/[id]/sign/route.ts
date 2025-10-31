import { NextRequest, NextResponse } from 'next/server';
import { signDocument, verifySignature, generateKeyPair, hashDocument } from '@/lib/digital-signature';

/**
 * GET /api/documents/[id]/sign
 * Get signature information for a document
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // In production, fetch from database
    // For now, return mock data
    return NextResponse.json({
      documentId: id,
      hasSignature: true,
      signatures: [],
      timestamp: Date.now()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get signature information' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents/[id]/sign
 * Sign a document with cryptographic signature
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content, signerName, signerEmail } = body;

    if (!content || !signerName || !signerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: content, signerName, signerEmail' },
        { status: 400 }
      );
    }

    // In production, retrieve the user's private key from secure storage
    // For demo, we'll generate a temporary key pair
    // In real implementation, keys should be stored securely (HSM, Cloud KMS, etc.)
    
    const { privateKey, publicKey } = generateKeyPair();
    
    // Create cryptographic signature
    const signature = signDocument(
      id,
      content,
      signerName,
      signerEmail,
      privateKey
    );

    // In production, store the signature in database along with public key
    // For now, we'll return the signature data
    
    return NextResponse.json({
      success: true,
      signature,
      publicKey, // In production, store this separately and return only reference
      message: 'Document signed cryptographically',
      verification: {
        documentHash: signature.documentHash,
        timestamp: signature.timestamp,
        signerName: signature.signerName,
        signerEmail: signature.signerEmail
      }
    });

  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json(
      { error: 'Failed to sign document' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/documents/[id]/verify
 * Verify a document signature
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { content, signature, publicKey } = body;

    if (!content || !signature || !publicKey) {
      return NextResponse.json(
        { error: 'Missing required fields: content, signature, publicKey' },
        { status: 400 }
      );
    }

    // Verify the signature
    const result = verifySignature(content, signature, publicKey);

    return NextResponse.json({
      documentId: id,
      verified: result.valid,
      message: result.message,
      errors: result.errors,
      verificationDetails: {
        documentHash: signature.documentHash,
        timestamp: signature.timestamp,
        signerName: signature.signerName,
        signerEmail: signature.signerEmail,
        verifiedAt: Date.now()
      }
    });

  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json(
      { error: 'Failed to verify signature' },
      { status: 500 }
    );
  }
}

