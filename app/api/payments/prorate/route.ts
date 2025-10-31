import { NextRequest, NextResponse } from 'next/server';
import { query, initSchema } from '@/lib/db';

let schemaInitialized = false;
async function ensureSchema() {
  if (!schemaInitialized) {
    await initSchema();
    schemaInitialized = true;
  }
}

// POST /api/payments/prorate - Calculate prorated rent
export async function POST(request: NextRequest) {
  try {
    await ensureSchema();
    const data = await request.json();
    const { leaseId, startDate, endDate, monthlyRent, prorationMethod = 'daily' } = data;

    if (!startDate || !endDate || !monthlyRent) {
      return NextResponse.json(
        { error: 'Start date, end date, and monthly rent are required' },
        { status: 400 }
      );
    }

    // Get proration rule for lease if exists
    const ruleRows = await query(
      `SELECT * FROM proration_rules WHERE lease_id = ?`,
      [leaseId]
    );

    const rule = ruleRows[0];
    const method = rule?.proration_method || prorationMethod;
    const daysInMonth = Number(rule?.days_in_month ?? 30);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysInPeriod = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let proratedAmount: number = 0;

    if (method === 'daily') {
      // Daily proration
      const dailyRate = Number(monthlyRent) / Number(daysInMonth);
      proratedAmount = Math.round(dailyRate * daysInPeriod * 100);
    } else if (method === 'exact') {
      // Exact days in month
      const daysInActualMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
      const dailyRate = Number(monthlyRent) / Number(daysInActualMonth);
      proratedAmount = Math.round(dailyRate * daysInPeriod * 100);
    }

    return NextResponse.json({
      proratedAmount,
      monthlyRent: Math.round(Number(monthlyRent) * 100),
      daysInPeriod,
      prorationMethod: method,
      dailyRate: method === 'daily' ? Number(monthlyRent) / Number(daysInMonth) : Number(monthlyRent) / new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate(),
      calculation: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        daysInPeriod,
        daysInMonth: method === 'daily' ? daysInMonth : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate(),
      },
    });
  } catch (error) {
    console.error('Error calculating proration:', error);
    return NextResponse.json(
      { error: 'Failed to calculate proration' },
      { status: 500 }
    );
  }
}

