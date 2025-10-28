import { useState } from 'react';

export interface EmailData {
  to: string | string[];
  tenantName?: string;
  landlordName?: string;
  propertyAddress?: string;
  amount?: string;
  dueDate?: string;
  leaseEndDate?: string;
  leaseStartDate?: string;
  maintenanceRequestId?: string;
  inspectionDate?: string;
  customMessage?: string;
  subject?: string;
  [key: string]: any;
}

export interface UseEmailReturn {
  sendEmail: (type: EmailType, data: EmailData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  lastSent: EmailType | null;
}

export type EmailType = 
  | 'rent-reminder'
  | 'maintenance-confirmation'
  | 'lease-renewal'
  | 'inspection-notice'
  | 'welcome'
  | 'custom';

export function useEmail(): UseEmailReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState<EmailType | null>(null);

  const sendEmail = async (type: EmailType, data: EmailData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      setLastSent(type);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Email sending error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendEmail,
    isLoading,
    error,
    lastSent,
  };
}

// Utility functions for common email scenarios
export const emailUtils = {
  /**
   * Send rent reminder to tenant
   */
  sendRentReminder: async (tenantEmail: string, data: Partial<EmailData>) => {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'rent-reminder',
        data: { to: tenantEmail, ...data }
      }),
    });
    return response.ok;
  },

  /**
   * Send maintenance request confirmation
   */
  sendMaintenanceConfirmation: async (tenantEmail: string, data: Partial<EmailData>) => {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'maintenance-confirmation',
        data: { to: tenantEmail, ...data }
      }),
    });
    return response.ok;
  },

  /**
   * Send lease renewal notice
   */
  sendLeaseRenewal: async (tenantEmail: string, data: Partial<EmailData>) => {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'lease-renewal',
        data: { to: tenantEmail, ...data }
      }),
    });
    return response.ok;
  },

  /**
   * Send inspection notice
   */
  sendInspectionNotice: async (tenantEmail: string, data: Partial<EmailData>) => {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'inspection-notice',
        data: { to: tenantEmail, ...data }
      }),
    });
    return response.ok;
  },

  /**
   * Send welcome email to new tenant
   */
  sendWelcomeEmail: async (tenantEmail: string, data: Partial<EmailData>) => {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'welcome',
        data: { to: tenantEmail, ...data }
      }),
    });
    return response.ok;
  },

  /**
   * Send custom message
   */
  sendCustomMessage: async (tenantEmail: string, data: Partial<EmailData>) => {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'custom',
        data: { to: tenantEmail, ...data }
      }),
    });
    return response.ok;
  },
};
