
import { InvoiceHeader } from './InvoiceHeader';
import { ContactSelectionCard } from './ContactSelectionCard';
import { InvoiceDetailsCard } from './InvoiceDetailsCard';
import { LineItemsTable } from './LineItemsTable';
import { InvoiceTotals } from './InvoiceTotals';
import { InvoiceSettingsSidebar } from './InvoiceSettingsSidebar';
import { InvoiceFormActions } from './InvoiceFormActions';
import { TemplateSelector } from './TemplateSelector';
import { InvoicePreviewPopup } from './InvoicePreviewPopup';
import { useInvoiceFormHandlers } from '@/hooks/useInvoiceFormHandlers';
import { useInvoiceTemplateManager } from '@/hooks/useInvoiceTemplateManager';
import { useInvoiceLineItems } from '@/hooks/useInvoiceLineItems';

export const CreateInvoiceForm = () => {
  // Centralized template management with default label from settings
  const {
    selectedTemplate,
    availableTemplates,
    templatesLoading,
    noLabelConfigured,
    handleTemplateSelect
  } = useInvoiceTemplateManager();

  // Line items management with VAT settings
  const { updateVatSettings } = useInvoiceLineItems();

  // Form handlers with preview functionality
  const {
    showSettings,
    setShowSettings,
    showPreview,
    togglePreview,
    formData,
    setFormData,
    lineItems,
    selectedContact,
    invoiceNumber,
    loading,
    sendLoading,
    invoiceSettings,
    canSend,
    handleInvoiceNumberChange,
    handleInvoiceNumberFocus,
    handleInvoiceNumberBlur,
    getDisplayInvoiceNumber,
    getPlaceholderInvoiceNumber,
    handleContactSelectOnly,
    handleFormSubmit,
    handleLineItemUpdate,
    handleLineItemRemove,
    addLineItem,
    calculateTotals,
    handleConvertToQuote,
    handleSubmit,
    handleSaveAndSend
  } = useInvoiceFormHandlers();

  const { subtotal, vatAmount, total } = calculateTotals();

  const handleDocumentSettingsChange = (settings: any) => {
    console.log('Document settings changed:', settings);
    // Update VAT settings in line items hook
    updateVatSettings(settings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <InvoiceHeader
        loading={loading}
        sendLoading={sendLoading}
        clientEmail={formData.client_email}
        showPreview={showPreview}
        canSend={canSend}
        templateSelector={
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            availableTemplates={availableTemplates}
            templatesLoading={templatesLoading}
            noLabelConfigured={noLabelConfigured}
            onTemplateSelect={handleTemplateSelect}
          />
        }
        onTogglePreview={togglePreview}
        onConvertToQuote={handleConvertToQuote}
        onSubmit={handleSubmit}
        onSaveAndSend={handleSaveAndSend}
      />

      <div className="w-full px-6 max-w-none">
        <form onSubmit={handleFormSubmit} className="space-y-6 pt-6">
          <ContactSelectionCard
            selectedContact={selectedContact}
            formData={formData}
            invoiceNumber={invoiceNumber}
            invoiceSettings={invoiceSettings}
            onContactSelect={handleContactSelectOnly}
            onShowSettings={() => setShowSettings(true)}
            onFormDataChange={(updates) => setFormData(updates)}
            onInvoiceNumberChange={handleInvoiceNumberChange}
            onInvoiceNumberFocus={handleInvoiceNumberFocus}
            onInvoiceNumberBlur={handleInvoiceNumberBlur}
            getDisplayInvoiceNumber={getDisplayInvoiceNumber}
          />

          <InvoiceDetailsCard
            formData={formData}
            onFormDataChange={(updates) => setFormData(updates)}
          />

          <LineItemsTable
            lineItems={lineItems}
            onUpdateLineItem={handleLineItemUpdate}
            onRemoveLineItem={handleLineItemRemove}
            onAddLineItem={addLineItem}
          />

          <InvoiceFormActions
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
        onSettingsChange={handleDocumentSettingsChange}
      />

      <InvoicePreviewPopup
        isOpen={showPreview}
        onClose={() => togglePreview()}
        selectedTemplate={selectedTemplate}
        formData={formData}
        lineItems={lineItems}
        invoiceNumber={invoiceNumber}
      />
    </div>
  );
};
