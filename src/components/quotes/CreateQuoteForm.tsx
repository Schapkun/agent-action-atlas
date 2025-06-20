
import { QuoteHeader } from './QuoteHeader';
import { ContactSelectionCard } from '../invoices/ContactSelectionCard';
import { QuoteDetailsCard } from './QuoteDetailsCard';
import { LineItemsTable } from '../invoices/LineItemsTable';
import { QuoteFormActions } from './QuoteFormActions';
import { QuoteTotals } from './QuoteTotals';
import { QuoteSettingsSidebar } from './QuoteSettingsSidebar';
import { QuoteTemplateSelector } from './QuoteTemplateSelector';
import { QuotePreviewPopup } from './QuotePreviewPopup';
import { useQuoteFormHandlers } from '@/hooks/useQuoteFormHandlers';
import { useQuoteTemplateManager } from '@/hooks/useQuoteTemplateManager';

export const CreateQuote = () => {
  // Centralized template management
  const {
    selectedTemplate,
    availableTemplates,
    templatesLoading,
    handleTemplateSelect
  } = useQuoteTemplateManager();

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
    quoteNumber,
    loading,
    sendLoading,
    invoiceSettings,
    handleContactSelectOnly,
    handleFormSubmit,
    handleLineItemUpdate,
    handleLineItemRemove,
    addLineItem,
    calculateTotals,
    handleConvertToInvoice,
    handleSubmit,
    handleSaveAndSend
  } = useQuoteFormHandlers();

  const { subtotal, vatAmount, total } = calculateTotals();

  const handleDocumentSettingsChange = (settings: any) => {
    console.log('Quote settings changed:', settings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <QuoteHeader
        loading={loading}
        sendLoading={sendLoading}
        clientEmail={formData.client_email}
        showPreview={showPreview}
        onTogglePreview={togglePreview}
        onConvertToInvoice={handleConvertToInvoice}
        onSubmit={handleSubmit}
        onSaveAndSend={handleSaveAndSend}
      />

      <div className="max-w-6xl mx-auto p-3">
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <ContactSelectionCard
            selectedContact={selectedContact}
            templateSelector={
              <QuoteTemplateSelector
                selectedTemplate={selectedTemplate}
                availableTemplates={availableTemplates}
                templatesLoading={templatesLoading}
                onTemplateSelect={handleTemplateSelect}
              />
            }
            onContactSelect={handleContactSelectOnly}
            onShowSettings={() => setShowSettings(true)}
          />

          <QuoteDetailsCard
            formData={formData}
            quoteNumber={quoteNumber}
            onFormDataChange={(updates) => setFormData({ ...formData, ...updates })}
          />

          <LineItemsTable
            lineItems={lineItems}
            onUpdateLineItem={handleLineItemUpdate}
            onRemoveLineItem={handleLineItemRemove}
          />

          <QuoteFormActions
            onAddLineItem={addLineItem}
            subtotal={subtotal}
            vatAmount={vatAmount}
            total={total}
            notes={formData.notes}
            onNotesChange={(notes) => setFormData({ ...formData, notes })}
          />

          <QuoteTotals
            subtotal={subtotal}
            vatAmount={vatAmount}
            total={total}
          />
        </form>
      </div>

      <QuoteSettingsSidebar
        show={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleDocumentSettingsChange}
      />

      <QuotePreviewPopup
        isOpen={showPreview}
        onClose={() => togglePreview()}
        selectedTemplate={selectedTemplate}
        formData={formData}
        lineItems={lineItems}
        quoteNumber={quoteNumber}
      />
    </div>
  );
};
