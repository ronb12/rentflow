"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkOrderScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrder: any;
  onSave: (dueDate: string) => void;
}

export function WorkOrderScheduleModal({ isOpen, onClose, workOrder, onSave }: WorkOrderScheduleModalProps) {
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(dueDate);
    setDueDate("");
    onClose();
  };

  if (!workOrder) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Work Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="workOrderTitleSchedule">Work Order</Label>
            <Input
              id="workOrderTitleSchedule"
              value={workOrder.title}
              disabled
              className="bg-gray-50"
            />
          </div>
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!dueDate}>
              Update Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

