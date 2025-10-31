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
