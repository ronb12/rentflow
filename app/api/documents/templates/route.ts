import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import path from 'path';
import fs from 'fs';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'lease' | 'contract' | 'invoice' | 'receipt' | 'notice' | 'other';
  description: string;
  fields: TemplateField[];
}

export interface TemplateField {
  name: string;
  type: 'text' | 'date' | 'number' | 'signature' | 'checkbox';
  label: string;
  required: boolean;
  placeholder?: string;
}

// Document templates
const documentTemplates: DocumentTemplate[] = [
  {
    id: 'lease-agreement',
    name: 'Lease Agreement',
    type: 'lease',
    description: 'Standard residential lease agreement',
    fields: [
      { name: 'tenantName', type: 'text', label: 'Tenant Name', required: true },
      { name: 'landlordName', type: 'text', label: 'Landlord Name', required: true },
      { name: 'propertyAddress', type: 'text', label: 'Property Address', required: true },
      { name: 'rentAmount', type: 'number', label: 'Monthly Rent', required: true },
      { name: 'securityDeposit', type: 'number', label: 'Security Deposit', required: true },
      { name: 'leaseStartDate', type: 'date', label: 'Lease Start Date', required: true },
      { name: 'leaseEndDate', type: 'date', label: 'Lease End Date', required: true },
      { name: 'tenantSignature', type: 'signature', label: 'Tenant Signature', required: true },
      { name: 'landlordSignature', type: 'signature', label: 'Landlord Signature', required: true }
    ]
  },
  {
    id: 'rent-invoice',
    name: 'Rent Invoice',
    type: 'invoice',
    description: 'Monthly rent invoice',
    fields: [
      { name: 'tenantName', type: 'text', label: 'Tenant Name', required: true },
      { name: 'propertyAddress', type: 'text', label: 'Property Address', required: true },
      { name: 'rentAmount', type: 'number', label: 'Rent Amount', required: true },
      { name: 'dueDate', type: 'date', label: 'Due Date', required: true },
      { name: 'lateFee', type: 'number', label: 'Late Fee', required: false },
      { name: 'totalAmount', type: 'number', label: 'Total Amount', required: true }
    ]
  },
  {
    id: 'maintenance-notice',
    name: 'Maintenance Notice',
    type: 'notice',
    description: 'Notice for maintenance work',
    fields: [
      { name: 'tenantName', type: 'text', label: 'Tenant Name', required: true },
      { name: 'propertyAddress', type: 'text', label: 'Property Address', required: true },
      { name: 'maintenanceType', type: 'text', label: 'Type of Maintenance', required: true },
      { name: 'scheduledDate', type: 'date', label: 'Scheduled Date', required: true },
      { name: 'estimatedDuration', type: 'text', label: 'Estimated Duration', required: false },
      { name: 'contactInfo', type: 'text', label: 'Contact Information', required: true }
    ]
  },
  {
    id: 'eviction-notice',
    name: 'Eviction Notice',
    type: 'notice',
    description: 'Formal eviction notice',
    fields: [
      { name: 'tenantName', type: 'text', label: 'Tenant Name', required: true },
      { name: 'propertyAddress', type: 'text', label: 'Property Address', required: true },
      { name: 'reason', type: 'text', label: 'Reason for Eviction', required: true },
      { name: 'noticeDate', type: 'date', label: 'Notice Date', required: true },
      { name: 'vacateDate', type: 'date', label: 'Vacate Date', required: true },
      { name: 'landlordName', type: 'text', label: 'Landlord Name', required: true }
    ]
  }
];

// GET /api/documents/templates - Get all document templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let templates = documentTemplates;
    if (type) {
      templates = templates.filter(template => template.type === type);
    }

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST /api/documents/templates/generate - Generate document from template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, data, tenantId, propertyId } = body;

    const template = documentTemplates.find(t => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Generate PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let yPosition = 750;
    const lineHeight = 20;
    const margin = 50;

    // Add title
    page.drawText(template.name, {
      x: margin,
      y: yPosition,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    yPosition -= 40;

    // Add document content based on template
    if (templateId === 'lease-agreement') {
      page.drawText('RESIDENTIAL LEASE AGREEMENT', {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      page.drawText(`This lease agreement is made between ${data.landlordName} (Landlord) and ${data.tenantName} (Tenant).`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      page.drawText(`Property Address: ${data.propertyAddress}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(`Monthly Rent: $${data.rentAmount}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(`Security Deposit: $${data.securityDeposit}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText(`Lease Term: ${data.leaseStartDate} to ${data.leaseEndDate}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 40;

      page.drawText('TERMS AND CONDITIONS:', {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      const terms = [
        '1. Tenant agrees to pay rent on time each month.',
        '2. Tenant agrees to maintain the property in good condition.',
        '3. Tenant agrees to notify landlord of any maintenance issues.',
        '4. Landlord agrees to provide habitable living conditions.',
        '5. Either party may terminate this lease with 30 days written notice.'
      ];

      terms.forEach(term => {
        page.drawText(term, {
          x: margin,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        });
        yPosition -= 15;
      });

      yPosition -= 30;

      page.drawText('SIGNATURES:', {
        x: margin,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      page.drawText(`Tenant: ${data.tenantName}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText('Signature: _________________________', {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 30;

      page.drawText(`Landlord: ${data.landlordName}`, {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      yPosition -= 20;

      page.drawText('Signature: _________________________', {
        x: margin,
        y: yPosition,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
    }

    // Save PDF
    const pdfBytes = await pdfDoc.save();
    const fileName = `${template.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, pdfBytes);

    // Create document record
    const document = {
      id: Date.now().toString(),
      name: template.name,
      type: template.type,
      category: 'legal',
      fileName,
      filePath,
      fileSize: pdfBytes.length,
      mimeType: 'application/pdf',
      tenantId,
      propertyId,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      templateData: data
    };

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error generating document:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
