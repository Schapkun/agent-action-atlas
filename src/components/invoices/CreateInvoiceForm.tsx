
import { InvoiceHeader } from './InvoiceHeader';
import { ContactSelectionCard } from './ContactSelectionCard';
import { InvoiceDetailsCard } from './InvoiceDetailsCard';
import { LineItemsTable } from './LineItemsTable';
import { InvoiceTotals } from './InvoiceTotals';
import { InvoiceSettingsSidebar } from './InvoiceSettingsSidebar';
import { InvoiceFormActions } from './InvoiceFormActions';
import { InvoiceTemplateManager } from './InvoiceTemplateManager';
import { InvoiceFormPreview } from './InvoiceFormPreview';
import { useInvoiceFormHandlers } from '@/hooks/useInvoiceFormHandlers';
import { useInvoiceTemplates } from '@/hooks/useInvoiceTemplates';
import { useEffect } from 'react';

export const CreateInvoiceForm = () => {
  const { defaultTemplate } = useInvoiceTemplates();
  
  const {
    documentTemplates,
    templatesLoading,
    selectedTemplate,
    setSelectedTemplate,
    showSettings,
    setShowSettings,
    showPreview,
    setShowPreview,
    formData,
    setFormData,
    lineItems,
    selectedContact,
    invoiceNumber,
    loading,
    sendLoading,
    invoiceSettings,
    handleInvoiceNumberChange,
    handleInvoiceNumberFocus,
    handleInvoiceNumberBlur,
    getDisplayInvoiceNumber,
    handleContactSelectOnly,
    handlePreview,
    handleFormSubmit,
    handleLineItemUpdate,
    handleLineItemRemove,
    addLineItem,
    calculateTotals,
    handleConvertToQuote,
    handleSubmit,
    handleSaveAndSend,
    getDefaultInvoiceNumber
  } = useInvoiceFormHandlers();

  // Auto-select default template when available
  useEffect(() => {
    if (defaultTemplate && !selectedTemplate) {
      setSelectedTemplate(defaultTemplate);
    }
  }, [defaultTemplate, selectedTemplate, setSelectedTemplate]);

  // Get template manager components
  const templateManager = InvoiceTemplateManager({
    documentTemplates,
    templatesLoading,
    selectedTemplate,
    setSelectedTemplate
  });

  const { subtotal, vatAmount, total } = calculateTotals();

  console.log('🎨 CreateInvoiceForm: Consistent template object usage:', {
    selectedTemplate: selectedTemplate ? {
      id: selectedTemplate.id,
      name: selectedTemplate.name
    } : null,
    availableTemplatesCount: documentTemplates.length
  });

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
            templateSelector={templateManager.templateSelect}
            onContactSelect={handleContactSelectOnly}
            onShowSettings={() => setShowSettings(true)}
          />

          <InvoiceDetailsCard
            formData={formData}
            invoiceNumber={invoiceNumber}
            invoiceSettings={invoiceSettings}
            onFormDataChange={(updates) => setFormData(updates)}
            onInvoiceNumberChange={handleInvoiceNumberChange}
            onInvoiceNumberFocus={handleInvoiceNumberFocus}
            onInvoiceNumberBlur={handleInvoiceNumberBlur}
            getDisplayInvoiceNumber={getDisplayInvoiceNumber}
            getPlaceholderInvoiceNumber={() => ''}
          />

          <LineItemsTable
            lineItems={lineItems}
            onUpdateLineItem={handleLineItemUpdate}
            onRemoveLineItem={handleLineItemRemove}
          />

          <InvoiceFormActions
            onAddLineItem={addLineItem}
            subtotal={subtotal}
            vatAmount={vatAmount}
            total={total}
          />

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

      <InvoiceFormPreview
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        selectedTemplateObject={selectedTemplate}
        formData={formData}
        lineItems={lineItems}
        invoiceNumber={invoiceNumber}
        selectedContact={selectedContact}
        getDefaultInvoiceNumber={getDefaultInvoiceNumber}
      />
    </div>
  );
};
