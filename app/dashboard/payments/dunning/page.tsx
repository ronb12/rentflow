"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Save, Clock } from "lucide-react";

interface DunningSettings {
  firstNoticeDays: number;
  secondNoticeDays: number;
  thirdNoticeDays: number;
  finalNoticeDays: number;
}

export default function DunningPage() {
  const [settings, setSettings] = useState<DunningSettings>({
    firstNoticeDays: 3,
    secondNoticeDays: 7,
    thirdNoticeDays: 14,
    finalNoticeDays: 30,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/dunning/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching dunning settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/payments/dunning/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      alert("Dunning settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dunning Management</h1>
        <p className="text-muted-foreground mt-2">
          Configure automated payment reminder notices for overdue rent
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Dunning Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>First Notice (days after due date)</Label>
              <Input
                type="number"
                min="0"
                value={settings.firstNoticeDays}
                onChange={(e) =>
                  setSettings({ ...settings, firstNoticeDays: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">
                First reminder sent when payment is {settings.firstNoticeDays} days overdue
              </p>
            </div>

            <div className="space-y-2">
              <Label>Second Notice (days after due date)</Label>
              <Input
                type="number"
                min="0"
                value={settings.secondNoticeDays}
                onChange={(e) =>
                  setSettings({ ...settings, secondNoticeDays: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Second reminder sent when payment is {settings.secondNoticeDays} days overdue
              </p>
            </div>

            <div className="space-y-2">
              <Label>Third Notice (days after due date)</Label>
              <Input
                type="number"
                min="0"
                value={settings.thirdNoticeDays}
                onChange={(e) =>
                  setSettings({ ...settings, thirdNoticeDays: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Third reminder sent when payment is {settings.thirdNoticeDays} days overdue
              </p>
            </div>

            <div className="space-y-2">
              <Label>Final Notice (days after due date)</Label>
              <Input
                type="number"
                min="0"
                value={settings.finalNoticeDays}
                onChange={(e) =>
                  setSettings({ ...settings, finalNoticeDays: parseInt(e.target.value) || 0 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Final notice sent when payment is {settings.finalNoticeDays} days overdue
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="h-4 w-4" />
              <span>Dunning notices will be automatically sent based on these schedules when payments are overdue.</span>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Dunning Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dunning Flow Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 p-2 border rounded">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-medium">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium">First Notice</div>
                <div className="text-muted-foreground">{settings.firstNoticeDays} days after due date</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded">
              <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-medium">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium">Second Notice</div>
                <div className="text-muted-foreground">{settings.secondNoticeDays} days after due date</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center font-medium">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium">Third Notice</div>
                <div className="text-muted-foreground">{settings.thirdNoticeDays} days after due date</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 border rounded">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center font-medium">
                4
              </div>
              <div className="flex-1">
                <div className="font-medium">Final Notice</div>
                <div className="text-muted-foreground">{settings.finalNoticeDays} days after due date</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


