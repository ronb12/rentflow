import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

export interface DocumentData {
  id: string;
  name: string;
  type: 'lease' | 'contract' | 'invoice' | 'receipt' | 'notice' | 'other';
  category: 'legal' | 'financial' | 'maintenance' | 'communication' | 'other';
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  tenantId?: string;
  propertyId?: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'archived';
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  signedBy?: string;
  templateData?: any;
}

// Mock database - replace with your actual database
let documents: DocumentData[] = [];

// GET /api/documents - List all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const propertyId = searchParams.get('propertyId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let filteredDocuments = documents;

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

    documents.push(newDocument);

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

    const documentIndex = documents.findIndex(doc => doc.id === id);
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    documents[documentIndex] = {
      ...documents[documentIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(documents[documentIndex]);
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

    const documentIndex = documents.findIndex(doc => doc.id === id);
    if (documentIndex === -1) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete file if it exists
    const document = documents[documentIndex];
    if (document.filePath) {
      try {
        fs.unlinkSync(document.filePath);
      } catch (fileError) {
        console.warn('Could not delete file:', fileError);
      }
    }

    documents.splice(documentIndex, 1);

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}





