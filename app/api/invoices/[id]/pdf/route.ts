import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const invoice = await request.json();

    // Create PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addWrappedText = (text: string, fontSize: number, x: number, y: number, maxWidth: number) => {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.setFontSize(fontSize);
      doc.text(lines, x, y);
      return lines.length * (fontSize * 0.4);
    };

    // Header
    doc.setFontSize(24);
    doc.text('INVOICE', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.id}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Date: ${invoice.createdDate || new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;
    doc.text(`Due Date: ${invoice.dueDate}`, margin, yPosition);
    yPosition += 15;

    // Status
    doc.setFillColor(
      invoice.status === 'paid' ? 34 : 
      invoice.status === 'pending' ? 255 : 
      220, 
      invoice.status === 'paid' ? 197 : 
      invoice.status === 'pending' ? 193 : 
      53, 
      invoice.status === 'paid' ? 120 : 
      invoice.status === 'pending' ? 7 : 
      34
    );
    doc.roundedRect(pageWidth - margin - 40, margin, 40, 10, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(invoice.status.toUpperCase(), pageWidth - margin - 20, margin + 7, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    yPosition += 10;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Bill To
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', margin, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(invoice.tenantName, margin + 5, yPosition);
    yPosition += 6;
    doc.text(invoice.property, margin + 5, yPosition);
    yPosition += 15;

    // Description
    if (invoice.description) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Description:', margin, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      yPosition += addWrappedText(invoice.description, 11, margin + 5, yPosition, contentWidth - 10);
      yPosition += 10;
    }

    // Amount
    yPosition += 10;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Due:', pageWidth - margin - 50, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${invoice.amount.toLocaleString()}`, pageWidth - margin, yPosition, { align: 'right' });

    // Footer
    yPosition = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for your business!', margin, yPosition, { align: 'center' });

    // Generate PDF buffer
    const pdfBlob = doc.output('blob');
    const arrayBuffer = await pdfBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}

