
import { InvoiceHeader } from './InvoiceHeader';
import { ContactSelectionCard } from './ContactSelectionCard';
import { InvoiceDetailsCard } from './InvoiceDetailsCard';
import { LineItemsTable } from './LineItemsTable';
import { InvoiceTotals } from './InvoiceTotals';
import { InvoiceSettingsSidebar } from './InvoiceSettingsSidebar';
import { InvoiceFormActions } from './InvoiceFormActions';
import { TemplateSelector } from './TemplateSelector';
import { InvoicePreview } from './InvoicePreview';
import { useInvoiceFormHandlers } from '@/hooks/useInvoiceFormHandlers';
import { useInvoiceTemplateManager } from '@/hooks/useInvoiceTemplateManager';

export const CreateInvoiceForm = () => {
  // Centralized template management
  const {
    selectedTemplate,
    availableTemplates,
    templatesLoading,
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

  console.log('🎯 FORM: Rendering with live preview system:', {
    selectedTemplate: selectedTemplate ? {
      id: selectedTemplate.id,
      name: selectedTemplate.name
    } : null,
    showPreview,
    availableTemplatesCount: availableTemplates.length
  });

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

      <div className="flex h-[calc(100vh-73px)]">
        {/* Form Section */}
        <div className={`${showPreview ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
          <div className="max-w-6xl mx-auto p-3 h-full overflow-auto">
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <ContactSelectionCard
                selectedContact={selectedContact}
                templateSelector={
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    availableTemplates={availableTemplates}
                    templatesLoading={templatesLoading}
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
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="w-1/2 h-full">
            <InvoicePreview
              selectedTemplate={selectedTemplate}
              formData={formData}
              lineItems={lineItems}
              invoiceNumber={invoiceNumber}
              className="h-full"
            />
          </div>
        )}
      </div>

      <InvoiceSettingsSidebar
        show={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
};
