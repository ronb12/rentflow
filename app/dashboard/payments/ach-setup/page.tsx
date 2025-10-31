"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building2, CheckCircle2 } from "lucide-react";

export default function ACHSetupPage() {
  const [formData, setFormData] = useState({
    accountType: "checking",
    accountNumber: "",
    routingNumber: "",
    accountHolderName: "",
    setAsDefault: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSuccess(false);

      // In production, this would integrate with Stripe or Plaid for ACH verification
      // For now, we'll create a payment method record
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: "tenant_1", // Would come from auth
          type: "ach",
          bankAccountLast4: formData.accountNumber.slice(-4),
          bankAccountType: formData.accountType,
          isDefault: formData.setAsDefault,
        }),
      });

      if (!response.ok) throw new Error("Failed to add ACH account");

      setSuccess(true);
      setFormData({
        accountType: "checking",
        accountNumber: "",
        routingNumber: "",
        accountHolderName: "",
        setAsDefault: true,
      });
    } catch (error) {
      console.error("Error setting up ACH:", error);
      alert("Failed to set up ACH account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold">ACH Account Added Successfully!</h2>
              <p className="text-muted-foreground">
                Your ACH account ending in {formData.accountNumber.slice(-4)} has been added.
                {formData.setAsDefault && " It has been set as your default payment method."}
              </p>
              <Button onClick={() => setSuccess(false)} variant="outline">
                Add Another Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Setup ACH Payment</h1>
        <p className="text-muted-foreground mt-2">
          Add a bank account for automatic rent payments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Bank Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Account Type</Label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Account Holder Name</Label>
              <Input
                value={formData.accountHolderName}
                onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Routing Number</Label>
              <Input
                type="text"
                pattern="[0-9]{9}"
                maxLength={9}
                value={formData.routingNumber}
                onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value.replace(/\D/g, '') })}
                placeholder="123456789"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                placeholder="0000000000"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="setAsDefault"
                checked={formData.setAsDefault}
                onChange={(e) => setFormData({ ...formData, setAsDefault: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="setAsDefault">Set as default payment method</Label>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-4">
                By adding this bank account, you authorize automatic ACH debits for rent payments.
                You can cancel this authorization at any time.
              </p>
              <Button type="submit" disabled={submitting} className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                {submitting ? "Processing..." : "Add Bank Account"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

