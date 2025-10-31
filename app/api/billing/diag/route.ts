import { NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'sfo1';

export async function GET() {
  const hasKey = !!process.env.STRIPE_SECRET_KEY;
  const hasPrice = !!process.env.STRIPE_PRICE_ID;
  const priceId = process.env.STRIPE_PRICE_ID || '';
  let stripeOk = false;
  let stripeMsg: string | null = null;
  try {
    if (!hasKey) throw new Error('STRIPE_SECRET_KEY missing');
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
    // Light touch: retrieve price if provided, else list 1 price
    let res: any;
    if (priceId) {
      res = await stripe.prices.retrieve(priceId);
    } else {
      const list = await stripe.prices.list({ limit: 1 });
      res = list.data?.[0] || null;
    }
    stripeOk = !!res;
  } catch (e: any) {
    stripeMsg = e?.message || String(e);
  }
  // Raw fetch fallback test
  let fetchOk = false;
  let fetchMsg: string | null = null;
  try {
    if (!hasKey) throw new Error('missing key');
    const res = await fetch('https://api.stripe.com/v1/prices?limit=1', {
      method: 'GET',
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      cache: 'no-store',
    });
    fetchOk = res.ok;
    if (!res.ok) {
      fetchMsg = `http ${res.status}`;
    }
  } catch (e: any) {
    fetchMsg = e?.message || String(e);
  }

  return NextResponse.json({ env: { hasKey, hasPrice }, stripe: { ok: stripeOk, detail: stripeMsg }, raw: { ok: fetchOk, detail: fetchMsg } });
}


