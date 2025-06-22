
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

export const CreateInvoiceForm = () => {
  // Centralized template management with default label from settings
  const {
    selectedTemplate,
    availableTemplates,
    templatesLoading,
    noLabelConfigured,
    handleTemplateSelect
  } = useInvoiceTemplateManager();

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
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <InvoiceHeader
        loading={loading}
        sendLoading={sendLoading}
        clientEmail={formData.client_email}
        showPreview={showPreview}
        canSend={canSend}
        onTogglePreview={togglePreview}
        onConvertToQuote={handleConvertToQuote}
        onSubmit={handleSubmit}
        onSaveAndSend={handleSaveAndSend}
      />

      <div className="max-w-6xl mx-auto p-3">
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <ContactSelectionCard
            selectedContact={selectedContact}
            templateSelector={
              <TemplateSelector
                selectedTemplate={selectedTemplate}
                availableTemplates={availableTemplates}
                templatesLoading={templatesLoading}
                noLabelConfigured={noLabelConfigured}
                onTemplateSelect={handleTemplateSelect}
              />
            }
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
            getPlaceholderInvoiceNumber={getPlaceholderInvoiceNumber}
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
