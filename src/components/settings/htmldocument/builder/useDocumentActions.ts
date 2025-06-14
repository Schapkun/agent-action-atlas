
import { useDocumentTemplates, DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';
import { DocumentPDFGenerator } from '../../utils/PDFGenerator';
import { 
  PLACEHOLDER_FIELDS, 
  DocumentTypeUI,
  DocumentTypeBackend
} from './htmlDocumentConstants';
import { useHtmlDraft } from './useHtmlDraft';

interface UseDocumentActionsProps {
  documentName: string;
  documentType: DocumentTypeUI;
  htmlContent: string;
  setHasUnsavedChanges: (value: boolean) => void;
  setIsSaving: (value: boolean) => void;
  setDocumentName: (name: string) => void;
  setDocumentType: (type: DocumentTypeUI) => void;
  setHtmlContent: (content: string) => void;
  editingDocument?: DocumentTemplate | null;
  onDocumentSaved?: (document: DocumentTemplate | null) => void;
  getDraftKey: (name: string) => string;
  placeholderValues: Record<string, string>;
}

export function useDocumentActions({
  documentName,
  documentType,
  htmlContent,
  setHasUnsavedChanges,
  setIsSaving,
  setDocumentName,
  setDocumentType,
  setHtmlContent,
  editingDocument,
  onDocumentSaved,
  getDraftKey,
  placeholderValues
}: UseDocumentActionsProps) {
  const { createTemplate, updateTemplate, fetchTemplates } = useDocumentTemplates();
  const { toast } = useToast();
  const { clearDraft } = useHtmlDraft();

  const typeUiToBackend = (t: DocumentTypeUI): DocumentTypeBackend => (t === 'schapkun' ? 'custom' : t);

  const handleSave = async () => {
    if (!documentName.trim()) {
      toast({
        title: "Fout",
        description: "Document naam is verplicht.",
        variant: "destructive"
      });
      return;
    }
    if (setIsSaving) return;
    setIsSaving(true);

    try {
      let savedDocument: DocumentTemplate;
      const backendType = typeUiToBackend(documentType);

      if (editingDocument) {
        const updatedDoc = await updateTemplate(editingDocument.id, {
          name: documentName.trim(),
          type: backendType,
          html_content: htmlContent,
          description: `${backendType} document`
        });
        savedDocument = updatedDoc;
        toast({ title: "Opgeslagen", description: `Document "${documentName}" is bijgewerkt.` });
      } else {
        const newDocumentData = {
          name: documentName.trim(),
          type: backendType,
          html_content: htmlContent,
          description: `${backendType} document`,
          is_default: false,
          is_active: true
        };
        const newDoc = await createTemplate(newDocumentData);
        savedDocument = newDoc;
        toast({ title: "Opgeslagen", description: `Nieuw document "${documentName}" is aangemaakt.` });
      }
      setHasUnsavedChanges(false);

      await fetchTemplates();

      if (savedDocument) {
        const newName = savedDocument.name;
        const draftKey = getDraftKey(newName);
        clearDraft(draftKey);
        setHtmlContent(savedDocument.html_content || '');
        setDocumentType(savedDocument.type as DocumentTypeUI);
        setDocumentName(newName);
      }
      if (onDocumentSaved && savedDocument) {
        onDocumentSaved(savedDocument);
      }
    } catch (error) {
      console.error('[Builder] Save error:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan. Probeer het opnieuw.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onDocumentSaved) {
      onDocumentSaved(null);
    }
  };

  const handlePDFDownload = () => {
    const fileName = documentName.trim() || 'document';
    DocumentPDFGenerator.generateFromHTML(htmlContent, fileName);
    toast({
      title: "PDF Download",
      description: `PDF wordt gedownload als "${fileName}.pdf"`
    });
  };

  const handleHTMLExport = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName.trim() || 'document'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML Export",
      description: "HTML bestand is gedownload."
    });
  };

  const replacePlaceholders = (content: string, forPreview = false) => {
    let replaced = content;
    PLACEHOLDER_FIELDS.forEach(({ id, type }) => {
      const regex = new RegExp(`{{${id}}}`, "g");
      if (forPreview && type === "image") {
        const srcRegex = new RegExp(`src=[\\"']{{${id}}}[\\"']`, "g");
        if (placeholderValues[id]) {
          replaced = replaced.replace(
            srcRegex,
            `src="${placeholderValues[id]}"`
          );
          replaced = replaced.replace(
            regex,
            `<img src="${placeholderValues[id]}" alt="Bedrijfslogo" style="width:120px;max-height:75px;object-fit:contain;" />`
          );
        } else {
          replaced = replaced.replace(
            srcRegex,
            `src="" style="background:#eee;border:1px dashed #ccc;width:120px;max-height:75px;object-fit:contain;"`
          );
          replaced = replaced.replace(
            regex,
            `<span style="color:#ddd;">[Logo]</span>`
          );
        }
      } else {
        replaced = replaced.replace(
          regex,
          forPreview ? (placeholderValues[id] || `<span style="color:#9ca3af;">[${id}]</span>`) : `{{${id}}}`
        );
      }
    });
    return replaced;
  };

  const getScaledHtmlContent = (content: string) => {
    const withValues = replacePlaceholders(content, true);

    const htmlMatch = withValues.match(/<html[^>]*>([\s\S]*)<\/html>/i);
    if (!htmlMatch) return withValues;

    const scaledContent = withValues.replace(
      /<style[^>]*>([\s\S]*?)<\/style>/i,
      (match, styles) => {
        return `<style>
          ${styles}
          
          html, body {
            margin: 0;
            padding: 25px;
            overflow: hidden;
            transform-origin: top left;
            transform: scale(0.85);
            width: 117.65%;
            height: 117.65%;
            box-sizing: border-box;
          }
        </style>`;
      }
    );
    return scaledContent;
  };

  return {
    handleSave,
    handleCancel,
    handlePDFDownload,
    handleHTMLExport,
    replacePlaceholders,
    getScaledHtmlContent
  };
}
