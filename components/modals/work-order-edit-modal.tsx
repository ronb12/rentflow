"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkOrderEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: any;
  onSave: (updatedWorkOrder: any) => void;
}

export function WorkOrderEditModal({ isOpen, onClose, workOrder, onSave }: WorkOrderEditModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tenantName: "",
    property: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
    estimatedCost: ""
  });

  useEffect(() => {
    if (workOrder) {
      setFormData({
        title: workOrder.title || "",
        description: workOrder.description || "",
        tenantName: workOrder.tenantName || "",
        property: workOrder.property || "",
        priority: workOrder.priority || "medium",
        assignedTo: workOrder.assignedTo || "",
        dueDate: workOrder.dueDate || "",
        estimatedCost: workOrder.estimatedCost?.toString() || ""
      });
    }
  }, [workOrder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedWorkOrder = {
      ...workOrder,
      title: formData.title,
      description: formData.description,
      tenantName: formData.tenantName,
      property: formData.property,
      priority: formData.priority,
      assignedTo: formData.assignedTo,
      dueDate: formData.dueDate,
      estimatedCost: parseFloat(formData.estimatedCost)
    };
    onSave(updatedWorkOrder);
    onClose();
  };

  if (!workOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Work Order: {workOrder.id}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="editTitle">Work Order Title</Label>
              <Input
                id="editTitle"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter work order title"
                required
              />
            </div>
            <div>
              <Label htmlFor="editPriority">Priority</Label>
              <select
                id="editPriority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <Label htmlFor="editTenantName">Tenant Name</Label>
              <Input
                id="editTenantName"
                value={formData.tenantName}
                onChange={(e) => setFormData(prev => ({ ...prev, tenantName: e.target.value }))}
                placeholder="Enter tenant name"
                required
              />
            </div>
            <div>
              <Label htmlFor="editProperty">Property Address</Label>
              <Input
                id="editProperty"
                value={formData.property}
                onChange={(e) => setFormData(prev => ({ ...prev, property: e.target.value }))}
                placeholder="Enter property address"
                required
              />
            </div>
            <div>
              <Label htmlFor="editAssignedTo">Assign To</Label>
              <Input
                id="editAssignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Enter technician name"
                required
              />
            </div>
            <div>
              <Label htmlFor="editDueDate">Due Date</Label>
              <Input
                id="editDueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="editEstimatedCost">Estimated Cost</Label>
              <Input
                id="editEstimatedCost"
                type="number"
                value={formData.estimatedCost}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="editDescription">Description</Label>
            <textarea
              id="editDescription"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter detailed description of the work needed"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Update Work Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

