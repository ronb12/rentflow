'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, X } from 'lucide-react';

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
}

export function InvoiceViewModal({ isOpen, onClose, invoice }: InvoiceViewModalProps) {
  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Invoice Details: {invoice.id}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-gray-600">Invoice ID</Label>
              <p className="text-lg font-medium">{invoice.id}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-600">Status</Label>
              <p className={`text-lg font-medium ${
                invoice.status === 'paid' ? 'text-green-600' :
                invoice.status === 'pending' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-600">Tenant Name</Label>
              <p className="text-lg">{invoice.tenantName}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-600">Property</Label>
              <p className="text-lg">{invoice.property}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-600">Amount</Label>
              <p className="text-lg font-semibold">${invoice.amount.toLocaleString()}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-600">Due Date</Label>
              <p className="text-lg">{invoice.dueDate}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold text-gray-600">Created Date</Label>
              <p className="text-lg">{invoice.createdDate}</p>
            </div>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-600">Description</Label>
            <p className="text-lg mt-1">{invoice.description}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

