export type DocumentSignature = {
  role: 'renter' | 'manager' | 'other';
  name: string;
  email?: string;
  imageData: string; // data URL image
  signedAt: string;
};

export type DocumentData = {
  id: string;
  name: string;
  type: 'lease' | 'contract' | 'invoice' | 'receipt' | 'notice' | 'other';
  category: 'legal' | 'financial' | 'maintenance' | 'communication' | 'other';
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  tenantId?: string;
  propertyId?: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'archived';
  createdAt: string;
  updatedAt: string;
  // Legacy single-signature fields (kept for backwards compatibility)
  signedAt?: string;
  signedBy?: string;
  signerEmail?: string;
  signatureData?: string;
  // New multi-signature support
  signatures?: DocumentSignature[];
  templateData?: any;
};

type DocStore = {
  documents: DocumentData[];
};

// Simple in-memory store shared across routes
export const docStore: DocStore = {
  documents: [],
};


