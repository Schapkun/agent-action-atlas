
import React, { useState } from 'react';
import { InvoiceOverview } from '@/components/invoices/InvoiceOverview';
import type { DocumentTemplate } from '@/hooks/useDocumentTemplatesCreate';

export const InvoiceManager = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);

  // Mock invoice data for demonstration
  const mockInvoiceData = {
    id: '1',
    invoice_number: 'INV-2024-001',
    client_name: 'Voorbeeld Klant',
    client_email: 'klant@voorbeeld.nl',
    client_address: 'Voorbeeldstraat 123',
    client_postal_code: '1234AB',
    client_city: 'Amsterdam',
    client_country: 'Nederland',
    invoice_date: new Date().toISOString(),
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    payment_terms: 30,
    subtotal: 100,
    vat_amount: 21,
    vat_percentage: 21,
    total_amount: 121,
    status: 'draft',
    notes: 'Voorbeeld notities',
    created_at: new Date().toISOString()
  };

  const handleEdit = () => {
    console.log('Edit invoice');
  };

  const handleGeneratePDF = () => {
    console.log('Generate PDF');
  };

  const handleSendEmail = () => {
    console.log('Send email');
  };

  const handleDuplicate = () => {
    console.log('Duplicate invoice');
  };

  const handleAddLine = () => {
    console.log('Add line');
  };

  return (
    <InvoiceOverview
      invoiceData={mockInvoiceData}
      onEdit={handleEdit}
      onGeneratePDF={handleGeneratePDF}
      onSendEmail={handleSendEmail}
      onDuplicate={handleDuplicate}
      onAddLine={handleAddLine}
      selectedTemplate={selectedTemplate}
      onTemplateChange={setSelectedTemplate}
    />
  );
};
