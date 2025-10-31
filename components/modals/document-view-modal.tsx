'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ViewDoc = {
  id: string;
  name: string;
  type: string;
  status: string;
  signedAt?: string;
  signedBy?: string;
  signerEmail?: string;
  signatureData?: string; // data URL image
  fileName?: string;
  templateData?: { html?: string };
  signatures?: Array<{ role: string; name: string; email?: string; imageData: string; signedAt: string }>;
};

export function DocumentViewModal({ isOpen, onClose, document }: { isOpen: boolean; onClose: () => void; document: ViewDoc | null; }) {
  const [company, setCompany] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) setCompany(await res.json());
      } catch {}
    })();
  }, [isOpen]);

  if (!document) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Preview: {document.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Company Header */}
          {company && (company.company_name || company.logo_url) && (
            <div className="flex items-center gap-3 border rounded-md p-3 bg-white">
              {company.logo_url && <img src={company.logo_url} alt="Logo" className="h-10" />}
              <div>
                {company.company_name && <div className="font-semibold">{company.company_name}</div>}
                {(company.company_email || company.company_phone) && (
                  <div className="text-xs text-gray-500">
                    {company.company_email}{company.company_email && company.company_phone ? ' · ' : ''}{company.company_phone}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="text-sm text-gray-600">
            <p><strong>Type:</strong> {document.type}</p>
            <p><strong>Status:</strong> {document.status}</p>
            {document.signedAt && (
              <p><strong>Signed:</strong> {new Date(document.signedAt).toLocaleString()} by {document.signedBy}</p>
            )}
          </div>
          {document.templateData?.html ? (
            <div className="border rounded-md p-6 bg-white text-gray-900 leading-relaxed">
              <div className="max-w-none space-y-4" dangerouslySetInnerHTML={{ __html: document.templateData.html }} />
              {/* Signature section appended at bottom */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-semibold mb-3">Signatures</h4>
                {document.signatures && document.signatures.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {document.signatures.map((s, i) => (
                      <div key={i} className="grid grid-cols-[140px_1fr] gap-4 items-start">
                        <div className="border rounded p-2 bg-gray-50">
                          <img src={s.imageData} alt={`${s.role} signature`} className="max-h-24" />
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <div>
                            <span className="font-medium">Printed Name: </span>
                            <span>{s.name}</span>
                          </div>
                          {s.email && (
                            <div>
                              <span className="font-medium">Email: </span>
                              <span>{s.email}</span>
                            </div>
                          )}
                          <div className="capitalize"><span className="font-medium">Role: </span>{s.role}</div>
                          <div><span className="font-medium">Date: </span>{new Date(s.signedAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No signatures yet.</p>
                )}
              </div>
            </div>
          ) : document.signatureData ? (
            <div className="border rounded-md p-3">
              <h4 className="font-medium mb-2">Signature</h4>
              <img src={document.signatureData} alt="Signature" className="max-h-48" />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No preview available.</div>
          )}

          {!document.templateData?.html && document.signatures && document.signatures.length > 0 && (
            <div className="border rounded-md p-3">
              <h4 className="font-medium mb-2">Signatures</h4>
              <div className="grid gap-4 md:grid-cols-2">
                {document.signatures.map((s, i) => (
                  <div key={i} className="border rounded-md p-2">
                    <div className="text-xs text-gray-600 mb-1">
                      {s.role.toUpperCase()} — {s.name}{s.email ? ` (${s.email})` : ''} on {new Date(s.signedAt).toLocaleString()}
                    </div>
                    <img src={s.imageData} alt={`${s.role} signature`} className="max-h-40" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


