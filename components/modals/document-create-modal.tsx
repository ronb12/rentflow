'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: TemplateField[];
}

interface TemplateField {
  name: string;
  type: 'text' | 'date' | 'number' | 'signature' | 'checkbox';
  label: string;
  required: boolean;
  placeholder?: string;
}

interface DocumentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentCreateModal({ isOpen, onClose, onSuccess }: DocumentCreateModalProps) {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [tenantId, setTenantId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/documents/templates');
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template || null);
    setFormData({});
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    // Validate required fields
    const requiredFields = selectedTemplate.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/documents/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          data: formData,
          tenantId: tenantId || undefined,
          propertyId: propertyId || undefined
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        throw new Error('Failed to generate document');
      }
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate document');
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setSelectedTemplate(null);
    setFormData({});
    setTenantId('');
    setPropertyId('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const renderField = (field: TemplateField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData[field.name] || false}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              required={field.required}
            />
            <label className="text-sm">{field.label}</label>
          </div>
        );
      case 'signature':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500">
              Signature will be collected during signing process
            </div>
          </div>
        );
      default:
        return (
          <Input
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Document</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="space-y-2">
            <Label>Select Template</Label>
            <Select onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a document template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Description */}
          {selectedTemplate && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">{selectedTemplate.name}</h3>
              <p className="text-sm text-blue-700">{selectedTemplate.description}</p>
            </div>
          )}

          {/* Form Fields */}
          {selectedTemplate && (
            <div className="space-y-4">
              <h3 className="font-medium">Document Details</h3>
              {selectedTemplate.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

          {/* Optional Fields */}
          <div className="space-y-4">
            <h3 className="font-medium">Additional Information</h3>
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
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={!selectedTemplate || generating}
            >
              {generating ? 'Generating...' : 'Generate Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}





