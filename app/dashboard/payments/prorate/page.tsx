"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign } from "lucide-react";
import { resolveClientRole } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function ProratePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    leaseId: "",
    startDate: "",
    endDate: "",
    monthlyRent: "",
    prorationMethod: "daily",
  });

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = resolveClientRole();
    if (role !== 'manager') {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleCalculate = async () => {
    try {
      if (!formData.startDate || !formData.endDate || !formData.monthlyRent) {
        alert("Please fill in all required fields");
        return;
      }

      setLoading(true);
      const response = await fetch("/api/payments/prorate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaseId: formData.leaseId || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate,
          monthlyRent: parseFloat(formData.monthlyRent),
          prorationMethod: formData.prorationMethod,
        }),
      });

      if (!response.ok) throw new Error("Failed to calculate proration");

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error calculating proration:", error);
      alert("Failed to calculate proration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prorate Rent Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Calculate prorated rent for partial lease periods
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculate Proration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Lease ID (Optional)</Label>
              <Input
                value={formData.leaseId}
                onChange={(e) => setFormData({ ...formData, leaseId: e.target.value })}
                placeholder="lease_123"
              />
            </div>

            <div className="space-y-2">
              <Label>Monthly Rent ($) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                placeholder="1200.00"
              />
            </div>

            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Proration Method</Label>
              <Select
                value={formData.prorationMethod}
                onValueChange={(value) => setFormData({ ...formData, prorationMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (30 days/month)</SelectItem>
                  <SelectItem value="exact">Exact Days in Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCalculate} disabled={loading} className="w-full">
            <Calculator className="mr-2 h-4 w-4" />
            {loading ? "Calculating..." : "Calculate Prorated Amount"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Calculation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm text-muted-foreground">Monthly Rent</div>
                <div className="text-2xl font-bold">{formatCurrency(result.monthlyRent)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Prorated Amount</div>
                <div className="text-2xl font-bold text-green-600">{formatCurrency(result.proratedAmount)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Days in Period</div>
                <div className="text-lg">{result.daysInPeriod} days</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Daily Rate</div>
                <div className="text-lg">{formatCurrency(Math.round(result.dailyRate * 100))}</div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Method: {result.prorationMethod === "daily" ? "Daily (30 days/month)" : "Exact days in month"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

