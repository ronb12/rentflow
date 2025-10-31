"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, FileText, DollarSign, Wrench, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScheduleTourModal from "@/components/modals/schedule-tour-modal";

export default function RenterDashboard() {
  const [tourOpen, setTourOpen] = useState(false);
  const [myRequests, setMyRequests] = useState<Array<{ id: string; description: string; status: string; created_at: number; tenant_id: string; issue_type?: string }>>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/maintenance-requests');
        if (!res.ok) throw new Error('Failed to load requests');
        const data = await res.json();
        const email = typeof window !== 'undefined' ? (localStorage.getItem('userEmail') || '') : '';
        const inferredTenantId = email === 'renter@example.com' ? 'tenant_1' : 'tenant_cli';
        const mine = Array.isArray(data)
          ? data.filter((r: any) => r?.tenant_id === inferredTenantId)
          : [];
        if (active) setMyRequests(mine.slice(0, 5));
      } catch {
        if (active) setMyRequests([]);
      } finally {
        if (active) setLoadingRequests(false);
      }
    })();
    return () => { active = false };
  }, []);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your rental overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Lease</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Expires Dec 31, 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,200</div>
            <p className="text-xs text-muted-foreground">Due on the 1st</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Open requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">December 2024</p>
                  <p className="text-sm text-muted-foreground">Dec 1, 2024</p>
                </div>
                <div className="text-green-600 font-medium">$1,200.00</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">November 2024</p>
                  <p className="text-sm text-muted-foreground">Nov 1, 2024</p>
                </div>
                <div className="text-green-600 font-medium">$1,200.00</div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">October 2024</p>
                  <p className="text-sm text-muted-foreground">Oct 1, 2024</p>
                </div>
                <div className="text-green-600 font-medium">$1,200.00</div>
              </div>
            </div>
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
                try { window?.localStorage?.setItem('userRole', 'renter'); } catch {}
                window.location.href = '/dashboard/payments';
              }}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Pay Rent Online
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                try { window?.localStorage?.setItem('userRole', 'renter'); } catch {}
                window.location.href = '/dashboard/maintenance';
              }}
            >
              <Wrench className="mr-2 h-4 w-4" />
              Submit Maintenance Request
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                try { window?.localStorage?.setItem('userRole', 'renter'); } catch {}
                window.location.href = '/dashboard/my-lease';
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Lease Agreement
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => {
                alert('Scheduling a tour: choose a property and preferred time. Redirecting...');
                try { window?.localStorage?.setItem('userRole', 'renter'); } catch {}
                setTourOpen(true);
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Property Tour
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRequests ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : myRequests.length === 0 ? (
              <div className="text-sm text-muted-foreground">No requests yet.</div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div key={req.id} className="flex items-start justify-between rounded-md border p-3">
                    <div className="mr-3">
                      <div className="font-medium">
                        {req.issue_type ? req.issue_type.toUpperCase() : 'REQUEST'}
                      </div>
                      <div className="text-sm text-muted-foreground break-words">
                        {req.description || '—'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium capitalize">{req.status || 'open'}</div>
                      <div className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <ScheduleTourModal open={tourOpen} onOpenChange={setTourOpen} />
    </div>
  );
}
