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

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface InvoiceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
  onSave: (updatedInvoice: any) => void;
}

export function InvoiceEditModal({ isOpen, onClose, invoice, onSave }: InvoiceEditModalProps) {
  const [formData, setFormData] = useState({
    tenantName: '',
    property: '',
    amount: '',
    dueDate: '',
    description: '',
    status: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setFormData({
        tenantName: invoice.tenantName || '',
        property: invoice.property || '',
        amount: invoice.amount?.toString() || '',
        dueDate: invoice.dueDate || '',
        description: invoice.description || '',
        status: invoice.status || 'pending'
      });
    }
  }, [invoice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updatedInvoice = {
        ...invoice,
        tenantName: formData.tenantName,
        property: formData.property,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        description: formData.description,
        status: formData.status
      };

      onSave(updatedInvoice);
      onClose();
    } catch (error) {
      console.error('Error updating invoice:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Invoice: {invoice.id}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-tenantName">Tenant Name</Label>
              <Input
                id="edit-tenantName"
                value={formData.tenantName}
                onChange={(e) => setFormData(prev => ({ ...prev, tenantName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-property">Property Address</Label>
              <Input
                id="edit-property"
                value={formData.property}
                onChange={(e) => setFormData(prev => ({ ...prev, property: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input
                id="edit-dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}





