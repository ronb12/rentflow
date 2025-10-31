"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface InvoiceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
}

export function InvoiceViewModal({ isOpen, onClose, invoice }: InvoiceViewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details{invoice?.id ? ` - ${invoice.id}` : ""}</DialogTitle>
        </DialogHeader>
        {!invoice ? (
          <div className="py-8 text-center text-muted-foreground">No invoice selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Invoice ID</div>
                <div className="font-medium">{invoice.id}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Tenant</div>
                <div className="font-medium">{invoice.tenantName}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Property</div>
                <div className="font-medium">{invoice.property}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Amount</div>
                <div className="font-medium">${Number(invoice.amount || 0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Due Date</div>
                <div className="font-medium">{invoice.dueDate}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Status</div>
                <div className="font-medium capitalize">{invoice.status}</div>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm">Description</div>
              <div className="mt-1 whitespace-pre-wrap">{invoice.description || "—"}</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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





