"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as Dialog from "@radix-ui/react-dialog";

interface ScheduleTourModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ScheduleTourModal({ open, onOpenChange }: ScheduleTourModalProps) {
  const [tenantName, setTenantName] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [preferredDatetime, setPreferredDatetime] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const ts = preferredDatetime ? new Date(preferredDatetime).getTime() : Date.now();
      const res = await fetch("/api/tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantName, tenantEmail, phone, propertyId, preferredDatetime: ts, notes })
      });
      if (!res.ok) {
        throw new Error(`Failed to schedule tour: ${res.status}`);
      }
      setSuccess("Tour request submitted! We will contact you to confirm.");
      // Reset fields
      setTenantName("");
      setTenantEmail("");
      setPhone("");
      setPropertyId("");
      setPreferredDatetime("");
      setNotes("");
      setTimeout(() => onOpenChange(false), 1200);
    } catch (err: any) {
      setError(err.message || "Failed to submit tour request");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-1">Schedule a Property Tour</Dialog.Title>
          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            Tell us your preferred time. We’ll follow up to confirm.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tenantName">Full Name</Label>
              <Input id="tenantName" value={tenantName} onChange={(e) => setTenantName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="tenantEmail">Email</Label>
              <Input id="tenantEmail" type="email" value={tenantEmail} onChange={(e) => setTenantEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="propertyId">Property/Unit (optional)</Label>
              <Input id="propertyId" placeholder="Property ID or name" value={propertyId} onChange={(e) => setPropertyId(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="preferredDatetime">Preferred Date & Time</Label>
              <Input id="preferredDatetime" type="datetime-local" value={preferredDatetime} onChange={(e) => setPreferredDatetime(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea id="notes" className="w-full rounded-md border p-2 text-sm" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}

            <div className="flex justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline" disabled={submitting}>Cancel</Button>
              </Dialog.Close>
              <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
            </div>
          </form>

          <Dialog.Close asChild>
            <button aria-label="Close" className="absolute right-3 top-3 rounded p-1 text-gray-500 hover:bg-gray-100">✕</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


