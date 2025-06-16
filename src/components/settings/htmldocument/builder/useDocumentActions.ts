import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

export const useDocumentActions = (
  documentId: string | undefined,
  documentName: string,
  htmlContent: string,
  placeholderValues: Record<string, string>,
  selectedLabels: any[], // Add this parameter
  onComplete: (success: boolean) => void
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { updateTemplate, createTemplate } = useDocumentTemplates();
  const { toast } = useToast();

  const handleSave = async () => {
    console.log('[useDocumentActions] ========= SAVE STARTED =========');
    console.log('[useDocumentActions] Save called with:', {
      documentId,
      documentName,
      htmlContentLength: htmlContent?.length,
      placeholderKeys: Object.keys(placeholderValues),
      selectedLabelsCount: selectedLabels?.length
    });

    if (!documentName.trim()) {
      console.error('[useDocumentActions] Validation failed: empty name');
      toast({
        title: "Validatiefout",
        description: "Documentnaam is verplicht",
        variant: "destructive"
      });
      return;
    }

    if (documentName.trim().length < 2) {
      console.error('[useDocumentActions] Validation failed: name too short');
      toast({
        title: "Validatiefout", 
        description: "Documentnaam moet minimaal 2 karakters bevatten",
        variant: "destructive"
      });
      return;
    }

    if (!htmlContent?.trim()) {
      console.error('[useDocumentActions] Validation failed: empty content');
      toast({
        title: "Validatiefout",
        description: "Document inhoud mag niet leeg zijn",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      console.log('[useDocumentActions] Starting save operation...');

      if (documentId) {
        console.log('[useDocumentActions] Updating existing document:', documentId);
        await updateTemplate(documentId, {
          name: documentName.trim(),
          html_content: htmlContent,
          placeholder_values: placeholderValues,
          labelIds: selectedLabels?.map(label => label.id) || []
        });
      } else {
        console.log('[useDocumentActions] Creating new document');
        const result = await createTemplate({
          name: documentName.trim(),
          type: 'custom' as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun', // Fix the type assertion
          html_content: htmlContent,
          placeholder_values: placeholderValues,
          is_active: true,
          is_default: false,
          labelIds: selectedLabels?.map(label => label.id) || []
        });
        
        console.log('[useDocumentActions] Document created successfully:', result?.id);
      }

      console.log('[useDocumentActions] Save completed successfully');
      onComplete(true);
      
    } catch (error) {
      console.error('[useDocumentActions] Save failed:', error);
      onComplete(false);
    } finally {
      setIsSaving(false);
      console.log('[useDocumentActions] ========= SAVE COMPLETED =========');
    }
  };

  return {
    isSaving,
    handleSave
  };
};
