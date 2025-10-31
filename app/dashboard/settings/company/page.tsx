"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CompanySettingsPage() {
  const [form, setForm] = useState({
    company_name: "",
    company_address: "",
    company_email: "",
    company_phone: "",
    logo_url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data && Object.keys(data).length) {
          setForm({
            company_name: data.company_name || "",
            company_address: data.company_address || "",
            company_email: data.company_email || "",
            company_phone: data.company_phone || "",
            logo_url: data.logo_url || "",
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save');
      setMessage('Saved');
    } catch (e: any) {
      setMessage(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading…</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Company Branding</h1>
        <p className="text-muted-foreground">These details appear on documents and previews.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Company Name</label>
            <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Acme Property Management" />
          </div>
          <div>
            <label className="text-sm font-medium">Address</label>
            <Input value={form.company_address} onChange={(e) => setForm({ ...form, company_address: e.target.value })} placeholder="123 Main St, City, ST 00000" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={form.company_email} onChange={(e) => setForm({ ...form, company_email: e.target.value })} placeholder="contact@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input value={form.company_phone} onChange={(e) => setForm({ ...form, company_phone: e.target.value })} placeholder="(555) 555-5555" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Logo URL</label>
            <Input value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} placeholder="https://…/logo.png" />
            {form.logo_url && (
              <div className="mt-2">
                <img src={form.logo_url} alt="Logo preview" className="h-12" />
              </div>
            )}
          </div>
          <div className="pt-2">
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</Button>
            {message && <span className="ml-3 text-sm text-muted-foreground">{message}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


