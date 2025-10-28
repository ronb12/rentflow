"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Edit, Loader2, CheckCircle, AlertCircle, Save } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account';
  name: string;
  expiry?: string;
  accountType?: string;
  isDefault: boolean;
}

interface EditPaymentMethodModalProps {
  paymentMethod: PaymentMethod;
  onUpdatePaymentMethod: (methodId: string, updatedMethod: PaymentMethod) => void;
}

export default function EditPaymentMethodModal({ paymentMethod, onUpdatePaymentMethod }: EditPaymentMethodModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking',
    billingAddress: '',
    city: '',
    state: '',
    zipCode: '',
    isDefault: false
  });

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && paymentMethod) {
      // For demo purposes, we'll populate with sample data
      // In production, you'd fetch the actual payment method details securely
      setFormData({
        cardNumber: paymentMethod.type === 'credit_card' ? '**** **** **** 1234' : '',
        expiryDate: paymentMethod.expiry || '',
        cvv: '',
        cardholderName: 'John Doe',
        routingNumber: paymentMethod.type === 'bank_account' ? '*****6789' : '',
        accountNumber: paymentMethod.type === 'bank_account' ? '****5678' : '',
        accountType: paymentMethod.accountType || 'checking',
        billingAddress: '123 Main Street',
        city: 'Anytown',
        state: 'ST',
        zipCode: '12345',
        isDefault: paymentMethod.isDefault
      });
    }
  }, [isOpen, paymentMethod]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateForm = () => {
    if (paymentMethod.type === 'credit_card') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
        return 'Please enter a valid card number';
      }
      if (!formData.expiryDate || formData.expiryDate.length < 5) {
        return 'Please enter a valid expiry date (MM/YY)';
      }
      if (!formData.cvv || formData.cvv.length < 3) {
        return 'Please enter a valid CVV';
      }
      if (!formData.cardholderName) {
        return 'Please enter the cardholder name';
      }
    } else {
      if (!formData.routingNumber || formData.routingNumber.length !== 9) {
        return 'Please enter a valid 9-digit routing number';
      }
      if (!formData.accountNumber || formData.accountNumber.length < 4) {
        return 'Please enter a valid account number';
      }
      if (!formData.accountType) {
        return 'Please select an account type';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call to update payment method
      await new Promise(resolve => setTimeout(resolve, 2000));

      const updatedMethod: PaymentMethod = {
        ...paymentMethod,
        name: paymentMethod.type === 'credit_card' 
          ? `${getCardType(formData.cardNumber)} ending in ${formData.cardNumber.slice(-4)}`
          : `${formData.accountType.charAt(0).toUpperCase() + formData.accountType.slice(1)} Account ending in ${formData.accountNumber.slice(-4)}`,
        expiry: paymentMethod.type === 'credit_card' ? formData.expiryDate : undefined,
        accountType: paymentMethod.type === 'bank_account' ? formData.accountType : undefined,
        isDefault: formData.isDefault
      };

      onUpdatePaymentMethod(paymentMethod.id, updatedMethod);
      setMessage('Payment method updated successfully!');
      
      // Close modal after success
      setTimeout(() => {
        setIsOpen(false);
        setMessage('');
      }, 1500);

    } catch (error) {
      setMessage('Failed to update payment method. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Card';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Edit payment method">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Edit className="mr-2 h-5 w-5" />
            Edit Payment Method
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Payment Method Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Current Payment Method</h4>
            <div className="flex items-center space-x-3">
              <CreditCard className={`h-6 w-6 ${paymentMethod.type === 'credit_card' ? 'text-blue-500' : 'text-green-500'}`} />
              <div>
                <p className="font-medium">{paymentMethod.name}</p>
                {paymentMethod.expiry && <p className="text-sm text-gray-600">Expires {paymentMethod.expiry}</p>}
                {paymentMethod.accountType && <p className="text-sm text-gray-600">{paymentMethod.accountType} Account</p>}
                {paymentMethod.isDefault && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Default</span>}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {paymentMethod.type === 'credit_card' ? (
              <>
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the full card number to update</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    value={formData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={formData.routingNumber}
                    onChange={(e) => handleInputChange('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="123456789"
                    maxLength={9}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the full 9-digit routing number</p>
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                    placeholder="1234567890"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter the full account number</p>
                </div>
                <div>
                  <Label htmlFor="accountType">Account Type</Label>
                  <select
                    id="accountType"
                    value={formData.accountType}
                    onChange={(e) => handleInputChange('accountType', e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </>
            )}

            {/* Billing Address */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Billing Address</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="billingAddress">Street Address</Label>
                  <Input
                    id="billingAddress"
                    value={formData.billingAddress}
                    onChange={(e) => handleInputChange('billingAddress', e.target.value)}
                    placeholder="123 Main Street"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Anytown"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      placeholder="ST"
                      maxLength={2}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                      placeholder="12345"
                      maxLength={5}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Default Payment Method */}
            <div className="border-t pt-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => handleInputChange('isDefault', e.target.checked.toString())}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="isDefault" className="text-sm font-medium">
                  Set as default payment method
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This payment method will be used by default for future payments
              </p>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Secure Payment Method Update</p>
                  <p>Your updated payment information is encrypted and securely processed. We never store your full card details on our servers.</p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg flex items-center ${
                message.includes('successfully') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.includes('successfully') ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                {message}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Payment Method
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
