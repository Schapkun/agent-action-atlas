
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { generatePreviewDocument } from '@/utils/documentPreviewStyles';

interface DocumentPreviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTemplate: any;
  formData: {
    title: string;
    description: string;
    client_name: string;
  };
  content: string;
}

export const DocumentPreviewPopup = ({
  isOpen,
  onClose,
  selectedTemplate,
  formData,
  content
}: DocumentPreviewPopupProps) => {
  const generatePreviewContent = () => {
    if (!selectedTemplate) {
      return `
        <div style="padding: 40px; font-family: Arial, sans-serif;">
          <h1 style="color: #333; margin-bottom: 20px;">${formData.title || 'Document titel'}</h1>
          ${formData.client_name ? `<p style="color: #666; margin-bottom: 20px;">Voor: ${formData.client_name}</p>` : ''}
          <div style="line-height: 1.6; color: #333;">
            ${content || 'Document inhoud verschijnt hier...'}
          </div>
        </div>
      `;
    }

    // If template is selected, use template content with replacements
    let templateContent = selectedTemplate.content || '';
    
    // Replace placeholders
    templateContent = templateContent
      .replace(/\{\{titel\}\}/g, formData.title || 'Document titel')
      .replace(/\{\{klant_naam\}\}/g, formData.client_name || 'Klant naam')
      .replace(/\{\{inhoud\}\}/g, content || 'Document inhoud');

    return templateContent;
  };

  const previewHtml = generatePreviewDocument(
    generatePreviewContent(),
    formData.title || 'Document Preview'
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogTitle className="sr-only">Document Preview</DialogTitle>
        <div className="h-[80vh] w-full">
          <iframe
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            title="Document Preview"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
