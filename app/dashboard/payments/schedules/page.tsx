"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, DollarSign, Plus, Save, Calculator } from "lucide-react";

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

  const [formData, setFormData] = useState({
    leaseId: "",
    rentAmount: "",
    dueDay: 1,
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payment-schedules");
      if (!response.ok) throw new Error("Failed to fetch schedules");
      
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
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
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Schedule
        </Button>
      </div>

      {/* Editor */}
      {showEditor && (
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

      {/* Schedules List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading schedules...</div>
        ) : schedules.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No payment schedules found. Create one to get started.
          </div>
        ) : (
          schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Schedule</span>
                  {schedule.isActive && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <div className="font-medium">Lease: {schedule.leaseId}</div>
                  <div className="text-muted-foreground mt-2">
                    <div>Rent: {formatCurrency(schedule.rentAmount)}</div>
                    <div>Due Day: {schedule.dueDay}</div>
                    <div>Start: {formatDate(schedule.startDate)}</div>
                    <div>End: {formatDate(schedule.endDate)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

