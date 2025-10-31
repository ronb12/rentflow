import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';
import { jsPDF } from 'jspdf';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await initSchema();
    const { id } = await params;
    const rows = await query(`SELECT * FROM owner_statements WHERE id = ?`, [id]);
    if (rows.length === 0) return new NextResponse('Not found', { status: 404 });
    const s: any = rows[0];

    // Try to get company name for header
    let companyName = 'Owner Statement';
    try {
      const cs = await query(`SELECT company_name FROM company_settings WHERE id = 'default'`);
      if (cs?.[0]?.company_name) companyName = String(cs[0].company_name);
    } catch {}

    const start = new Date(s.statement_period_start);
    const end = new Date(s.statement_period_end);
    const formatCurrency = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((Number(cents)||0)/100);

    const doc = new jsPDF({ unit: 'pt' });
    const margin = 48;
    let y = margin;

    // Header
    doc.setFontSize(16);
    doc.text(companyName, margin, y);
    y += 22;
    doc.setFontSize(12);
    doc.text('Owner Statement', margin, y);
    y += 18;
    doc.setTextColor(100);
    doc.text(`Owner ID: ${s.owner_id}`, margin, y); y += 16;
    doc.text(`Period: ${start.toLocaleDateString()} – ${end.toLocaleDateString()}`, margin, y); y += 24;
    doc.setTextColor(0);

    // Summary box
    doc.setDrawColor(200);
    doc.rect(margin, y, 520, 90);
    let yy = y + 20;
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', margin + 12, yy); yy += 18; doc.setFont(undefined, 'normal');
    doc.text(`Total Collections: ${formatCurrency(s.total_collections || 0)}`, margin + 12, yy); yy += 16;
    doc.text(`Total Expenses:   ${formatCurrency(s.total_expenses || 0)}`, margin + 12, yy); yy += 16;
    const net = Number(s.net_amount || 0);
    doc.text(`Net Amount:       ${formatCurrency(net)}`, margin + 12, yy);
    y += 110;

    // Footer
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date(s.generated_at).toLocaleString()}`, margin, pageH - margin);

    const pdfBytes = doc.output('arraybuffer');
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="owner-statement-${id}.pdf"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return new NextResponse('Failed to generate PDF', { status: 500 });
  }
}


