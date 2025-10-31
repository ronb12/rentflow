import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { docStore, DocumentData } from '@/lib/docStore';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, Word docs, and text files are allowed.'));
    }
  }
});

// Always use shared in-memory store (no module-level copy)

// GET /api/documents - List all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const propertyId = searchParams.get('propertyId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Seed sample documents on first access (in-memory)
    // Ensure sample documents exist for demo. If store is empty or too few items
    // (e.g., after first sign created only one doc), merge in missing samples
    const ensureSeed = () => {
      const now = new Date();
      const fmt = (d: Date) => d.toISOString();
      const seeds = [
        {
          id: 'seed_lease',
          name: 'Residential Lease Agreement',
          type: 'lease' as const,
          category: 'legal' as const,
          status: 'pending_signature' as const,
          createdAt: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 14)),
          updatedAt: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7)),
          tenantId: 'tenant_1',
          propertyId: 'prop_101',
          templateData: {
            html: `
              <style>
                .doc h1{font-size:22px;font-weight:700;margin:0 0 12px}
                .doc h2{font-size:16px;font-weight:600;margin:16px 0 8px}
                .doc p,.doc li{font-size:14px;color:#111827}
                .doc .muted{color:#6b7280;font-size:12px;margin:0 0 16px}
                .doc table{width:100%;border-collapse:collapse;margin:8px 0}
                .doc td{border:1px solid #e5e7eb;padding:8px}
              </style>
              <div class="doc">
                <h1>Residential Lease Agreement</h1>
                <p class="muted">This Residential Lease Agreement ("Agreement") is made between the Property Manager ("Landlord") and the Renter ("Tenant").</p>
                <h2>1. Premises</h2>
                <p>Property Address: 123 Main Street, Unit 1A, City, ST 00000</p>
                <h2>2. Term</h2>
                <table>
                  <tr><td>Start Date</td><td>Jan 1, 2025</td></tr>
                  <tr><td>End Date</td><td>Dec 31, 2025</td></tr>
                </table>
                <h2>3. Rent</h2>
                <p>Monthly rent: $1,200 due on the 1st of each month.</p>
                <h2>4. Security Deposit</h2>
                <p>Security deposit: $1,200 due prior to move-in.</p>
                <h2>5. Utilities and Maintenance</h2>
                <p>Tenant is responsible for electricity and internet. Landlord provides water and trash.</p>
                <h2>6. Rules and Regulations</h2>
                <ul>
                  <li>No smoking inside the premises.</li>
                  <li>No pets unless otherwise approved in writing.</li>
                  <li>Quiet hours 10 PM - 7 AM.</li>
                </ul>
                <h2>7. Signatures</h2>
                <p>By signing, both parties agree to the terms of this Agreement.</p>
              </div>
            `
          }
        },
        {
          id: 'seed_checklist',
          name: 'Move-In Inspection Checklist',
          type: 'contract' as const,
          category: 'maintenance' as const,
          status: 'draft' as const,
          createdAt: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10)),
          updatedAt: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3)),
          tenantId: 'tenant_1',
          propertyId: 'prop_101'
        },
        {
          id: 'seed_receipt_oct',
          name: 'Rent Receipt - October',
          type: 'receipt' as const,
          category: 'financial' as const,
          status: 'signed' as const,
          createdAt: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 25)),
          updatedAt: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 25)),
          signedAt: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 25)),
          signedBy: 'Property Manager',
          tenantId: 'tenant_1',
          propertyId: 'prop_101'
        }
      ];
      for (const s of seeds) {
        if (!docStore.documents.find(d => d.id === s.id)) {
          docStore.documents.push(s as any);
        }
      }
    };
    if (docStore.documents.length < 2) ensureSeed();

    let filteredDocuments = docStore.documents;

    if (tenantId) {
      filteredDocuments = filteredDocuments.filter(doc => doc.tenantId === tenantId);
    }
    if (propertyId) {
      filteredDocuments = filteredDocuments.filter(doc => doc.propertyId === propertyId);
    }
    if (type) {
      filteredDocuments = filteredDocuments.filter(doc => doc.type === type);
    }
    if (status) {
      filteredDocuments = filteredDocuments.filter(doc => doc.status === status);
    }

    return NextResponse.json(filteredDocuments);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST /api/documents - Create new document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, category, tenantId, propertyId, templateData } = body;

    const newDocument: DocumentData = {
      id: Date.now().toString(),
      name,
      type: type || 'other',
      category: category || 'other',
      tenantId,
      propertyId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateData
    };

    docStore.documents.push(newDocument);

    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}

// PUT /api/documents/[id] - Update document
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    const documentIndex = docStore.documents.findIndex(doc => doc.id === id);
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    docStore.documents[documentIndex] = {
      ...docStore.documents[documentIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(docStore.documents[documentIndex]);
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

// DELETE /api/documents/[id] - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const documentIndex = docStore.documents.findIndex(doc => doc.id === id);
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete file if it exists
    const document = docStore.documents[documentIndex];
    if (document.filePath) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (fileError) {
        console.warn('Could not delete file:', fileError);
      }
    }

    docStore.documents.splice(documentIndex, 1);

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}





