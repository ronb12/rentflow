"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Zap, Plus, Save, Trash2 } from "lucide-react";

interface AutomatedTrigger {
  id: string;
  triggerType: string;
  triggerEvent: string;
  actionType: string;
  templateId: string | null;
  delayHours: number;
  isActive: boolean;
}

export default function TriggersPage() {
  const [triggers, setTriggers] = useState<AutomatedTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);

  const [formData, setFormData] = useState({
    triggerType: "",
    triggerEvent: "",
    actionType: "email",
    templateId: "",
    delayHours: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchTriggers();
  }, []);

  const fetchTriggers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/automated-triggers");
      if (!response.ok) throw new Error("Failed to fetch triggers");
      
      const data = await response.json();
      setTriggers(data.triggers || []);
    } catch (error) {
      console.error("Error fetching triggers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.triggerType || !formData.triggerEvent || !formData.actionType) {
        alert("Please fill in all required fields");
        return;
      }

      const response = await fetch("/api/automated-triggers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save trigger");

      await fetchTriggers();
      setShowEditor(false);
      setFormData({
        triggerType: "",
        triggerEvent: "",
        actionType: "email",
        templateId: "",
        delayHours: 0,
        isActive: true,
      });
    } catch (error) {
      console.error("Error saving trigger:", error);
      alert("Failed to save trigger. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Automated Triggers</h1>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Trigger
        </Button>
      </div>

      {/* Trigger Editor */}
      {showEditor && (
        <Card>
          <CardHeader>
            <CardTitle>Create Automated Trigger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Trigger Type *</Label>
                <Select
                  value={formData.triggerType}
                  onValueChange={(value) => setFormData({ ...formData, triggerType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Trigger Event *</Label>
                <Select
                  value={formData.triggerEvent}
                  onValueChange={(value) => setFormData({ ...formData, triggerEvent: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.triggerType === "rent" && (
                      <>
                        <SelectItem value="due_soon">Rent Due Soon</SelectItem>
                        <SelectItem value="overdue">Rent Overdue</SelectItem>
                        <SelectItem value="paid">Rent Paid</SelectItem>
                      </>
                    )}
                    {formData.triggerType === "maintenance" && (
                      <>
                        <SelectItem value="created">Request Created</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </>
                    )}
                    {formData.triggerType === "document" && (
                      <>
                        <SelectItem value="pending_signature">Pending Signature</SelectItem>
                        <SelectItem value="signed">Document Signed</SelectItem>
                      </>
                    )}
                    {formData.triggerType === "payment" && (
                      <>
                        <SelectItem value="received">Payment Received</SelectItem>
                        <SelectItem value="failed">Payment Failed</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Action Type *</Label>
                <Select
                  value={formData.actionType}
                  onValueChange={(value) => setFormData({ ...formData, actionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Send Email</SelectItem>
                    <SelectItem value="sms">Send SMS</SelectItem>
                    <SelectItem value="both">Send Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Delay (hours)</Label>
                <Input
                  type="number"
                  value={formData.delayHours}
                  onChange={(e) => setFormData({ ...formData, delayHours: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Trigger
              </Button>
              <Button variant="outline" onClick={() => {
                setShowEditor(false);
                setFormData({
                  triggerType: "",
                  triggerEvent: "",
                  actionType: "email",
                  templateId: "",
                  delayHours: 0,
                  isActive: true,
                });
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Triggers List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Triggers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading triggers...</div>
          ) : triggers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No automated triggers configured. Create one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {triggers.map((trigger) => (
                <Card key={trigger.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="font-medium">
                        {trigger.triggerType.charAt(0).toUpperCase() + trigger.triggerType.slice(1)} - {trigger.triggerEvent.replace("_", " ")}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Action: {trigger.actionType}
                        {trigger.delayHours > 0 && ` (after ${trigger.delayHours} hours)`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        trigger.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}>
                        {trigger.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

