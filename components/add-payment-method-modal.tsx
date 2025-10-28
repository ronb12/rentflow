"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_account';
  name: string;
  expiry?: string;
  accountType?: string;
  isDefault: boolean;
}

interface AddPaymentMethodModalProps {
  onAddPaymentMethod: (method: PaymentMethod) => void;
}

export default function AddPaymentMethodModal({ onAddPaymentMethod }: AddPaymentMethodModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'credit_card' | 'bank_account'>('credit_card');
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
    zipCode: ''
  });

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
    if (paymentType === 'credit_card') {
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
      // Simulate API call to add payment method
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: paymentType,
        name: paymentType === 'credit_card' 
          ? `${getCardType(formData.cardNumber)} ending in ${formData.cardNumber.slice(-4)}`
          : `${formData.accountType.charAt(0).toUpperCase() + formData.accountType.slice(1)} Account ending in ${formData.accountNumber.slice(-4)}`,
        expiry: paymentType === 'credit_card' ? formData.expiryDate : undefined,
        accountType: paymentType === 'bank_account' ? formData.accountType : undefined,
        isDefault: false
      };

      onAddPaymentMethod(newPaymentMethod);
      setMessage('Payment method added successfully!');
      
      // Reset form
      setFormData({
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
        zipCode: ''
      });

      // Close modal after success
      setTimeout(() => {
        setIsOpen(false);
        setMessage('');
      }, 1500);

    } catch (error) {
      setMessage('Failed to add payment method. Please try again.');
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
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <CreditCard className="mr-2 h-5 w-5" />
            Add New Payment Method
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Type Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Payment Method Type</Label>
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  paymentType === 'credit_card' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setPaymentType('credit_card')}
              >
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600">Visa, Mastercard, etc.</p>
                </CardContent>
              </Card>
              <Card 
                className={`cursor-pointer transition-all ${
                  paymentType === 'bank_account' 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setPaymentType('bank_account')}
              >
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Bank Account</p>
                  <p className="text-sm text-gray-600">ACH Transfer</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {paymentType === 'credit_card' ? (
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

            {/* Security Notice */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Secure Payment Processing</p>
                  <p>Your payment information is encrypted and securely processed. We never store your full card details on our servers.</p>
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
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Payment Method
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
