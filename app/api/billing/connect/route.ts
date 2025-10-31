import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const preferredRegion = 'sfo1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const companyName = body.companyName || "Company";
    const billingEmail = body.billingEmail || "owner@example.com";

    const sk = process.env.STRIPE_SECRET_KEY;
    if (!sk) {
      return NextResponse.json({
        error: "Missing STRIPE_SECRET_KEY",
        note: "Provide STRIPE_SECRET_KEY in environment to enable onboarding"
      }, { status: 500 });
    }

    // REST: create account
    const accountForm = new URLSearchParams();
    accountForm.append('type', 'express');
    accountForm.append('email', billingEmail);
    accountForm.append('capabilities[card_payments][requested]', 'true');
    accountForm.append('capabilities[transfers][requested]', 'true');
    const accResp = await fetch('https://api.stripe.com/v1/accounts', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${sk}` }, body: accountForm.toString()
    });
    const accData = await accResp.json();
    if (!accResp.ok) {
      return NextResponse.json({ error: 'Failed to create connect account', detail: accData?.error?.message || `http ${accResp.status}` }, { status: 500 });
    }

    const origin = 'https://rentflow-property.vercel.app';
    const refresh_url = `${origin}/dashboard/settings/billing?connect=refresh`;
    const return_url = `${origin}/dashboard/settings/billing?connect=return`;
    // REST: create account link
    const linkForm = new URLSearchParams();
    linkForm.append('account', accData.id);
    linkForm.append('refresh_url', refresh_url);
    linkForm.append('return_url', return_url);
    linkForm.append('type', 'account_onboarding');
    const linkResp = await fetch('https://api.stripe.com/v1/account_links', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Bearer ${sk}` }, body: linkForm.toString()
    });
    const linkData = await linkResp.json();
    if (!linkResp.ok) {
      return NextResponse.json({ error: 'Failed to create onboarding link', detail: linkData?.error?.message || `http ${linkResp.status}` }, { status: 500 });
    }

    return NextResponse.json({ accountId: accData.id, url: linkData.url });
  } catch (e: any) {
    // Raw fetch fallback: list accounts to test connectivity
    try {
      const res = await fetch('https://api.stripe.com/v1/accounts?limit=1', {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      const detail = `fallback /v1/accounts http ${res.status}`;
      console.error('Connect fallback', detail);
      return NextResponse.json({ error: 'Failed to create connect onboarding link', detail }, { status: 500 });
    } catch (ee: any) {
      console.error('Connect onboarding error:', e?.message || e, 'fallback', ee?.message || ee);
      return NextResponse.json({ error: 'Failed to create connect onboarding link', detail: ee?.message || 'unknown' }, { status: 500 });
    }
  }
}


