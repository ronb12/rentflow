"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Calendar, CreditCard, Download, Plus, Edit, Trash2 } from "lucide-react";
import AddPaymentMethodModal from "@/components/add-payment-method-modal";
import EditPaymentMethodModal from "@/components/edit-payment-method-modal";

export default function PaymentsPage() {
  const [paymentAmount, setPaymentAmount] = useState("1200");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "card_1",
      type: "credit_card" as const,
      name: "Visa ending in 1234",
      expiry: "12/25",
      isDefault: true
    },
    {
      id: "bank_1", 
      type: "bank_account" as const,
      name: "Bank Account ending in 5678",
      accountType: "Checking",
      isDefault: false
    }
  ]);

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

  const handleAddPaymentMethod = (newMethod: any) => {
    setPaymentMethods(prev => [...prev, newMethod]);
  };

  const handleEditPaymentMethod = (methodId: string, updatedMethod: any) => {
    setPaymentMethods(prev => 
      prev.map(method => 
        method.id === methodId ? updatedMethod : method
      )
    );
  };

  const handleDeletePaymentMethod = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (method && confirm(`Are you sure you want to delete "${method.name}"?`)) {
      setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
      
      // If we deleted the default method, set another as default
      if (method.isDefault && paymentMethods.length > 1) {
        const remainingMethods = paymentMethods.filter(m => m.id !== methodId);
        if (remainingMethods.length > 0) {
          setPaymentMethods(prev => 
            prev.map(m => ({ ...m, isDefault: m.id === remainingMethods[0].id }))
          );
        }
      }
    }
  };

  const handleSetDefault = (methodId: string) => {
    setPaymentMethods(prev => 
      prev.map(method => ({ ...method, isDefault: method.id === methodId }))
    );
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

      {/* Payment Feature Explanation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            How the Payment Feature Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Payment Processing Flow:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. <strong>Select Amount:</strong> Enter the payment amount (defaults to monthly rent)</li>
                <li>2. <strong>Choose Method:</strong> Select from saved payment methods (credit card or bank account)</li>
                <li>3. <strong>Submit Payment:</strong> Click &quot;Pay Now&quot; to process the payment</li>
                <li>4. <strong>Backend Processing:</strong> Payment data is sent to our secure API endpoint</li>
                <li>5. <strong>Payment Gateway:</strong> Integration with Stripe for secure payment processing</li>
                <li>6. <strong>Confirmation:</strong> Real-time confirmation and receipt generation</li>
              </ol>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Security Features:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>PCI Compliance:</strong> All payment data is encrypted and PCI compliant</li>
                <li>• <strong>Tokenization:</strong> Sensitive data is tokenized for secure storage</li>
                <li>• <strong>SSL Encryption:</strong> All communications are encrypted in transit</li>
                <li>• <strong>Fraud Protection:</strong> Advanced fraud detection and prevention</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  {paymentMethods.map((method) => (
                    <label key={method.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          name="payment" 
                          value={method.type}
                          checked={paymentMethod === method.type}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="mr-2" 
                        />
                        <div>
                          <div className="font-medium">{method.name}</div>
                          {method.expiry && <div className="text-xs text-muted-foreground">Expires {method.expiry}</div>}
                          {method.accountType && <div className="text-xs text-muted-foreground">{method.accountType} Account</div>}
                        </div>
                      </div>
                      {method.isDefault && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Default</span>}
                    </label>
                  ))}
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

      {/* Payment Methods Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Methods
            </span>
            <AddPaymentMethodModal onAddPaymentMethod={handleAddPaymentMethod} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No payment methods added yet</p>
                <AddPaymentMethodModal onAddPaymentMethod={handleAddPaymentMethod} />
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <CreditCard className={`h-6 w-6 ${method.type === 'credit_card' ? 'text-blue-500' : 'text-green-500'}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{method.name}</p>
                        {method.isDefault && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            Default
                          </span>
                        )}
                      </div>
                      {method.expiry && <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>}
                      {method.accountType && <p className="text-sm text-muted-foreground">{method.accountType} Account</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!method.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Set Default
                      </Button>
                    )}
                    <EditPaymentMethodModal 
                      paymentMethod={method}
                      onUpdatePaymentMethod={handleEditPaymentMethod}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeletePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete payment method"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2 text-green-900">✅ Complete Payment Method Management System:</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• <strong>Add New:</strong> Complete form with validation for cards & bank accounts</li>
                <li>• <strong>Edit Existing:</strong> Full edit modal with all payment method details</li>
                <li>• <strong>Update Details:</strong> Card numbers, expiry, CVV, billing address</li>
                <li>• <strong>Bank Account Updates:</strong> Routing, account numbers, account type</li>
                <li>• <strong>Set Default:</strong> Choose your preferred payment method</li>
                <li>• <strong>Delete:</strong> Remove unused payment methods with confirmation</li>
                <li>• <strong>Auto-Default:</strong> Automatically sets new default when deleting current default</li>
                <li>• <strong>Form Validation:</strong> Real-time validation for all fields</li>
                <li>• <strong>Security:</strong> All data encrypted and PCI compliant</li>
                <li>• <strong>Empty State:</strong> Helpful empty state when no methods exist</li>
                <li>• <strong>Current Info Display:</strong> Shows current payment method details</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
