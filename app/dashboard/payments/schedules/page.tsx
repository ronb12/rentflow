"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, Plus, Save, Calculator } from "lucide-react";
import { resolveClientRole } from "@/lib/auth";

interface PaymentSchedule {
  id: string;
  leaseId: string;
  rentAmount: number;
  dueDay: number;
  startDate: number;
  endDate: number | null;
  isActive: boolean;
}

export default function PaymentSchedulesPage() {
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [role, setRole] = useState<'manager' | 'renter' | null>(null);
  const [lastFetchError, setLastFetchError] = useState<string | null>(null);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [requestFor, setRequestFor] = useState<PaymentSchedule | null>(null);
  const [requestForm, setRequestForm] = useState({ requestedDueDay: '', requestedStartDate: '', reason: '', customReason: '' });
  const [isWeeklyOpen, setIsWeeklyOpen] = useState(false);
  const [weeklyForm, setWeeklyForm] = useState({ leaseId: '', monthlyRent: '', startDate: '' });

  const [formData, setFormData] = useState({
    leaseId: "",
    rentAmount: "",
    dueDay: 1,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    setRole(resolveClientRole());
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setLastFetchError(null);
      const response = await fetch("/api/payment-schedules", { cache: 'no-store' });
      if (!response.ok) throw new Error("Failed to fetch schedules");
      
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      setLastFetchError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.leaseId || !formData.rentAmount) {
        alert("Lease ID and rent amount are required");
        return;
      }

      const response = await fetch("/api/payment-schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rentAmount: parseFloat(formData.rentAmount),
        }),
      });

      if (!response.ok) throw new Error("Failed to save schedule");

      await fetchSchedules();
      setShowEditor(false);
      setFormData({ leaseId: "", rentAmount: "", dueDay: 1, startDate: "", endDate: "" });
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule. Please try again.");
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Ongoing";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Schedules</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchSchedules}>Refresh</Button>
          {role === 'manager' && (
          <Button onClick={() => setShowEditor(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Schedule
          </Button>
          )}
          {role === 'manager' && (
            <Button variant="outline" onClick={() => setIsWeeklyOpen(true)}>
              Create Weekly Plan (4x)
            </Button>
          )}
        </div>
      </div>

      {/* Debug info to verify data presence during testing */}
      <div className="text-xs text-muted-foreground">Found schedules: {schedules.length}{lastFetchError ? ` • Error: ${lastFetchError}` : ''}</div>

      {/* Editor */}
      {role === 'manager' && showEditor && (
        <Card>
          <CardHeader>
            <CardTitle>Create Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Lease ID *</Label>
                <Input
                  value={formData.leaseId}
                  onChange={(e) => setFormData({ ...formData, leaseId: e.target.value })}
                  placeholder="lease_123"
                />
              </div>

              <div className="space-y-2">
                <Label>Monthly Rent Amount ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rentAmount}
                  onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                  placeholder="1200.00"
                />
              </div>

              <div className="space-y-2">
                <Label>Due Day (1-31)</Label>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={(e) => setFormData({ ...formData, dueDay: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Schedule
              </Button>
              <Button variant="outline" onClick={() => {
                setShowEditor(false);
                setFormData({ leaseId: "", rentAmount: "", dueDay: 1, startDate: "", endDate: "" });
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedules List - Compact Table */}
      {loading ? (
        <div className="text-center py-8">Loading schedules...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {role === 'manager' ? 'No payment schedules found. Create one to get started.' : 'No payment schedules found.'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Lease</th>
                <th className="text-left px-3 py-2 font-medium">Rent</th>
                <th className="text-left px-3 py-2 font-medium">Due Day</th>
                <th className="text-left px-3 py-2 font-medium">Start</th>
                <th className="text-left px-3 py-2 font-medium">End</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
                {role === 'renter' && (<th className="text-left px-3 py-2 font-medium">Actions</th>)}
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} data-testid="schedule-card" className="border-t">
                  <td className="px-3 py-2 font-medium">{schedule.leaseId}</td>
                  <td className="px-3 py-2">{formatCurrency(schedule.rentAmount)}</td>
                  <td className="px-3 py-2">{schedule.dueDay}</td>
                  <td className="px-3 py-2">{formatDate(schedule.startDate)}</td>
                  <td className="px-3 py-2">{formatDate(schedule.endDate)}</td>
                  <td className="px-3 py-2">
                    {schedule.isActive ? (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Inactive</span>
                    )}
                  </td>
                  {role === 'renter' && (
                    <td className="px-3 py-2">
                      <Button size="sm" variant="outline" data-testid="request-change" onClick={() => { setRequestFor(schedule); setIsRequestOpen(true); }}>
                        Request Change
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Change Modal */}
      {isRequestOpen && requestFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md p-4">
            <div className="text-lg font-semibold mb-2">Request Schedule Change</div>
            <div className="space-y-3">
              <div>
                <Label>New Due Day (1-31)</Label>
                <Input type="number" min={1} max={31} value={requestForm.requestedDueDay}
                  onChange={(e) => setRequestForm({ ...requestForm, requestedDueDay: e.target.value })} />
              </div>
              <div>
                <Label>Effective Start Date (optional)</Label>
                <Input type="date" value={requestForm.requestedStartDate}
                  onChange={(e) => setRequestForm({ ...requestForm, requestedStartDate: e.target.value })} />
              </div>
              <div>
                <Label>Reason</Label>
                <select
                  className="w-full border rounded-md px-2 py-2"
                  value={requestForm.reason}
                  onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                >
                  <option value="">Select a reason</option>
                  <option value="Align with biweekly pay dates">Align with biweekly pay dates</option>
                  <option value="Move due date after paycheck">Move due date after paycheck</option>
                  <option value="Temporary hardship this month">Temporary hardship this month</option>
                  <option value="Split rent into two installments">Split rent into two installments</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              {requestForm.reason === 'Other' && (
                <div>
                  <Label>Describe Reason</Label>
                  <Input value={requestForm.customReason} onChange={(e) => setRequestForm({ ...requestForm, customReason: e.target.value })} placeholder="Enter details" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => { setIsRequestOpen(false); setRequestFor(null); }}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  const res = await fetch('/api/payment-schedules/change-requests', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      scheduleId: requestFor.id,
                      requestedDueDay: requestForm.requestedDueDay ? parseInt(requestForm.requestedDueDay) : undefined,
                      requestedStartDate: requestForm.requestedStartDate || undefined,
                      reason: (requestForm.reason === 'Other' ? requestForm.customReason : requestForm.reason) || undefined,
                    }),
                  });
                  if (!res.ok) throw new Error('Failed to submit request');
                  alert('Change request submitted.');
                  setIsRequestOpen(false);
                } catch (e) {
                  alert('Failed to submit request');
                }
              }}>Submit</Button>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Plan Modal (Manager) */}
      {isWeeklyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-md shadow-lg w-full max-w-md p-4">
            <div className="text-lg font-semibold mb-2">Create Weekly Plan (4 installments)</div>
            <div className="space-y-3">
              <div>
                <Label>Lease ID</Label>
                <Input value={weeklyForm.leaseId} onChange={(e) => setWeeklyForm({ ...weeklyForm, leaseId: e.target.value })} placeholder="lease_1" />
              </div>
              <div>
                <Label>Monthly Rent ($)</Label>
                <Input type="number" step="0.01" value={weeklyForm.monthlyRent} onChange={(e) => setWeeklyForm({ ...weeklyForm, monthlyRent: e.target.value })} placeholder="1200.00" />
              </div>
              <div>
                <Label>Start Month (optional)</Label>
                <Input type="date" value={weeklyForm.startDate} onChange={(e) => setWeeklyForm({ ...weeklyForm, startDate: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsWeeklyOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  const res = await fetch('/api/payment-schedules/weekly-plan', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
                      leaseId: weeklyForm.leaseId,
                      monthlyRent: weeklyForm.monthlyRent ? parseFloat(weeklyForm.monthlyRent) : undefined,
                      startDate: weeklyForm.startDate || undefined,
                    })
                  });
                  if (!res.ok) throw new Error('Failed to create weekly plan');
                  setIsWeeklyOpen(false);
                  fetchSchedules();
                } catch {
                  alert('Failed to create weekly plan');
                }
              }}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

