'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUploadModal({ isOpen, onClose, onSuccess }: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [tenantId, setTenantId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !name || !type || !category) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);

    try {
      // First create the document record
      const documentResponse = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type,
          category,
          tenantId: tenantId || undefined,
          propertyId: propertyId || undefined
        })
      });

      const document = await documentResponse.json();

      // Then upload the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentId', document.id);

      const uploadResponse = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (uploadResponse.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setName('');
    setType('');
    setCategory('');
    setTenantId('');
    setPropertyId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                className="hidden"
              />
              <label htmlFor="file" className="cursor-pointer">
                {file ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFile(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <div className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">
                      PDF, DOC, DOCX, JPG, PNG, TXT (max 10MB)
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Document Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Document Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
            />
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Document Type *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="lease" className="text-gray-900 dark:text-gray-100">Lease Agreement</SelectItem>
                <SelectItem value="contract" className="text-gray-900 dark:text-gray-100">Contract</SelectItem>
                <SelectItem value="invoice" className="text-gray-900 dark:text-gray-100">Invoice</SelectItem>
                <SelectItem value="receipt" className="text-gray-900 dark:text-gray-100">Receipt</SelectItem>
                <SelectItem value="notice" className="text-gray-900 dark:text-gray-100">Notice</SelectItem>
                <SelectItem value="other" className="text-gray-900 dark:text-gray-100">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="legal" className="text-gray-900 dark:text-gray-100">Legal</SelectItem>
                <SelectItem value="financial" className="text-gray-900 dark:text-gray-100">Financial</SelectItem>
                <SelectItem value="maintenance" className="text-gray-900 dark:text-gray-100">Maintenance</SelectItem>
                <SelectItem value="communication" className="text-gray-900 dark:text-gray-100">Communication</SelectItem>
                <SelectItem value="other" className="text-gray-900 dark:text-gray-100">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Optional Fields */}
          <div className="space-y-2">
            <Label htmlFor="tenantId">Tenant ID (Optional)</Label>
            <Input
              id="tenantId"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Enter tenant ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="propertyId">Property ID (Optional)</Label>
            <Input
              id="propertyId"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              placeholder="Enter property ID"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}






