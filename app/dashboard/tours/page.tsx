"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Tour = {
  id: string;
  tenant_email: string;
  tenant_name: string;
  phone: string;
  property_id: string;
  preferred_datetime: number;
  notes: string;
  status: string;
  created_at: number;
};

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/tours');
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setTours(data as Tour[]);
      } catch (e: any) {
        setError(e.message || 'Failed to load tours');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Property Tours</h1>
        <p className="text-muted-foreground">Incoming tour requests from renters.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tour Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {!loading && tours.length === 0 && <div className="text-sm text-muted-foreground">No tour requests yet.</div>}
          {!loading && tours.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Requested</th>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Phone</th>
                    <th className="py-2 pr-4">Property</th>
                    <th className="py-2 pr-4">Preferred Time</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map(t => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{new Date(t.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4">{t.tenant_name}</td>
                      <td className="py-2 pr-4">{t.tenant_email}</td>
                      <td className="py-2 pr-4">{t.phone}</td>
                      <td className="py-2 pr-4">{t.property_id || '-'}</td>
                      <td className="py-2 pr-4">{t.preferred_datetime ? new Date(t.preferred_datetime).toLocaleString() : '-'}</td>
                      <td className="py-2 pr-4">{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


