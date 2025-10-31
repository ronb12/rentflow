"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, Save } from "lucide-react";

interface NotificationPreferences {
  id?: string;
  userId: string;
  tenantId?: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  rentDueReminder: boolean;
  lateNotice: boolean;
  maintenanceUpdate: boolean;
  documentSigning: boolean;
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    userId: "user_1", // Would come from auth in real app
    emailEnabled: true,
    smsEnabled: false,
    rentDueReminder: true,
    lateNotice: true,
    maintenanceUpdate: true,
    documentSigning: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/notifications/preferences?userId=user_1");
      if (response.ok) {
        const data = await response.json();
        if (data.preferences && data.preferences.length > 0) {
          setPreferences(data.preferences[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error("Failed to save preferences");

      alert("Notification preferences saved successfully!");
    } catch (error) {
      console.error("Error saving preferences:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Delivery Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, emailEnabled: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-enabled" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via text message
              </p>
            </div>
            <Switch
              id="sms-enabled"
              checked={preferences.smsEnabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, smsEnabled: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Types
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Rent Due Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get reminders before rent is due
              </p>
            </div>
            <Switch
              checked={preferences.rentDueReminder}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, rentDueReminder: checked })
              }
              disabled={!preferences.emailEnabled && !preferences.smsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Late Payment Notices</Label>
              <p className="text-sm text-muted-foreground">
                Notifications for late rent payments
              </p>
            </div>
            <Switch
              checked={preferences.lateNotice}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, lateNotice: checked })
              }
              disabled={!preferences.emailEnabled && !preferences.smsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Updates</Label>
              <p className="text-sm text-muted-foreground">
                Updates on maintenance request status
              </p>
            </div>
            <Switch
              checked={preferences.maintenanceUpdate}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, maintenanceUpdate: checked })
              }
              disabled={!preferences.emailEnabled && !preferences.smsEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Document Signing Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Reminders to sign pending documents
              </p>
            </div>
            <Switch
              checked={preferences.documentSigning}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, documentSigning: checked })
              }
              disabled={!preferences.emailEnabled && !preferences.smsEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

