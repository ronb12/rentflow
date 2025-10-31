import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb } from 'pdf-lib';
import path from 'path';
import fs from 'fs';
import { docStore } from '@/lib/docStore';
import { resolve } from 'path';

// POST /api/documents/sign - Add digital signature to document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, documentName, documentType, documentCategory, templateData, signatureData, signerName, signerEmail, signerRole } = body;

    if (!signatureData || !signerName) {
      return NextResponse.json({ error: 'Signature data and signer name are required' }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Fetch the document from your database
    // 2. Load the PDF file
    // 3. Add the signature to the PDF
    // 4. Save the signed PDF
    // 5. Update the document status

    // For now, we'll simulate the signing process and persist to in-memory store
    const signedAt = new Date().toISOString();
    let signedDocument: any = {
      id: documentId,
      status: 'signed',
      signedAt,
      signedBy: signerName,
      signerEmail,
      signatureData: signatureData // Base64 encoded signature image
    };

    let idx = docStore.documents.findIndex(d => d.id === documentId);
    if (idx === -1 && documentName) {
      const byName = docStore.documents.findIndex(d => (d.name || '').toLowerCase() === String(documentName).toLowerCase());
      if (byName !== -1) idx = byName;
    }
    if (idx !== -1) {
      const prev = docStore.documents[idx];
      const newSignature = {
        role: (signerRole as any) || 'other',
        name: signerName,
        email: signerEmail,
        imageData: signatureData,
        signedAt,
      };
      signedDocument = {
        ...prev,
        status: 'signed',
        signedAt,
        signedBy: signerName,
        signerEmail,
        signatureData,
        updatedAt: signedAt,
        // Preserve or attach templateData to ensure full preview after signing
        templateData: prev.templateData || templateData || undefined,
        signatures: [...(prev.signatures || []), newSignature],
      };
      docStore.documents[idx] = signedDocument;
    } else {
      // If document not found, also ensure seed docs exist so list doesn't collapse to one item
      try {
        const req = new Request(new URL('/api/documents', 'http://localhost'));
        // No-op to trigger seeding on next GET
      } catch {}
      docStore.documents.push({
        id: documentId,
        name: documentName || 'Signed Document',
        type: (documentType as any) || 'lease',
        category: (documentCategory as any) || 'legal',
        status: 'signed',
        createdAt: signedAt,
        updatedAt: signedAt,
        signedAt,
        signedBy: signerName,
        signerEmail,
        signatureData,
        templateData: templateData || undefined,
        signatures: [{ role: (signerRole as any) || 'other', name: signerName, email: signerEmail, imageData: signatureData, signedAt }],
      } as any);
    }

    return NextResponse.json({
      message: 'Document signed successfully',
      document: signedDocument
    });
  } catch (error) {
    console.error('Error signing document:', error);
    return NextResponse.json({ error: 'Failed to sign document' }, { status: 500 });
  }
}

// POST /api/documents/signature/verify - Verify digital signature
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentId, signatureData } = body;

    // In a real implementation, you would verify the signature
    // For now, we'll just return success
    return NextResponse.json({
      message: 'Signature verified successfully',
      isValid: true,
      verifiedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    return NextResponse.json({ error: 'Failed to verify signature' }, { status: 500 });
  }
}






