"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Calendar, CreditCard, Download } from "lucide-react";

export default function PaymentsPage() {
  const [paymentAmount, setPaymentAmount] = useState("1200");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: 'tenant_1',
          amount: parseFloat(paymentAmount) * 100, // Convert to cents
          paymentMethod: paymentMethod,
          status: 'pending'
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setMessage("Payment submitted successfully!");
        setPaymentAmount("1200"); // Reset form
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage("Failed to submit payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Center</h1>
        <p className="text-muted-foreground">Manage your rent payments and view payment history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">All payments current</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment Due</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,200.00</div>
            <p className="text-xs text-muted-foreground">Due February 1, 2025</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Method</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">**** **** **** 1234</div>
            <p className="text-xs text-muted-foreground">Expires 12/26</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Make a Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handlePayment}>
              <div>
                <label className="text-sm font-medium">Payment Amount</label>
                <div className="mt-1">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="1200.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <div className="mt-1 space-y-2">
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="card" 
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2" 
                    />
                    Credit/Debit Card (**** 1234)
                  </label>
                  <label className="flex items-center">
                    <input 
                      type="radio" 
                      name="payment" 
                      value="bank" 
                      checked={paymentMethod === "bank"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-2" 
                    />
                    Bank Account (**** 5678)
                  </label>
                </div>
              </div>
              {message && (
                <div className={`p-3 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {message}
                </div>
              )}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Processing...' : `Pay $${paymentAmount}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">January 2025</p>
                  <p className="text-sm text-muted-foreground">Jan 1, 2025</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">$1,200.00</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">December 2024</p>
                  <p className="text-sm text-muted-foreground">Dec 1, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">$1,200.00</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">November 2024</p>
                  <p className="text-sm text-muted-foreground">Nov 1, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">$1,200.00</p>
                  <p className="text-sm text-green-600">Paid</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Download className="mr-2 h-4 w-4" />
              Download Payment History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
