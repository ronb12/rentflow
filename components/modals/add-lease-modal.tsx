"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddLeaseModalProps {
  onLeaseAdded: () => void;
}

export function AddLeaseModal({ onLeaseAdded }: AddLeaseModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: "",
    tenantId: "",
    monthlyRent: "",
    startDate: "",
    endDate: "",
    status: "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          monthlyRent: parseFloat(formData.monthlyRent),
        }),
      });

      if (response.ok) {
        setFormData({
          propertyId: "",
          tenantId: "",
          monthlyRent: "",
          startDate: "",
          endDate: "",
          status: "active",
        });
        setOpen(false);
        onLeaseAdded();
        alert("Lease created successfully!");
      } else {
        alert("Failed to create lease. Please try again.");
      }
    } catch (error) {
      console.error("Error creating lease:", error);
      alert("Error creating lease. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Lease
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lease</DialogTitle>
          <DialogDescription>
            Create a new lease agreement between a property and tenant.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyId" className="text-right">
                Property ID *
              </Label>
              <Input
                id="propertyId"
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="col-span-3"
                placeholder="prop_1"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tenantId" className="text-right">
                Tenant ID *
              </Label>
              <Input
                id="tenantId"
                value={formData.tenantId}
                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                className="col-span-3"
                placeholder="tenant_1"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthlyRent" className="text-right">
                Monthly Rent *
              </Label>
              <Input
                id="monthlyRent"
                type="number"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: e.target.value })}
                className="col-span-3"
                placeholder="1200"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="active" className="text-gray-900 dark:text-gray-100">Active</SelectItem>
                  <SelectItem value="pending" className="text-gray-900 dark:text-gray-100">Pending</SelectItem>
                  <SelectItem value="expired" className="text-gray-900 dark:text-gray-100">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Lease"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

