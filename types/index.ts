export interface Inspection {
  id: string;
  organizationId?: string;
  propertyId: string;
  propertyName?: string;
  inspectorName?: string;
  inspectionType?: string;
  date: string;
  status: 'draft' | 'completed' | 'pending_review' | 'queued' | 'synced';
  notes?: string;
  conditionNotes?: string;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
  syncedAt?: Date;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
}

export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

