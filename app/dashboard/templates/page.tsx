"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Plus, Edit, History, Eye, Save, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Template {
  id: string;
  name: string;
  category: string | null;
  version: number;
  templateContent: string;
  mergeFields: Array<{ name: string; label: string; type: string; defaultValue?: string }>;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

interface TemplateVersion {
  id: string;
  name: string;
  version: number;
  createdAt: number;
  isActive: boolean;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [versions, setVersions] = useState<TemplateVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionsError, setVersionsError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    templateContent: "",
    mergeFields: [] as Array<{ name: string; label: string; type: string; defaultValue?: string }>,
  });

  const [mergeFieldValues, setMergeFieldValues] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/templates");
      if (!response.ok) throw new Error("Failed to fetch templates");
      
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async (templateName: string) => {
    try {
      setVersionsLoading(true);
      setVersionsError(null);
      setShowVersions(true);
      const response = await fetch(`/api/templates/versions/${encodeURIComponent(templateName)}`, { cache: 'no-store' });
      if (!response.ok) throw new Error("Failed to fetch versions");
      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error: any) {
      console.error("Error fetching versions:", error);
      setVersionsError(error?.message || 'Failed to fetch versions');
      setVersions([]);
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleSave = async (createNewVersion = false) => {
    try {
      if (!formData.name || !formData.templateContent) {
        alert("Name and template content are required");
        return;
      }

      const payload = {
        ...formData,
        createNewVersion,
      };

      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save template");

      await fetchTemplates();
      setShowEditor(false);
      setFormData({ name: "", category: "", templateContent: "", mergeFields: [] });
    } catch (error) {
      console.error("Error saving template:", error);
      alert("Failed to save template. Please try again.");
    }
  };

  const handlePreview = async (template: Template) => {
    try {
      // Extract merge field values from template
      const fieldValues: Record<string, string> = {};
      template.mergeFields.forEach((field) => {
        fieldValues[field.name] = mergeFieldValues[field.name] || field.defaultValue || "";
      });

      const response = await fetch("/api/templates/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          mergeFieldValues: fieldValues,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate preview");

      const data = await response.json();
      setPreviewContent(data.preview);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
      alert("Failed to generate preview");
    }
  };

  const addMergeField = () => {
    setFormData({
      ...formData,
      mergeFields: [
        ...formData.mergeFields,
        { name: "", label: "", type: "text", defaultValue: "" },
      ],
    });
  };

  const updateMergeField = (index: number, field: Partial<typeof formData.mergeFields[0]>) => {
    const updated = [...formData.mergeFields];
    updated[index] = { ...updated[index], ...field };
    setFormData({ ...formData, mergeFields: updated });
  };

  const removeMergeField = (index: number) => {
    setFormData({
      ...formData,
      mergeFields: formData.mergeFields.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Template Library</h1>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Template Editor */}
      {showEditor && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTemplate ? "Edit Template" : "New Template"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Residential Lease Agreement"
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lease">Lease</SelectItem>
                    <SelectItem value="notice">Notice</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="checklist">Checklist</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Template Content (HTML allowed, use {"{"}{"{"}field_name{"}"}{"}"} for merge fields)
              </Label>
              <textarea
                className="w-full min-h-[300px] p-3 border rounded-md font-mono text-sm"
                value={formData.templateContent}
                onChange={(e) => setFormData({ ...formData, templateContent: e.target.value })}
                placeholder="<h1>Template Title</h1>&#10;<p>Hello {{tenant_name}}, your rent is {{rent_amount}} due on {{due_date}}.</p>"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Merge Fields</Label>
                <Button variant="outline" size="sm" onClick={addMergeField}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Field
                </Button>
              </div>
              {formData.mergeFields.map((field, index) => (
                <div key={index} className="flex gap-2 p-2 border rounded">
                  <Input
                    placeholder="Field name (e.g., tenant_name)"
                    value={field.name}
                    onChange={(e) => updateMergeField(index, { name: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Label"
                    value={field.label}
                    onChange={(e) => updateMergeField(index, { label: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMergeField(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button onClick={() => handleSave(false)}>
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              {selectedTemplate && (
                <Button variant="outline" onClick={() => handleSave(true)}>
                  Save as New Version
                </Button>
              )}
              <Button variant="outline" onClick={() => {
                setShowEditor(false);
                setSelectedTemplate(null);
                setFormData({ name: "", category: "", templateContent: "", mergeFields: [] });
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal (Manager) */}
      <Dialog open={showPreview} onOpenChange={(open) => setShowPreview(open)}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          <div
            className="prose max-w-none p-4 border rounded-md bg-white"
            dangerouslySetInnerHTML={{ __html: previewContent }}
          />
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setShowPreview(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Templates List - Compact Table */}
      {loading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No templates found. Create your first template to get started.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Name</th>
                <th className="text-left px-3 py-2 font-medium">Category</th>
                <th className="text-left px-3 py-2 font-medium">Version</th>
                <th className="text-left px-3 py-2 font-medium">Merge Fields</th>
                <th className="text-left px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template) => (
                <tr key={template.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{template.name}</td>
                  <td className="px-3 py-2 text-muted-foreground">{template.category || 'Uncategorized'}</td>
                  <td className="px-3 py-2">v{template.version}</td>
                  <td className="px-3 py-2">{template.mergeFields.length}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => handlePreview(template)}>
                        <Eye className="mr-1 h-3 w-3" /> Preview
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedTemplate(template); fetchVersions(template.name); }}>
                        <History className="mr-1 h-3 w-3" /> Versions
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Versions Modal */}
      <Dialog open={showVersions} onOpenChange={(open) => setShowVersions(open)}>
        <DialogContent className="max-w-xl w-[90vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Template Versions {selectedTemplate ? `- ${selectedTemplate.name}` : ''}</DialogTitle>
          </DialogHeader>
          {versionsLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading versions…</div>
          ) : versionsError ? (
            <div className="py-4 text-sm text-red-600">{versionsError}</div>
          ) : versions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No versions found.</div>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div key={version.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">Version {version.version}</div>
                    <div className="text-sm text-muted-foreground">Created: {new Date(version.createdAt).toLocaleDateString()}</div>
                  </div>
                  {version.isActive && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-4">
            <Button variant="outline" onClick={() => setShowVersions(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

