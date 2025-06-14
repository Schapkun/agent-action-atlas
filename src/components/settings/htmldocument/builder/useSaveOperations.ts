
import { useDocumentTemplates, DocumentTemplate } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';
import { DocumentTypeUI, DocumentTypeBackend } from './htmlDocumentConstants';

interface UseSaveOperationsProps {
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
  clearDraftForDocument: (documentName: string) => void;
}

export function useSaveOperations({
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
  clearDraftForDocument
}: UseSaveOperationsProps) {
  const { createTemplate, updateTemplate, fetchTemplates } = useDocumentTemplates();
  const { toast } = useToast();

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
    
    setIsSaving(true);
    console.log('[Save] Starting save process for:', documentName);

    try {
      let savedDocument: DocumentTemplate;
      const backendType = typeUiToBackend(documentType);

      if (editingDocument) {
        console.log('[Save] Updating existing document:', editingDocument.id);
        const updatedDoc = await updateTemplate(editingDocument.id, {
          name: documentName.trim(),
          type: backendType,
          html_content: htmlContent,
          description: `${backendType} document`
        });
        savedDocument = updatedDoc;
        toast({ title: "Opgeslagen", description: `Document "${documentName}" is bijgewerkt.` });
      } else {
        console.log('[Save] Creating new document');
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
      
      console.log('[Save] Successfully saved document:', savedDocument);
      
      // Clear the draft since we saved successfully
      clearDraftForDocument(documentName);
      
      // Update state to reflect saved document
      setHasUnsavedChanges(false);
      setHtmlContent(savedDocument.html_content || '');
      setDocumentType(savedDocument.type as DocumentTypeUI);
      setDocumentName(savedDocument.name);
      
      // Refresh the templates list
      await fetchTemplates();
      
      // Notify parent component
      if (onDocumentSaved && savedDocument) {
        onDocumentSaved(savedDocument);
      }
    } catch (error) {
      console.error('[Save] Error:', error);
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

  return {
    handleSave,
    handleCancel
  };
}
