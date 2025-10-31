"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BillingSettingsPage() {
  const [companyName, setCompanyName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [amount, setAmount] = useState("1200");
  const [connectUrl, setConnectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startConnect() {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, billingEmail })
      });
      const data = await res.json();
      if (data.url) {
        setConnectUrl(data.url);
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start onboarding');
      }
    } finally {
      setLoading(false);
    }
  }

  async function subscribe() {
    setLoading(true);
    try {
      const res = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: managerEmail })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to start subscription');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Billing</h1>
        <p className="text-muted-foreground">Onboard your company to receive payments and subscribe to RentFlow.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>1) Company Payouts (Stripe Connect)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">Company Name</label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Property Mgmt" />
            </div>
            <div>
              <label className="text-sm font-medium">Billing Email</label>
              <Input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="owner@acme.com" />
            </div>
          </div>
          <Button onClick={startConnect} disabled={loading}>{loading ? 'Working…' : 'Start Connect Onboarding'}</Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>2) Platform Subscription ($30/mo with 7‑day trial)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium">Manager Email</label>
            <Input value={managerEmail} onChange={(e) => setManagerEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <Button onClick={subscribe} disabled={loading}>{loading ? 'Working…' : 'Subscribe to RentFlow Pro'}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Company-Scoped Payment (Checkout)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium">Amount (USD)</label>
              <Input value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="md:col-span-2 text-sm text-muted-foreground">Requires a connected account ID; wired in API call.</div>
          </div>
          <Button
            onClick={async () => {
              const accountId = prompt('Enter connected account id (acct_...)');
              if (!accountId) return;
              const res = await fetch('/api/billing/pay', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companyConnectAccountId: accountId, amount, customerEmail: managerEmail })
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url; else alert(data.error || 'Failed');
            }}
          >
            Create Payment Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


