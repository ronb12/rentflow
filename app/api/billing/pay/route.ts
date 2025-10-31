import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'sfo1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyConnectAccountId, amount, currency = 'usd', description = 'Rent payment', customerEmail } = body;
    const sk = process.env.STRIPE_SECRET_KEY;
    if (!sk) return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY' }, { status: 500 });
    if (!companyConnectAccountId) return NextResponse.json({ error: 'companyConnectAccountId required' }, { status: 400 });

    const origin = 'https://rentflow-property.vercel.app';

    const form = new URLSearchParams();
    form.append('mode', 'payment');
    if (customerEmail) form.append('customer_email', customerEmail);
    form.append('line_items[0][price_data][currency]', currency);
    form.append('line_items[0][price_data][product_data][name]', description);
    form.append('line_items[0][price_data][unit_amount]', String(Math.round(Number(amount) * 100)));
    form.append('line_items[0][quantity]', '1');
    form.append('payment_intent_data[transfer_data][destination]', companyConnectAccountId);
    form.append('payment_intent_data[on_behalf_of]', companyConnectAccountId);
    form.append('success_url', `${origin}/dashboard/payments?pay=success`);
    form.append('cancel_url', `${origin}/dashboard/payments?pay=cancel`);

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${sk}` }, body: form.toString()
    });
    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to create payment session', detail: data?.error?.message || `http ${resp.status}` }, { status: 500 });
    }
    return NextResponse.json({ url: data.url });
  } catch (e: any) {
    try {
      const res = await fetch('https://api.stripe.com/v1/prices?limit=1', { headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` } });
      const detail = `fallback /v1/prices http ${res.status}`;
      console.error('Company pay fallback', detail);
      return NextResponse.json({ error: 'Failed to create payment session', detail }, { status: 500 });
    } catch (ee: any) {
      console.error('Company pay error', e?.message || e, 'fallback', ee?.message || ee);
      return NextResponse.json({ error: 'Failed to create payment session', detail: ee?.message || 'unknown' }, { status: 500 });
    }
  }
}


