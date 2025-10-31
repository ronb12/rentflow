"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ChangeRequest {
  id: string;
  schedule_id: string;
  tenant_id: string | null;
  requested_due_day: number | null;
  requested_start_date: number | null;
  reason: string | null;
  status: string;
  created_at: number;
  tenant_full_name?: string | null;
}

export default function ScheduleRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<string>("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payment-schedules/change-requests?status=pending', { cache: 'no-store' });
      const data = await res.json();
      setRequests(data.requests || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const act = async (id: string, action: 'approve'|'deny') => {
    const res = await fetch(`/api/payment-schedules/change-requests/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, managerNote: note })
    });
    if (res.ok) {
      setNote("");
      fetchRequests();
    } else {
      alert('Failed to update request');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Schedule Change Requests</h1>

      {loading ? (
        <div>Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-muted-foreground">No pending requests.</div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Request {r.id}</span>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{r.status}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {r.tenant_full_name && (
                  <div>Tenant: {r.tenant_full_name}</div>
                )}
                <div>Schedule: {r.schedule_id}</div>
                <div>Requested Due Day: {r.requested_due_day ?? '—'}</div>
                <div>Requested Start: {r.requested_start_date ? new Date(r.requested_start_date).toLocaleDateString() : '—'}</div>
                <div>Reason: {r.reason || '—'}</div>
                <div className="flex items-center gap-2 mt-2">
                  <Label className="text-xs">Manager Note</Label>
                  <input className="border px-2 py-1 rounded text-sm flex-1" value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={() => act(r.id, 'approve')}>Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => act(r.id, 'deny')}>Deny</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


