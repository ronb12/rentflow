"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Edit, Calendar, DollarSign, Star, Settings, CheckCircle2 } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  serviceType: string | null;
  hourlyRate: number;
  rating: number | null;
  isActive: boolean;
}

interface Assignment {
  id: string;
  vendorId: string;
  vendorName: string;
  workOrderId: string | null;
  scheduledDate: number | null;
  estimatedCost: number;
  actualCost: number;
  status: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<"vendors" | "assignments" | "sla">("vendors");

  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    serviceType: "",
    hourlyRate: 0,
    rating: null as number | null,
  });

  useEffect(() => {
    fetchVendors();
    fetchAssignments();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vendors?isActive=true");
      if (!response.ok) throw new Error("Failed to fetch vendors");
      
      const data = await response.json();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/vendors/assignments");
      if (!response.ok) throw new Error("Failed to fetch assignments");
      
      const data = await response.json();
      setAssignments(data.assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        alert("Vendor name is required");
        return;
      }

      const url = selectedVendor ? `/api/vendors/${selectedVendor.id}` : "/api/vendors";
      const method = selectedVendor ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save vendor");

      await fetchVendors();
      setShowEditor(false);
      setSelectedVendor(null);
      setFormData({ name: "", contactName: "", email: "", phone: "", serviceType: "", hourlyRate: 0, rating: null });
    } catch (error) {
      console.error("Error saving vendor:", error);
      alert("Failed to save vendor. Please try again.");
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      contactName: vendor.contactName || "",
      email: vendor.email || "",
      phone: vendor.phone || "",
      serviceType: vendor.serviceType || "",
      hourlyRate: vendor.hourlyRate,
      rating: vendor.rating,
    });
    setShowEditor(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Not scheduled";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <Button onClick={() => {
          setShowEditor(true);
          setSelectedVendor(null);
          setFormData({ name: "", contactName: "", email: "", phone: "", serviceType: "", hourlyRate: 0, rating: null });
        }}>
          <Plus className="mr-2 h-4 w-4" />
          New Vendor
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === "vendors" ? "default" : "ghost"}
          onClick={() => setActiveTab("vendors")}
        >
          <Users className="mr-2 h-4 w-4" />
          Vendors
        </Button>
        <Button
          variant={activeTab === "assignments" ? "default" : "ghost"}
          onClick={() => setActiveTab("assignments")}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Assignments
        </Button>
        <Button
          variant={activeTab === "sla" ? "default" : "ghost"}
          onClick={() => setActiveTab("sla")}
        >
          <Settings className="mr-2 h-4 w-4" />
          SLA Rules
        </Button>
      </div>

      {/* Vendor Editor */}
      {showEditor && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedVendor ? "Edit Vendor" : "New Vendor"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Vendor Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ABC Plumbing"
                />
              </div>

              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData({ ...formData, serviceType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="general">General Maintenance</SelectItem>
                    <SelectItem value="landscaping">Landscaping</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Contact Name</Label>
                <Input
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="vendor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label>Hourly Rate ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                  placeholder="75.00"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave}>Save Vendor</Button>
              <Button variant="outline" onClick={() => {
                setShowEditor(false);
                setSelectedVendor(null);
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vendors List */}
      {activeTab === "vendors" && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <div className="col-span-full text-center py-8">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              No vendors found. Add your first vendor to get started.
            </div>
          ) : (
            vendors.map((vendor) => (
              <Card key={vendor.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{vendor.name}</span>
                    {vendor.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{vendor.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm">
                    <div className="font-medium">{vendor.serviceType || "General"}</div>
                    {vendor.contactName && <div className="text-muted-foreground">{vendor.contactName}</div>}
                    {vendor.email && <div className="text-muted-foreground">{vendor.email}</div>}
                    {vendor.phone && <div className="text-muted-foreground">{vendor.phone}</div>}
                    {vendor.hourlyRate > 0 && (
                      <div className="text-muted-foreground mt-2">
                        {formatCurrency(vendor.hourlyRate)}/hour
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => handleEdit(vendor)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Assignments List */}
      {activeTab === "assignments" && (
        <Card>
          <CardHeader>
            <CardTitle>Vendor Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No assignments found.
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <Card key={assignment.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="font-medium">{assignment.vendorName}</div>
                        <div className="text-sm text-muted-foreground">
                          Scheduled: {formatDate(assignment.scheduledDate)}
                        </div>
                        <div className="text-sm">
                          Estimated: {formatCurrency(assignment.estimatedCost / 100)}
                          {assignment.actualCost > 0 && (
                            <span className="ml-4">
                              Actual: {formatCurrency(assignment.actualCost / 100)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        assignment.status === "completed" ? "bg-green-100 text-green-800" :
                        assignment.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {assignment.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SLA Rules */}
      {activeTab === "sla" && (
        <Card>
          <CardHeader>
            <CardTitle>SLA (Service Level Agreement) Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              SLA rules management coming soon. Configure target response times for different service types and priorities.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

