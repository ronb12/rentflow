"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface AddPropertyModalProps {
  onPropertyAdded: () => void;
}

export function AddPropertyModal({ onPropertyAdded }: AddPropertyModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "apartment",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    rent: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseFloat(formData.bathrooms),
          squareFeet: parseInt(formData.squareFeet),
          rent: parseFloat(formData.rent),
        }),
      });

      if (response.ok) {
        setFormData({
          name: "",
          address: "",
          type: "apartment",
          bedrooms: "",
          bathrooms: "",
          squareFeet: "",
          rent: "",
        });
        setOpen(false);
        onPropertyAdded();
        alert("Property added successfully!");
      } else {
        alert("Failed to add property. Please try again.");
      }
    } catch (error) {
      console.error("Error adding property:", error);
      alert("Error adding property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          <DialogDescription>
            Add a new property to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Property Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="col-span-3"
                placeholder="Sunset Apartments Unit 3B"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address *
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="col-span-3"
                placeholder="123 Main Street, City, State 12345"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type *
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectItem value="apartment" className="text-gray-900 dark:text-gray-100">Apartment</SelectItem>
                  <SelectItem value="house" className="text-gray-900 dark:text-gray-100">House</SelectItem>
                  <SelectItem value="condo" className="text-gray-900 dark:text-gray-100">Condo</SelectItem>
                  <SelectItem value="townhouse" className="text-gray-900 dark:text-gray-100">Townhouse</SelectItem>
                  <SelectItem value="commercial" className="text-gray-900 dark:text-gray-100">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bedrooms" className="text-right">
                Bedrooms *
              </Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="col-span-3"
                placeholder="2"
                min="0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bathrooms" className="text-right">
                Bathrooms *
              </Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="col-span-3"
                placeholder="1.5"
                min="0"
                step="0.5"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="squareFeet" className="text-right">
                Square Feet
              </Label>
              <Input
                id="squareFeet"
                type="number"
                value={formData.squareFeet}
                onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })}
                className="col-span-3"
                placeholder="1200"
                min="0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rent" className="text-right">
                Monthly Rent *
              </Label>
              <Input
                id="rent"
                type="number"
                value={formData.rent}
                onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                className="col-span-3"
                placeholder="1200"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

