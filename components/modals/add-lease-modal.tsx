"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface LeaseFormData {
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  deposit: number;
  petDeposit: number;
  lateFee: number;
  status: string;
  leaseType: string;
  organizationId: string;
}

interface AddLeaseModalProps {
  onLeaseAdded: () => void;
}

export function AddLeaseModal({ onLeaseAdded }: AddLeaseModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tenants, setTenants] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [formData, setFormData] = useState<LeaseFormData>({
    tenantId: "",
    propertyId: "",
    startDate: "",
    endDate: "",
    monthlyRent: 0,
    deposit: 0,
    petDeposit: 0,
    lateFee: 0,
    status: "active",
    leaseType: "standard",
    organizationId: "org_1",
  });

  const loadTenants = async () => {
    try {
      const res = await fetch("/api/tenants");
      const data = await res.json();
      setTenants(data);
    } catch (error) {
      console.error("Failed to load tenants:", error);
    }
  };

  const loadProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      setProperties(data);
    } catch (error) {
      console.error("Failed to load properties:", error);
    }
  };

  useEffect(() => {
    if (open) {
      const loadData = async () => {
        await Promise.all([loadTenants(), loadProperties()]);
      };
      loadData();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/leases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({
          tenantId: "",
          propertyId: "",
          startDate: "",
          endDate: "",
          monthlyRent: 0,
          deposit: 0,
          petDeposit: 0,
          lateFee: 0,
          status: "active",
          leaseType: "standard",
          organizationId: "org_1",
        });
        setOpen(false);
        onLeaseAdded();
      } else {
        console.error("Failed to create lease");
      }
    } catch (error) {
      console.error("Error creating lease:", error);
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
          <DialogTitle>Add New Lease Agreement</DialogTitle>
          <DialogDescription>
            Create a comprehensive lease agreement with all necessary terms and conditions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tenantId" className="text-right">
                Tenant *
              </Label>
              <Select value={formData.tenantId} onValueChange={(value) => setFormData({ ...formData, tenantId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.first_name} {tenant.last_name} - {tenant.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="propertyId" className="text-right">
                Property *
              </Label>
              <Select value={formData.propertyId} onValueChange={(value) => setFormData({ ...formData, propertyId: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.address}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leaseType" className="text-right">
                Lease Type *
              </Label>
              <Select value={formData.leaseType} onValueChange={(value) => setFormData({ ...formData, leaseType: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select lease type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Lease (12 months)</SelectItem>
                  <SelectItem value="month-to-month">Month-to-Month</SelectItem>
                  <SelectItem value="short-term">Short-term (3-6 months)</SelectItem>
                  <SelectItem value="long-term">Long-term (18+ months)</SelectItem>
                  <SelectItem value="commercial">Commercial Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Lease Start Date *
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                Lease End Date *
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthlyRent" className="text-right">
                Monthly Rent *
              </Label>
              <Input
                id="monthlyRent"
                name="monthlyRent"
                type="number"
                min="0"
                step="0.01"
                value={formData.monthlyRent}
                onChange={(e) => setFormData({ ...formData, monthlyRent: Number(e.target.value) })}
                className="col-span-3"
                placeholder="1200.00"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deposit" className="text-right">
                Security Deposit *
              </Label>
              <Input
                id="deposit"
                name="deposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
                className="col-span-3"
                placeholder="1200.00"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="petDeposit" className="text-right">
                Pet Deposit
              </Label>
              <Input
                id="petDeposit"
                name="petDeposit"
                type="number"
                min="0"
                step="0.01"
                value={formData.petDeposit}
                onChange={(e) => setFormData({ ...formData, petDeposit: Number(e.target.value) })}
                className="col-span-3"
                placeholder="300.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lateFee" className="text-right">
                Late Fee *
              </Label>
              <Input
                id="lateFee"
                name="lateFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.lateFee}
                onChange={(e) => setFormData({ ...formData, lateFee: Number(e.target.value) })}
                className="col-span-3"
                placeholder="50.00"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Lease Status *
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                  <SelectItem value="renewed">Renewed</SelectItem>
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
