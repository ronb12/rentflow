'use client';

import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SignaturePad from 'signature_pad';

interface Document {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface DocumentSignModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSuccess: () => void;
}

export function DocumentSignModal({ isOpen, onClose, document, onSuccess }: DocumentSignModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'rgb(0, 0, 0)',
        minWidth: 1,
        maxWidth: 3,
      });

      // Make canvas responsive
      const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d')?.scale(ratio, ratio);
        signaturePadRef.current?.clear();
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }
  }, [isOpen]);

  const handleSign = async () => {
    if (!signerName || !signaturePadRef.current || signaturePadRef.current.isEmpty()) {
      alert('Please provide your name and signature');
      return;
    }

    setSigning(true);

    try {
      const signatureData = signaturePadRef.current.toDataURL();
      
      const response = await fetch('/api/documents/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document?.id,
          signatureData,
          signerName,
          signerEmail
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        throw new Error('Failed to sign document');
      }
    } catch (error) {
      console.error('Signing error:', error);
      alert('Failed to sign document');
    } finally {
      setSigning(false);
    }
  };

  const clearSignature = () => {
    signaturePadRef.current?.clear();
  };

  const resetForm = () => {
    setSignerName('');
    setSignerEmail('');
    signaturePadRef.current?.clear();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!document) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sign Document: {document.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Document Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium">Document Information</h3>
            <div className="text-sm text-gray-600 mt-1">
              <p><strong>Name:</strong> {document.name}</p>
              <p><strong>Type:</strong> {document.type}</p>
              <p><strong>Status:</strong> {document.status}</p>
            </div>
          </div>

          {/* Signer Information */}
          <div className="space-y-4">
            <h3 className="font-medium">Signer Information</h3>
            <div className="space-y-2">
              <Label htmlFor="signerName">Full Name *</Label>
              <Input
                id="signerName"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signerEmail">Email Address</Label>
              <Input
                id="signerEmail"
                type="email"
                value={signerEmail}
                onChange={(e) => setSignerEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Signature Pad */}
          <div className="space-y-2">
            <Label>Digital Signature *</Label>
            <div className="border-2 border-gray-300 rounded-lg">
              <canvas
                ref={canvasRef}
                className="w-full h-32 cursor-crosshair"
                style={{ touchAction: 'none' }}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Sign above using your mouse or touch screen
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearSignature}
              >
                Clear Signature
              </Button>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-800">Legal Notice</h4>
            <p className="text-sm text-yellow-700 mt-1">
              By signing this document, you acknowledge that your digital signature has the same 
              legal effect as a handwritten signature and that you agree to be bound by the terms 
              of this document.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSign} disabled={signing}>
              {signing ? 'Signing...' : 'Sign Document'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}





