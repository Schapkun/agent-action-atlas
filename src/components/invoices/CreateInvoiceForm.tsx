
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';
import { useInvoiceForm } from '@/hooks/useInvoiceForm';
import { generatePreviewHTML } from '@/utils/invoiceTemplateUtils';
import { InvoiceHeader } from './InvoiceHeader';
import { ContactSelectionCard } from './ContactSelectionCard';
import { InvoiceDetailsCard } from './InvoiceDetailsCard';
import { LineItemsTable } from './LineItemsTable';
import { InvoiceTotals } from './InvoiceTotals';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { InvoiceSettingsSidebar } from './InvoiceSettingsSidebar';

export const CreateInvoiceForm = () => {
  const { templates: documentTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const {
    formData,
    setFormData,
    lineItems,
    selectedContact,
    invoiceNumber,
    setInvoiceNumber,
    isInvoiceNumberFocused,
    setIsInvoiceNumberFocused,
    loading,
    sendLoading,
    invoiceSettings,
    getDefaultInvoiceNumber,
    handleContactSelect,
    handleContactCreated,
    handleContactUpdated,
    updateLineItem,
    addLineItem,
    removeLineItem,
    calculateTotals,
    handleConvertToQuote,
    handleSubmit,
    handleSaveAndSend
  } = useInvoiceForm();

  // Debug template loading
  useEffect(() => {
    console.log('Document templates loaded:', documentTemplates);
    console.log('Templates loading:', templatesLoading);
    console.log('All available templates:', documentTemplates.map(t => ({ 
      id: t.id, 
      name: t.name, 
      type: t.type,
      is_active: t.is_active 
    })));
  }, [documentTemplates, templatesLoading]);

  // Include ALL active templates
  const availableTemplates = documentTemplates.filter(t => {
    const isValid = t.is_active === true;
    console.log(`Template ${t.name} (${t.type}): ${isValid ? 'included' : 'excluded'} - active: ${t.is_active}`);
    return isValid;
  });

  console.log('Filtered available templates:', availableTemplates.length, availableTemplates);

  // Better template initialization
  useEffect(() => {
    if (availableTemplates.length > 0 && !selectedTemplate) {
      const factuurTemplate = availableTemplates.find(t => t.type === 'factuur');
      const defaultTemplate = availableTemplates.find(t => t.is_default);
      const templateToSelect = factuurTemplate || defaultTemplate || availableTemplates[0];
      
      console.log('Setting template:', templateToSelect);
      setSelectedTemplate(templateToSelect.id);
    }
  }, [availableTemplates, selectedTemplate]);

  const handleInvoiceNumberChange = (value: string) => {
    setInvoiceNumber(value);
  };

  const handleInvoiceNumberFocus = () => {
    setIsInvoiceNumberFocused(true);
    if (!invoiceNumber) {
      setInvoiceNumber(getDefaultInvoiceNumber());
    }
  };

  const handleInvoiceNumberBlur = () => {
    setIsInvoiceNumberFocused(false);
  };

  const getDisplayInvoiceNumber = () => {
    if (invoiceNumber) {
      return invoiceNumber;
    }
    return '';
  };

  const getPlaceholderInvoiceNumber = () => {
    if (!invoiceNumber) {
      return getDefaultInvoiceNumber();
    }
    return '';
  };

  const handleContactClear = () => {
    setFormData(prev => ({
      ...prev,
      client_name: '',
      client_email: '',
      client_address: '',
      client_postal_code: '',
      client_city: '',
      client_country: 'Nederland',
      payment_terms: invoiceSettings.default_payment_terms || 30
    }));
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  const handlePreview = () => {
    setShowPreview(true);
  };

  const previewHTML = generatePreviewHTML(
    availableTemplates,
    selectedTemplate,
    formData,
    lineItems,
    invoiceNumber,
    getDefaultInvoiceNumber
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('CreateInvoiceForm: Form submitted explicitly by user - this is the ONLY time an invoice should be created');
    handleSubmit();
  };

  // CRITICAL: Custom contact created handler to prevent automatic invoice creation
  const handleContactCreatedSafely = (contact: any) => {
    console.log('CreateInvoiceForm: Contact created - ONLY updating form data, NO invoice creation');
    // Call the handleContactCreated from useInvoiceForm which should ONLY update form data
    handleContactCreated(contact);
    console.log('CreateInvoiceForm: Form data updated with new contact - NO invoice should be created');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <InvoiceHeader
        loading={loading}
        sendLoading={sendLoading}
        clientEmail={formData.client_email}
        onPreview={handlePreview}
        onConvertToQuote={handleConvertToQuote}
        onSubmit={handleSubmit}
        onSaveAndSend={handleSaveAndSend}
      />

      <div className="max-w-6xl mx-auto p-3">
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <ContactSelectionCard
            selectedContact={selectedContact}
            selectedTemplate={selectedTemplate}
            availableTemplates={availableTemplates}
            templatesLoading={templatesLoading}
            onContactSelect={handleContactSelect}
            onContactCreated={handleContactCreatedSafely}
            onContactUpdated={handleContactUpdated}
            onTemplateChange={setSelectedTemplate}
            onShowSettings={() => setShowSettings(true)}
          />

          <InvoiceDetailsCard
            formData={formData}
            invoiceNumber={invoiceNumber}
            invoiceSettings={invoiceSettings}
            onFormDataChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
            onInvoiceNumberChange={handleInvoiceNumberChange}
            onInvoiceNumberFocus={handleInvoiceNumberFocus}
            onInvoiceNumberBlur={handleInvoiceNumberBlur}
            getDisplayInvoiceNumber={getDisplayInvoiceNumber}
            getPlaceholderInvoiceNumber={getPlaceholderInvoiceNumber}
          />

          <LineItemsTable
            lineItems={lineItems}
            onUpdateLineItem={updateLineItem}
            onRemoveLineItem={removeLineItem}
          />

          {/* Add line button */}
          <div className="flex justify-end">
            <Button 
              type="button" 
              onClick={addLineItem}
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-600 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Voeg regel toe
            </Button>
          </div>

          {/* Footer with payment info */}
          <Card>
            <CardContent className="p-3">
              <Textarea 
                value="Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendeur.nl met omschrijving: %INVOICE_NUMBER%"
                className="h-12 resize-none text-xs"
                rows={2}
              />
            </CardContent>
          </Card>

          <InvoiceTotals
            subtotal={subtotal}
            vatAmount={vatAmount}
            total={total}
          />
        </form>
      </div>

      <InvoiceSettingsSidebar
        show={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <InvoicePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        previewHTML={previewHTML}
      />
    </div>
  );
};
