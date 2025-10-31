import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'sfo1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const customerEmail = body.email;
    const priceId = process.env.STRIPE_PRICE_ID || '';
    const sk = process.env.STRIPE_SECRET_KEY;
    if (!sk || !priceId) {
      return NextResponse.json({ error: 'Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID' }, { status: 500 });
    }
    const origin = 'https://rentflow-property.vercel.app';
    const form = new URLSearchParams();
    form.append('mode', 'subscription');
    // For subscription mode, set customer_email only (no customer_creation)
    if (customerEmail) form.append('customer_email', customerEmail);
    form.append('allow_promotion_codes', 'true');
    form.append('subscription_data[trial_period_days]', '7');
    form.append('success_url', `${origin}/dashboard/settings/billing?sub=success`);
    form.append('cancel_url', `${origin}/dashboard/settings/billing?sub=cancel`);
    form.append('line_items[0][price]', priceId);
    form.append('line_items[0][quantity]', '1');

    const resp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${sk}` },
      body: form.toString(),
    });
    const data = await resp.json();
    if (!resp.ok) {
      return NextResponse.json({ error: 'Failed to create subscription session', detail: data?.error?.message || `http ${resp.status}` }, { status: 500 });
    }
    return NextResponse.json({ url: data.url });
  } catch (e: any) {
    // Raw fetch fallback to surface clearer error
    try {
      const res = await fetch('https://api.stripe.com/v1/prices', {
        method: 'GET',
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      const detail = `fallback /v1/prices http ${res.status}`;
      console.error('subscribe fallback', detail);
      return NextResponse.json({ error: 'Failed to create subscription session', detail }, { status: 500 });
    } catch (ee: any) {
      console.error('subscribe error', e?.message || e, 'fallback', ee?.message || ee);
      return NextResponse.json({ error: 'Failed to create subscription session', detail: ee?.message || 'unknown' }, { status: 500 });
    }
  }
}


