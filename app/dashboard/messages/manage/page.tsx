"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type MessageRow = {
  id: string;
  tenant_id: string;
  message: string;
  status: string;
  created_at: number;
  sender_role?: string;
  is_read?: number;
};

export default function ManageMessagesPage() {
  const [rows, setRows] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tenantQuery, setTenantQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [replyTenant, setReplyTenant] = useState<string>("");
  const [replyText, setReplyText] = useState<string>("");
  const [replySending, setReplySending] = useState<boolean>(false);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/messages');
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = await res.json();
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      if (tenantQuery && !r.tenant_id.toLowerCase().includes(tenantQuery.toLowerCase())) return false;
      if (status !== 'all' && r.status !== status) return false;
      if (from) {
        const t = new Date(from).getTime();
        if (r.created_at < t) return false;
      }
      if (to) {
        const t = new Date(to).getTime();
        if (r.created_at > t) return false;
      }
      if (search && !r.message.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, tenantQuery, status, from, to]);

  const conversations = useMemo(() => {
    const byTenant: Record<string, { tenantId: string; lastAt: number; lastMsg: string; unread: number }> = {};
    for (const m of filtered) {
      const t = m.tenant_id;
      if (!byTenant[t]) byTenant[t] = { tenantId: t, lastAt: 0, lastMsg: '', unread: 0 };
      if (m.created_at > byTenant[t].lastAt) { byTenant[t].lastAt = m.created_at; byTenant[t].lastMsg = m.message; }
      if ((m.sender_role || 'renter') === 'renter' && (m.is_read || 0) === 0) byTenant[t].unread++;
    }
    return Object.values(byTenant).sort((a,b) => b.lastAt - a.lastAt);
  }, [filtered]);

  async function sendReply() {
    const targetTenant = replyTenant || selectedTenant;
    if (!targetTenant || !replyText.trim()) return;
    setReplySending(true);
    setError(null);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: targetTenant, message: replyText, status: 'sent', senderRole: 'manager' })
      });
      if (!res.ok) throw new Error(`Send failed: ${res.status}`);
      setReplyText("");
      // Refresh list
      const listRes = await fetch('/api/messages');
      if (listRes.ok) {
        const data = await listRes.json();
        setRows(Array.isArray(data) ? data : []);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to send reply');
    } finally {
      setReplySending(false);
    }
  }

  async function selectConversation(tenantId: string) {
    setSelectedTenant(tenantId);
    setReplyTenant(tenantId);
    // mark read
    await fetch('/api/messages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tenantId }) });
    // refresh messages
    const listRes = await fetch('/api/messages');
    if (listRes.ok) {
      const data = await listRes.json();
      setRows(Array.isArray(data) ? data : []);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Messages (Manager)</h1>
        <p className="text-muted-foreground">Review and filter tenant messages.</p>
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
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">From</label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">To</label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Search Messages</label>
            <Input placeholder="search text" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Conversation + Thread Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="border rounded-md p-2 max-h-[60vh] overflow-auto">
              {conversations.length === 0 ? (
                <div className="text-sm text-muted-foreground">No conversations yet.</div>
              ) : (
                <ul className="space-y-1">
                  {conversations.map(c => (
                    <li key={c.tenantId}>
                      <button
                        onClick={() => selectConversation(c.tenantId)}
                        className={`w-full text-left rounded px-2 py-2 ${selectedTenant === c.tenantId ? 'bg-muted' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{c.tenantId}</span>
                          {c.unread > 0 && (
                            <span className="ml-2 rounded-full bg-blue-600 text-white text-xs px-2 py-0.5">{c.unread}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1">{c.lastMsg}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="md:col-span-2 border rounded-md p-2 flex flex-col max-h-[60vh]">
              <div className="flex-1 overflow-auto space-y-2">
                {selectedTenant ? (
                  filtered
                    .filter(m => m.tenant_id === selectedTenant)
                    .sort((a,b) => a.created_at - b.created_at)
                    .map(m => (
                      <div key={m.id} className={`max-w-[70%] p-2 rounded ${ (m.sender_role || 'renter') === 'manager' ? 'ml-auto bg-blue-600 text-white' : 'mr-auto bg-gray-100' }`}>
                        <div className="text-xs opacity-70 mb-1">{new Date(m.created_at).toLocaleString()}</div>
                        <div className="whitespace-pre-wrap break-words">{m.message}</div>
                      </div>
                    ))
                ) : (
                  <div className="text-sm text-muted-foreground">Select a conversation</div>
                )}
              </div>
              <div className="mt-2 grid grid-cols-4 gap-2">
                <div className="col-span-3">
                  <Input placeholder="Type a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} />
                </div>
                <div>
                  <Button onClick={sendReply} disabled={replySending || !selectedTenant || !replyText.trim()} className="w-full">{replySending ? 'Sending…' : 'Send'}</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reply removed: the thread composer above handles replies */}

          {loading && <div>Loading…</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
          {!loading && filtered.length === 0 && (
            <div className="text-sm text-muted-foreground">No messages match your filters.</div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Tenant</th>
                    <th className="py-2 pr-4">Message</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{new Date(m.created_at).toLocaleString()}</td>
                      <td className="py-2 pr-4">{m.tenant_id}</td>
                      <td className="py-2 pr-4 max-w-[40ch] break-words">{m.message}</td>
                      <td className="py-2 pr-4 capitalize">{m.status}</td>
                      <td className="py-2 pr-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTenant(m.tenant_id);
                            setTimeout(() => {
                              const input = document.querySelector('.md\\:col-span-2 input, .md\\:col-span-2 textarea');
                              if (input) (input as HTMLInputElement).focus();
                              const threadDiv = document.querySelector('.md\\:col-span-2 .flex-1');
                              if (threadDiv) threadDiv.scrollTop = threadDiv.scrollHeight;
                            }, 400);
                          }}
                          title="Reply to this tenant"
                        >
                          Reply
                        </Button>
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


