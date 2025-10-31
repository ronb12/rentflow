'use client';

import { useState } from 'react';
import { useEmail, EmailType } from '@/hooks/useEmail';

interface EmailFormProps {
  tenantEmail: string;
  tenantName?: string;
  propertyAddress?: string;
  landlordName?: string;
}

export function EmailForm({ tenantEmail, tenantName, propertyAddress, landlordName }: EmailFormProps) {
  const { sendEmail, isLoading, error, lastSent } = useEmail();
  const [selectedType, setSelectedType] = useState<EmailType>('custom');
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [additionalData, setAdditionalData] = useState({
    amount: '',
    dueDate: '',
    leaseEndDate: '',
    inspectionDate: '',
    maintenanceRequestId: '',
  });

  const handleSendEmail = async () => {
    const emailData = {
      to: tenantEmail,
      tenantName,
      propertyAddress,
      landlordName,
      ...additionalData,
      ...(selectedType === 'custom' && {
        subject: customSubject,
        customMessage,
      }),
    };

    const success = await sendEmail(selectedType, emailData);
    if (success) {
      // Reset form or show success message
      setCustomMessage('');
      setCustomSubject('');
    }
  };

  const getEmailTypeLabel = (type: EmailType): string => {
    const labels = {
      'rent-reminder': 'Rent Reminder',
      'maintenance-confirmation': 'Maintenance Confirmation',
      'lease-renewal': 'Lease Renewal Notice',
      'inspection-notice': 'Inspection Notice',
      'welcome': 'Welcome Email',
      'custom': 'Custom Message',
    };
    return labels[type];
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Send Email to Tenant</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {lastSent && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {getEmailTypeLabel(lastSent)} sent successfully!
        </div>
      )}

      <div className="space-y-4">
        {/* Email Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as EmailType)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="rent-reminder">Rent Reminder</option>
            <option value="maintenance-confirmation">Maintenance Confirmation</option>
            <option value="lease-renewal">Lease Renewal Notice</option>
            <option value="inspection-notice">Inspection Notice</option>
            <option value="welcome">Welcome Email</option>
            <option value="custom">Custom Message</option>
          </select>
        </div>

        {/* Dynamic fields based on email type */}
        {selectedType === 'rent-reminder' && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="text"
                  value={additionalData.amount}
                  onChange={(e) => setAdditionalData({ ...additionalData, amount: e.target.value })}
                  placeholder="e.g., 1200"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={additionalData.dueDate}
                  onChange={(e) => setAdditionalData({ ...additionalData, dueDate: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </>
        )}

        {selectedType === 'maintenance-confirmation' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request ID
            </label>
            <input
              type="text"
              value={additionalData.maintenanceRequestId}
              onChange={(e) => setAdditionalData({ ...additionalData, maintenanceRequestId: e.target.value })}
              placeholder="e.g., MR-2024-001"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {selectedType === 'lease-renewal' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lease End Date
            </label>
            <input
              type="date"
              value={additionalData.leaseEndDate}
              onChange={(e) => setAdditionalData({ ...additionalData, leaseEndDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {selectedType === 'inspection-notice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspection Date
            </label>
            <input
              type="date"
              value={additionalData.inspectionDate}
              onChange={(e) => setAdditionalData({ ...additionalData, inspectionDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}

        {selectedType === 'custom' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Your message to the tenant..."
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </>
        )}

        {/* Send Button */}
        <button
          onClick={handleSendEmail}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : `Send ${getEmailTypeLabel(selectedType)}`}
        </button>
      </div>
    </div>
  );
}






