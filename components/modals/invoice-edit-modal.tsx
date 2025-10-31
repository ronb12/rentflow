"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface InvoiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
  onSave: (updatedInvoice: any) => void;
}

export function InvoiceEditModal({ isOpen, onClose, invoice, onSave }: InvoiceEditModalProps) {
  const [form, setForm] = useState({
    id: "",
    tenantName: "",
    property: "",
    amount: "",
    dueDate: "",
    status: "pending",
    description: "",
  });

  useEffect(() => {
    if (invoice) {
      setForm({
        id: invoice.id || "",
        tenantName: invoice.tenantName || "",
        property: invoice.property || "",
        amount: String(invoice.amount ?? ""),
        dueDate: invoice.dueDate || "",
        status: invoice.status || "pending",
        description: invoice.description || "",
      });
    }
  }, [invoice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...invoice,
      ...form,
      amount: parseFloat(form.amount || "0"),
    };
    onSave(updated);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Invoice{form.id ? ` - ${form.id}` : ""}</DialogTitle>
        </DialogHeader>
        {!invoice ? (
          <div className="py-8 text-center text-muted-foreground">No invoice selected.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tenant Name</Label>
                <Input value={form.tenantName} onChange={(e) => setForm({ ...form, tenantName: e.target.value })} />
              </div>
              <div>
                <Label>Property</Label>
                <Input value={form.property} onChange={(e) => setForm({ ...form, property: e.target.value })} />
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <select className="w-full border rounded-md px-2 py-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
