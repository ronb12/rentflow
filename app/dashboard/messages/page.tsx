"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Plus } from "lucide-react";

export default function MessagesPage() {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageStatus, setMessageStatus] = useState("");
  const [history, setHistory] = useState<Array<{ id: string; tenant_id: string; message: string; created_at: number; sender_role?: string }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const threadRef = useRef<HTMLDivElement | null>(null);

  // Infer current tenant id from email (demo accounts)
  function getCurrentTenantId(): string {
    if (typeof window === 'undefined') return 'tenant_1';
    const email = localStorage.getItem('userEmail') || '';
    return email === 'renter@example.com' ? 'tenant_1' : 'tenant_cli';
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/messages');
        const data = await res.json();
        const tenantId = getCurrentTenantId();
        const mine = Array.isArray(data) ? data.filter((m: any) => m.tenant_id === tenantId) : [];
        if (active) setHistory(mine.sort((a: any, b: any) => a.created_at - b.created_at));
      } catch {
        if (active) setHistory([]);
      } finally {
        if (active) setLoadingHistory(false);
      }
    })();
    return () => { active = false };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessageStatus("");

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: getCurrentTenantId(),
          message: message,
          status: 'sent',
          senderRole: 'renter'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessageStatus("Message sent successfully!");
        setMessage(""); // Reset form
        // Refresh history
        try {
          const res = await fetch('/api/messages');
          if (res.ok) {
            const data = await res.json();
            const tenantId = getCurrentTenantId();
            const mine = Array.isArray(data) ? data.filter((m: any) => m.tenant_id === tenantId) : [];
            setHistory(mine.sort((a: any, b: any) => a.created_at - b.created_at));
            setTimeout(() => {
              if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
            }, 100);
          }
        } catch {}
      } else {
        setMessageStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessageStatus("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Messages</h1>
        <p className="text-muted-foreground">Communicate with your property management team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Conversation with Property Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={threadRef} className="space-y-4 h-96 overflow-y-auto">
              {loadingHistory ? (
                <div className="text-sm text-muted-foreground">Loading…</div>
              ) : history.length === 0 ? (
                <div className="text-sm text-muted-foreground">No messages yet.</div>
              ) : (
                history.map((m) => {
                  const fromManager = (m.sender_role || 'renter') === 'manager';
                  return (
                    <div key={m.id} className={`flex ${fromManager ? 'justify-start' : 'justify-end'}`}>
                      <div className={`${fromManager ? 'bg-gray-100 text-gray-900' : 'bg-blue-500 text-white'} p-3 rounded-lg max-w-xs`}>
                        <p>{m.message}</p>
                        <p className={`text-xs opacity-75 mt-1 ${fromManager ? 'text-gray-600' : ''}`}>{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <form onSubmit={handleSubmit} className="flex space-x-2 w-full">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <Button type="submit" disabled={isSubmitting}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
            {messageStatus && (
              <div className={`mt-2 p-2 rounded-md text-sm ${messageStatus.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {messageStatus}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                // Scroll to message input
                const messageInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                if (messageInput) {
                  messageInput.focus();
                  messageInput.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => {
                if (threadRef.current) {
                  threadRef.current.scrollTop = threadRef.current.scrollHeight;
                }
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              View All Messages
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Property Manager</p>
                <p className="text-sm text-muted-foreground">Sarah Johnson</p>
                <p className="text-sm text-muted-foreground">sarah@rentflow.com</p>
                <p className="text-sm text-muted-foreground">(555) 123-4567</p>
              </div>
              <div>
                <p className="font-medium">Maintenance Coordinator</p>
                <p className="text-sm text-muted-foreground">Mike Rodriguez</p>
                <p className="text-sm text-muted-foreground">mike@rentflow.com</p>
                <p className="text-sm text-muted-foreground">(555) 987-6543</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
