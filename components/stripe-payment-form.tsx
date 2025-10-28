"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

// Mock Stripe integration - replace with actual Stripe Elements in production
export default function StripePaymentForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState("1200");

  const handlePayment = async () => {
    setIsProcessing(true);
    setPaymentStatus("");

    try {
      // Create payment intent
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: 'tenant_1',
          amount: parseFloat(paymentAmount) * 100, // Convert to cents
          paymentMethod: 'credit_card',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.client_secret) {
          // In production, you would use Stripe Elements here
          // For now, we'll simulate the payment confirmation
          setPaymentStatus("Processing payment...");
          
          // Simulate payment confirmation
          setTimeout(async () => {
            try {
              const confirmResponse = await fetch('/api/payments', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  payment_intent_id: result.payment_intent_id,
                }),
              });

              const confirmResult = await confirmResponse.json();
              
              if (confirmResponse.ok) {
                setPaymentStatus(`Payment ${confirmResult.status}! Amount: $${(confirmResult.amount / 100).toFixed(2)}`);
              } else {
                setPaymentStatus(`Payment failed: ${confirmResult.error}`);
              }
            } catch (error) {
              setPaymentStatus("Payment confirmation failed");
            } finally {
              setIsProcessing(false);
            }
          }, 2000);
        } else {
          setPaymentStatus("Mock payment completed (Stripe not configured)");
          setIsProcessing(false);
        }
      } else {
        setPaymentStatus(`Error: ${result.error}`);
        setIsProcessing(false);
      }
    } catch (error) {
      setPaymentStatus("Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="mr-2 h-5 w-5" />
          Stripe Payment Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Payment Amount</label>
          <input
            type="number"
            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder="1200.00"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Stripe Integration Status:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Payment Intent:</strong> Creates secure payment intent</li>
            <li>• <strong>Client Secret:</strong> Returns client secret for frontend</li>
            <li>• <strong>Webhook Support:</strong> Handles payment status updates</li>
            <li>• <strong>Error Handling:</strong> Comprehensive error management</li>
            <li>• <strong>Mock Mode:</strong> Works without Stripe keys (for testing)</li>
          </ul>
        </div>

        {paymentStatus && (
          <div className={`p-3 rounded-md ${
            paymentStatus.includes('failed') || paymentStatus.includes('Error') 
              ? 'bg-red-50 text-red-700' 
              : 'bg-green-50 text-green-700'
          }`}>
            {paymentStatus}
          </div>
        )}

        <Button 
          onClick={handlePayment} 
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${paymentAmount}
            </>
          )}
        </Button>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">To Enable Full Stripe Integration:</h4>
          <ol className="text-sm text-yellow-800 space-y-1">
            <li>1. Add Stripe keys to environment variables</li>
            <li>2. Set up Stripe webhook endpoint</li>
            <li>3. Replace mock form with Stripe Elements</li>
            <li>4. Test with Stripe test cards</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
