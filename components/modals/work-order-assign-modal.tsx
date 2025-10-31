"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkOrderAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: any;
  onSave: (assignee: string) => void;
}

export function WorkOrderAssignModal({ isOpen, onClose, workOrder, onSave }: WorkOrderAssignModalProps) {
  const [assignee, setAssignee] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(assignee);
    setAssignee("");
    onClose();
  };

  if (!workOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Work Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="workOrderTitle">Work Order</Label>
            <Input
              id="workOrderTitle"
              value={workOrder.title}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="assignee">Assign To</Label>
            <Input
              id="assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="Enter technician name"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!assignee.trim()}>
              Update Assignment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

