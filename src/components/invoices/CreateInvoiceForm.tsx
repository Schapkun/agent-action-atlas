
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
        onTogglePreview={togglePreview}
        onConvertToQuote={handleConvertToQuote}
        onSubmit={handleSubmit}
        onSaveAndSend={handleSaveAndSend}
      />

      {/* Optimized layout: reduced padding and improved spacing */}
      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <form onSubmit={handleFormSubmit} className="space-y-4 lg:space-y-6">
          {/* Responsive grid layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
            {/* Main content area - spans 2 columns on XL screens */}
            <div className="xl:col-span-2 space-y-4 lg:space-y-6">
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

              {/* Responsive table container */}
              <div className="overflow-x-auto">
                <LineItemsTable
                  lineItems={lineItems}
                  onUpdateLineItem={handleLineItemUpdate}
                  onRemoveLineItem={handleLineItemRemove}
                />
              </div>

              <InvoiceFormActions
                onAddLineItem={addLineItem}
                subtotal={subtotal}
                vatAmount={vatAmount}
                total={total}
              />
            </div>

            {/* Sidebar area - spans 1 column on XL screens, full width on smaller */}
            <div className="xl:col-span-1">
              <div className="sticky top-4">
                <InvoiceTotals
                  subtotal={subtotal}
                  vatAmount={vatAmount}
                  total={total}
                />
              </div>
            </div>
          </div>
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
