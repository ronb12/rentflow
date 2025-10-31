'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Plus, Search, Filter, Download, Eye, Trash2 } from 'lucide-react';
import { DocumentUploadModal } from '@/components/modals/document-upload-modal';
import { DocumentCreateModal } from '@/components/modals/document-create-modal';
import { DocumentSignModal } from '@/components/modals/document-sign-modal';
import { DocumentViewModal } from '@/components/modals/document-view-modal';
import { resolveClientRole } from '@/lib/auth';

export interface Document {
  id: string;
  name: string;
  type: 'lease' | 'contract' | 'invoice' | 'receipt' | 'notice' | 'other';
  category: 'legal' | 'financial' | 'maintenance' | 'communication' | 'other';
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  tenantId?: string;
  propertyId?: string;
  status: 'draft' | 'pending_signature' | 'signed' | 'archived';
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  signedBy?: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [userRole, setUserRole] = useState<'manager' | 'renter' | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    setUserRole(resolveClientRole());
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchTerm, filterType, filterStatus]);

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      if (!response.ok) {
        throw new Error(`Failed to load documents: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
    }

    setFilteredDocuments(filtered);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents?id=${documentId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.status} ${response.statusText}`);
      }
      loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const getCurrentTenantId = (): string => {
    if (typeof window === 'undefined') return 'tenant_1';
    const email = localStorage.getItem('userEmail') || '';
    return email === 'renter@example.com' ? 'tenant_1' : 'tenant_cli';
  };

  const notifyManager = async (message: string) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: getCurrentTenantId(),
          message,
          status: 'sent',
          senderRole: userRole === 'manager' ? 'manager' : 'renter',
        })
      });
    } catch (e) {
      // best-effort notification
    }
  };

  const handleSignDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowSignModal(true);
  };

  const handleViewDocument = async (doc: Document) => {
    setSelectedDocument(doc);
    setShowViewModal(true);
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      if (doc.fileName) {
        // If document has a file, download it
        const response = await fetch(`/api/documents/${doc.id}/file`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = doc.fileName || `document-${doc.id}`;
          window.document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          window.document.body.removeChild(a);
        } else {
          alert('Document file not found. Please upload the document file.');
        }
      } else {
        // Generate a basic document info file
        const content = `Document Information\n\n` +
          `Name: ${doc.name}\n` +
          `Type: ${doc.type}\n` +
          `Category: ${doc.category}\n` +
          `Status: ${doc.status}\n` +
          `Created: ${new Date(doc.createdAt).toLocaleDateString()}\n` +
          `Updated: ${new Date(doc.updatedAt).toLocaleDateString()}\n`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${doc.name || 'document'}.txt`;
        window.document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        window.document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending_signature': return 'bg-yellow-100 text-yellow-800';
      case 'signed': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lease': return '📄';
      case 'contract': return '📋';
      case 'invoice': return '🧾';
      case 'receipt': return '📜';
      case 'notice': return '📢';
      default: return '📁';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Documents</h1>
        <div className="flex gap-2">
          {userRole === 'manager' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Document
            </Button>
          )}
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Types</SelectItem>
                <SelectItem value="lease" className="text-gray-900 dark:text-gray-100">Lease</SelectItem>
                <SelectItem value="contract" className="text-gray-900 dark:text-gray-100">Contract</SelectItem>
                <SelectItem value="invoice" className="text-gray-900 dark:text-gray-100">Invoice</SelectItem>
                <SelectItem value="receipt" className="text-gray-900 dark:text-gray-100">Receipt</SelectItem>
                <SelectItem value="notice" className="text-gray-900 dark:text-gray-100">Notice</SelectItem>
                <SelectItem value="other" className="text-gray-900 dark:text-gray-100">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all" className="text-gray-900 dark:text-gray-100">All Status</SelectItem>
                <SelectItem value="draft" className="text-gray-900 dark:text-gray-100">Draft</SelectItem>
                <SelectItem value="pending_signature" className="text-gray-900 dark:text-gray-100">Pending Signature</SelectItem>
                <SelectItem value="signed" className="text-gray-900 dark:text-gray-100">Signed</SelectItem>
                <SelectItem value="archived" className="text-gray-900 dark:text-gray-100">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents List (Table) */}
      <Card>
        <CardContent className="pt-6">
          {filteredDocuments.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No documents found</p>
              {userRole === 'manager' && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Document
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 pr-4">Created</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocuments.map((document) => (
                    <tr key={document.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(document.type)}</span>
                        {document.name}
                      </td>
                      <td className="py-2 pr-4 capitalize">{document.type}</td>
                      <td className="py-2 pr-4 capitalize">{document.category}</td>
                      <td className="py-2 pr-4">{document.fileSize ? formatFileSize(document.fileSize) : '-'}</td>
                      <td className="py-2 pr-4">{new Date(document.createdAt).toLocaleDateString()}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {document.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" onClick={() => handleViewDocument(document)} title="View">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(document)} title="Download">
                            <Download className="h-4 w-4" />
                          </Button>
                          {(['pending_signature','draft'].includes(document.status) || !document.signedAt) && (
                            <Button size="sm" onClick={() => handleSignDocument(document)} title="Sign">Sign</Button>
                          )}
                          {userRole === 'manager' && (
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteDocument(document.id)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={async () => { await loadDocuments(); await notifyManager('A document was uploaded.'); }}
      />
      
      <DocumentCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadDocuments}
      />
      
      <DocumentSignModal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        document={selectedDocument}
        onSuccess={async () => { await loadDocuments(); await notifyManager('A document was signed.'); }}
      />

      <DocumentViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        document={selectedDocument as any}
      />
    </div>
  );
}
