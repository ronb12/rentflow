"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Settings, Plus, Save } from "lucide-react";

interface LateFeeRule {
  id: string;
  leaseId: string | null;
  gracePeriodDays: number;
  feeType: "fixed" | "percentage";
  fixedAmount: number;
  percentageAmount: number;
  maxFeeAmount: number | null;
  isActive: boolean;
}

export default function LateFeesPage() {
  const [rules, setRules] = useState<LateFeeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<LateFeeRule | null>(null);
  const [showNewRule, setShowNewRule] = useState(false);

  const [formData, setFormData] = useState({
    leaseId: "",
    gracePeriodDays: 5,
    feeType: "fixed" as "fixed" | "percentage",
    fixedAmount: 0,
    percentageAmount: 0,
    maxFeeAmount: "",
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/accounting/late-fee-rules");
      if (!response.ok) throw new Error("Failed to fetch rules");
      
      const data = await response.json();
      setRules(data.rules || []);
    } catch (error) {
      console.error("Error fetching rules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        maxFeeAmount: formData.maxFeeAmount ? parseFloat(formData.maxFeeAmount) * 100 : null,
        fixedAmount: formData.feeType === "fixed" ? parseFloat(formData.fixedAmount.toString()) * 100 : 0,
        percentageAmount: formData.feeType === "percentage" ? parseFloat(formData.percentageAmount.toString()) : 0,
      };

      const url = editingRule ? `/api/accounting/late-fee-rules/${editingRule.id}` : "/api/accounting/late-fee-rules";
      const method = editingRule ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save rule");

      await fetchRules();
      setEditingRule(null);
      setShowNewRule(false);
      resetForm();
    } catch (error) {
      console.error("Error saving rule:", error);
      alert("Failed to save rule. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      leaseId: "",
      gracePeriodDays: 5,
      feeType: "fixed",
      fixedAmount: 0,
      percentageAmount: 0,
      maxFeeAmount: "",
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Late Fee Settings</h1>
        <Button onClick={() => setShowNewRule(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Rule
        </Button>
      </div>

      {/* New/Edit Rule Form */}
      {(showNewRule || editingRule) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingRule ? "Edit Rule" : "New Late Fee Rule"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Lease (leave empty for default)</Label>
                <Input
                  value={formData.leaseId}
                  onChange={(e) => setFormData({ ...formData, leaseId: e.target.value })}
                  placeholder="Leave empty for organization-wide rule"
                />
              </div>

              <div className="space-y-2">
                <Label>Grace Period (days)</Label>
                <Input
                  type="number"
                  value={formData.gracePeriodDays}
                  onChange={(e) => setFormData({ ...formData, gracePeriodDays: parseInt(e.target.value) || 0 })}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Fee Type</Label>
                <Select
                  value={formData.feeType}
                  onValueChange={(value) => setFormData({ ...formData, feeType: value as "fixed" | "percentage" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.feeType === "fixed" ? (
                <div className="space-y-2">
                  <Label>Fixed Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.fixedAmount}
                    onChange={(e) => setFormData({ ...formData, fixedAmount: parseFloat(e.target.value) || 0 })}
                    min="0"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Percentage (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.percentageAmount}
                      onChange={(e) => setFormData({ ...formData, percentageAmount: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Fee Amount ($) - Optional</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.maxFeeAmount}
                      onChange={(e) => setFormData({ ...formData, maxFeeAmount: e.target.value })}
                      min="0"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Rule
              </Button>
              <Button variant="outline" onClick={() => {
                setShowNewRule(false);
                setEditingRule(null);
                resetForm();
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules List */}
      <Card>
        <CardHeader>
          <CardTitle>Late Fee Rules</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No late fee rules configured. Create one to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="font-medium">
                        {rule.leaseId ? `Lease: ${rule.leaseId}` : "Organization Default"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Grace Period: {rule.gracePeriodDays} days
                      </div>
                      <div className="text-sm">
                        Fee: {rule.feeType === "fixed" 
                          ? formatCurrency(rule.fixedAmount)
                          : `${rule.percentageAmount}%${rule.maxFeeAmount ? ` (max ${formatCurrency(rule.maxFeeAmount)})` : ""}`}
                      </div>
                      <div className="text-xs">
                        Status: <span className={rule.isActive ? "text-green-600" : "text-gray-400"}>
                          {rule.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingRule(rule);
                        setFormData({
                          leaseId: rule.leaseId || "",
                          gracePeriodDays: rule.gracePeriodDays,
                          feeType: rule.feeType,
                          fixedAmount: rule.fixedAmount / 100,
                          percentageAmount: rule.percentageAmount,
                          maxFeeAmount: rule.maxFeeAmount ? (rule.maxFeeAmount / 100).toString() : "",
                        });
                        setShowNewRule(false);
                      }}
                    >
                      Edit
                    </Button>
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

