
import { DocumentHeader } from './DocumentHeader';
import { ContactSelectionCard } from '@/components/invoices/ContactSelectionCard';
import { DocumentDetailsCard } from './DocumentDetailsCard';
import { DocumentTemplateSelector } from './DocumentTemplateSelector';
import { DocumentPreviewPopup } from './DocumentPreviewPopup';
import { DocumentSettingsSidebar } from './DocumentSettingsSidebar';
import { useDocumentFormHandlers } from '@/hooks/useDocumentFormHandlers';
import { useDocumentTemplateManager } from '@/hooks/useDocumentTemplateManager';

export const CreateDocumentForm = () => {
  const {
    showSettings,
    setShowSettings,
    showPreview,
    togglePreview,
    loading,
    sendLoading,
    selectedContact,
    documentType,
    setDocumentType,
    content,
    setContent,
    formData,
    handleContactSelect,
    handleFormSubmit,
    handleSaveAndSend,
    updateFormData
  } = useDocumentFormHandlers();

  const {
    selectedTemplate,
    availableTemplates,
    templatesLoading,
    noLabelConfigured,
    handleTemplateSelect
  } = useDocumentTemplateManager(documentType);

  const handleDocumentSettingsChange = (settings: any) => {
    console.log('Document settings changed:', settings);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DocumentHeader
        loading={loading}
        sendLoading={sendLoading}
        clientEmail={formData.client_email}
        showPreview={showPreview}
        onTogglePreview={togglePreview}
        onSubmit={() => handleFormSubmit(new Event('submit') as any)}
        onSaveAndSend={handleSaveAndSend}
      />

      <div className="max-w-6xl mx-auto p-3">
        <form onSubmit={handleFormSubmit} className="space-y-3">
          <ContactSelectionCard
            selectedContact={selectedContact}
            templateSelector={
              <DocumentTemplateSelector
                selectedTemplate={selectedTemplate}
                availableTemplates={availableTemplates}
                templatesLoading={templatesLoading}
                noLabelConfigured={noLabelConfigured}
                documentType={documentType}
                onTemplateSelect={handleTemplateSelect}
              />
            }
            onContactSelect={handleContactSelect}
            onShowSettings={() => setShowSettings(true)}
          />

          <DocumentDetailsCard
            formData={formData}
            documentType={documentType}
            content={content}
            onFormDataChange={updateFormData}
            onDocumentTypeChange={setDocumentType}
            onContentChange={setContent}
          />
        </form>
      </div>

      <DocumentSettingsSidebar
        show={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={handleDocumentSettingsChange}
      />

      <DocumentPreviewPopup
        isOpen={showPreview}
        onClose={togglePreview}
        selectedTemplate={selectedTemplate}
        formData={formData}
        content={content}
      />
    </div>
  );
};
