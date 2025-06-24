
import { QuoteHeader } from './QuoteHeader';
import { ContactSelectionCard } from '../invoices/ContactSelectionCard';
import { QuoteDetailsCard } from './QuoteDetailsCard';
import { QuoteLineItemsTable } from './QuoteLineItemsTable';
import { QuoteFormActions } from './QuoteFormActions';
import { QuoteTotals } from './QuoteTotals';
import { QuoteSettingsSidebar } from './QuoteSettingsSidebar';
import { QuoteTemplateSelector } from './QuoteTemplateSelector';
import { QuotePreviewDialog } from './QuotePreviewDialog';
import { useQuoteFormHandlers } from '@/hooks/useQuoteFormHandlers';
import { useQuoteTemplateManager } from '@/hooks/useQuoteTemplateManager';

export const CreateQuote = () => {
  // Centralized template management with default label from settings
  const {
    selectedTemplate,
    availableTemplates,
    templatesLoading,
    handleTemplateSelect
  } = useQuoteTemplateManager();

  // Form handlers with preview functionality and session recovery
  const {
    showSettings,
    setShowSettings,
    showPreview,
    togglePreview,
    isSessionRecovered,
    sessionData,
    formData,
    setFormData,
    lineItems,
    selectedContact,
    quoteNumber,
    loading,
    sendLoading,
    invoiceSettings,
    canSend,
    handleQuoteNumberChange,
    handleQuoteNumberFocus,
    handleQuoteNumberBlur,
    getDisplayQuoteNumber,
    getPlaceholderQuoteNumber,
    handleContactSelectOnly,
    handleCancel,
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
        canSend={canSend}
        isSessionRecovered={isSessionRecovered}
        sessionData={sessionData}
        templateSelector={
          <QuoteTemplateSelector
            selectedTemplate={selectedTemplate}
            availableTemplates={availableTemplates}
            templatesLoading={templatesLoading}
            onTemplateSelect={handleTemplateSelect}
          />
        }
        onTogglePreview={togglePreview}
        onConvertToInvoice={handleConvertToInvoice}
        onSubmit={handleSubmit}
        onSaveAndSend={handleSaveAndSend}
        onCancel={handleCancel}
      />

      <div className="w-full px-6 max-w-none">
        <form onSubmit={handleFormSubmit} className="space-y-6 pt-6">
          <div className={
            isSessionRecovered && sessionData?.hasFormData 
              ? 'ring-2 ring-orange-200 rounded-lg' 
              : ''
          }>
            <ContactSelectionCard
              selectedContact={selectedContact}
              formData={formData}
              invoiceNumber={quoteNumber}
              invoiceSettings={invoiceSettings}
              onContactSelect={handleContactSelectOnly}
              onShowSettings={() => setShowSettings(true)}
              onFormDataChange={(updates) => setFormData({ ...formData, ...updates })}
              onInvoiceNumberChange={handleQuoteNumberChange}
              onInvoiceNumberFocus={handleQuoteNumberFocus}
              onInvoiceNumberBlur={handleQuoteNumberBlur}
              getDisplayInvoiceNumber={getDisplayQuoteNumber}
              getPlaceholderInvoiceNumber={getPlaceholderQuoteNumber}
              isQuote={true}
            />
          </div>

          <QuoteDetailsCard
            formData={formData}
            onFormDataChange={(updates) => setFormData({ ...formData, ...updates })}
          />

          <div className={
            isSessionRecovered && sessionData?.hasLineItems 
              ? 'ring-2 ring-orange-200 rounded-lg' 
              : ''
          }>
            <QuoteLineItemsTable
              lineItems={lineItems}
              onUpdateLineItem={handleLineItemUpdate}
              onRemoveLineItem={handleLineItemRemove}
              onAddLineItem={addLineItem}
            />
          </div>

          <QuoteFormActions
            subtotal={subtotal}
            vatAmount={vatAmount}
            total={total}
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

      <QuotePreviewDialog
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
