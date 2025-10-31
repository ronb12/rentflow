"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type MaintRow = {
  id: string;
  tenant_id: string;
  issue_type: string;
  description: string;
  priority: string;
  status: string;
  created_at: number;
};

export default function ManageMaintenancePage() {
  const [rows, setRows] = useState<MaintRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantQuery, setTenantQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");

  async function refresh() {
    try {
      const res = await fetch('/api/maintenance-requests');
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message || 'Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (tenantQuery && !r.tenant_id.toLowerCase().includes(tenantQuery.toLowerCase())) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (priority !== 'all' && r.priority !== priority) return false;
      return true;
    });
  }, [rows, tenantQuery, status, priority]);

  async function updateStatus(id: string, newStatus: string) {
    await fetch('/api/maintenance-requests', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    });
    await refresh();
  }

  async function createWorkOrderFrom(row: MaintRow) {
    const payload = {
      maintenanceRequestId: row.id,
      title: `${row.issue_type || 'Maintenance'} for ${row.tenant_id}`,
      description: row.description,
      tenantId: row.tenant_id,
      property: '',
      priority: row.priority,
      status: 'pending',
    };
    await fetch('/api/work-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    // Optionally set request to pending
    await updateStatus(row.id, 'pending');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Maintenance Requests (Manager)</h1>
        <p className="text-muted-foreground">Review and manage maintenance requests.</p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium">Tenant</label>
            <Input placeholder="tenant id or email" value={tenantQuery} onChange={(e) => setTenantQuery(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(v) => setStatus(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">Priority</label>
            <Select value={priority} onValueChange={(v) => setPriority(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <div>Loading…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">No requests match your filters.</div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Tenant</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Description</th>
                    <th className="py-2 pr-4">Priority</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4">{r.tenant_id}</td>
                      <td className="py-2 pr-4 capitalize">{r.issue_type}</td>
                      <td className="py-2 pr-4 max-w-[40ch] break-words">{r.description}</td>
                      <td className="py-2 pr-4 capitalize">{r.priority}</td>
                      <td className="py-2 pr-4 capitalize">{r.status}</td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'pending')}>Pending</Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(r.id, 'in progress')}>In Progress</Button>
                          <Button size="sm" onClick={() => updateStatus(r.id, 'completed')}>Complete</Button>
                          <Button size="sm" variant="outline" onClick={() => createWorkOrderFrom(r)}>Create Work Order</Button>
                        </div>
                      </td>
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


