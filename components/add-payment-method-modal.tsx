"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, CreditCard, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddPaymentMethodModalProps {
  onAddPaymentMethod: (method: any) => void;
}

export default function AddPaymentMethodModal({ onAddPaymentMethod }: AddPaymentMethodModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'credit_card' | 'bank_account'>('credit_card');
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentType('credit_card');
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        routingNumber: '',
        accountNumber: '',
        accountType: 'checking',
        isDefault: false
      });
    }
  }, [isOpen]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    routingNumber: '',
    accountNumber: '',
    accountType: 'checking',
    isDefault: false
  });

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

  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Card';
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
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newMethod = {
        id: `${paymentType}_${Date.now()}`,
        type: paymentType,
        name: paymentType === 'credit_card' 
          ? `${getCardType(formData.cardNumber)} ending in ${formData.cardNumber.slice(-4)}`
          : `${formData.accountType.charAt(0).toUpperCase() + formData.accountType.slice(1)} Account ending in ${formData.accountNumber.slice(-4)}`,
        expiry: paymentType === 'credit_card' ? formData.expiryDate : undefined,
        accountType: paymentType === 'bank_account' ? formData.accountType : undefined,
        isDefault: formData.isDefault
      };

      onAddPaymentMethod(newMethod);
      
      // Reset form
      setFormData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        routingNumber: '',
        accountNumber: '',
        accountType: 'checking',
        isDefault: false
      });
      
      setIsOpen(false);
      alert('Payment method added successfully!');
    } catch (error) {
      alert('Failed to add payment method. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <CreditCard className="mr-2 h-4 w-4" />
          Add New Payment Method
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Payment Method</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Type Selection */}
          <div>
            <Label htmlFor="paymentType">Payment Method Type</Label>
            <Select value={paymentType} onValueChange={(value) => setPaymentType(value as 'credit_card' | 'bank_account')}>
              <SelectTrigger id="paymentType">
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="credit_card" className="text-gray-900 dark:text-gray-100">Credit/Debit Card</SelectItem>
                <SelectItem value="bank_account" className="text-gray-900 dark:text-gray-100">Bank Account</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentType === 'credit_card' ? (
            <>
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={formData.cardNumber}
                  onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: formatExpiryDate(e.target.value) })}
                    placeholder="MM/YY"
                    maxLength={5}
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input
                  id="cardholderName"
                  value={formData.cardholderName}
                  onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                  placeholder="John Doe"
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
                  onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9) })}
                  placeholder="123456789"
                  maxLength={9}
                />
              </div>
              
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                  placeholder="1234567890"
                />
              </div>
              
              <div>
                <Label htmlFor="accountType">Account Type</Label>
                <Select value={formData.accountType} onValueChange={(value) => setFormData({ ...formData, accountType: value })}>
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent className="z-[100] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <SelectItem value="checking" className="text-gray-900 dark:text-gray-100">Checking</SelectItem>
                    <SelectItem value="savings" className="text-gray-900 dark:text-gray-100">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Default Payment Method */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <Label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">
              Set as default payment method
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Payment Method'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

