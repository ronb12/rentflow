export enum UserRole {
  OWNER = "owner",
  MANAGER = "manager",
  MAINTENANCE = "maintenance",
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: UserRole;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  type: "apartment" | "house" | "trailer_park";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  propertyId: string;
  unitNumber: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  rentAmount: number;
  isOccupied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lot {
  id: string;
  propertyId: string;
  lotNumber: string;
  lotSize?: string;
  hasUtilities: boolean;
  rentAmount: number;
  isOccupied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Home {
  id: string;
  lotId: string;
  ownerName: string;
  vin?: string;
  title?: string;
  make?: string;
  model?: string;
  year?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tenant {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lease {
  id: string;
  organizationId: string;
  tenantId: string;
  propertyId: string;
  unitId?: string;
  lotId?: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  deposit: number;
  petDeposit?: number;
  lateFeeAmount?: number;
  lateFeeGracePeriodDays?: number;
  status: "active" | "expired" | "terminated";
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  organizationId: string;
  leaseId: string;
  tenantId: string;
  invoiceNumber: string;
  dueDate: Date;
  amount: number;
  amountPaid: number;
  lateFees: number;
  status: "pending" | "paid" | "overdue" | "canceled";
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Inspection {
  id: string;
  organizationId: string;
  propertyId: string;
  unitId?: string;
  lotId?: string;
  inspectionType: "move_in" | "move_out" | "regular" | "maintenance";
  status: "queued" | "synced";
  date: Date;
  conditionNotes: string;
  photos: string[];
  signatures?: {
    tenant?: string;
    manager?: string;
  };
  syncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrder {
  id: string;
  organizationId: string;
  propertyId: string;
  unitId?: string;
  lotId?: string;
  tenantId?: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "emergency";
  status: "open" | "in_progress" | "completed" | "canceled";
  photos: string[];
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  organizationId: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  isRead: boolean;
  createdAt: Date;
}

