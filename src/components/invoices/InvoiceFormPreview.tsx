
import { generatePreviewHTML } from '@/utils/invoiceTemplateUtils';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';

interface InvoiceFormPreviewProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  availableTemplates: any[];
  selectedTemplate: string;
  formData: any;
  lineItems: any[];
  invoiceNumber: string;
  selectedContact: any;
  getDefaultInvoiceNumber: () => Promise<string>;
}

export const InvoiceFormPreview = ({
  showPreview,
  setShowPreview,
  availableTemplates,
  selectedTemplate,
  formData,
  lineItems,
  invoiceNumber,
  selectedContact,
  getDefaultInvoiceNumber
}: InvoiceFormPreviewProps) => {
  
  const previewHTML = generatePreviewHTML(
    availableTemplates,
    selectedTemplate,
    {
      ...formData,
      client_name: formData.client_name || selectedContact?.name || '[Klantnaam]',
      client_email: formData.client_email || selectedContact?.email || '[Klant email]',
      client_address: formData.client_address || selectedContact?.address || '[Klant adres]',
      client_postal_code: formData.client_postal_code || selectedContact?.postal_code || '[Postcode]',
      client_city: formData.client_city || selectedContact?.city || '[Plaats]',
      client_country: formData.client_country || selectedContact?.country || 'Nederland',
      invoice_date: formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
      due_date: formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
      payment_terms: formData.payment_terms || 30,
      notes: formData.notes || ''
    },
    lineItems,
    invoiceNumber || 'CONCEPT',
    getDefaultInvoiceNumber
  );

  return (
    <InvoicePreviewDialog
      open={showPreview}
      onOpenChange={setShowPreview}
      previewHTML={previewHTML}
    />
  );
};
