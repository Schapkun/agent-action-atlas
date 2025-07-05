
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDocumentTemplatesAccess } from './useDocumentTemplatesAccess';

export const useDocumentTemplatesDelete = () => {
  const { toast } = useToast();
  const { checkUserAccess } = useDocumentTemplatesAccess();

  const deleteTemplate = async (id: string) => {
    try {
      console.log('[useDocumentTemplatesDelete] Deleting template:', id);
      
      const { organization } = await checkUserAccess();
      
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
        .eq('id', id)
        .eq('organization_id', organization.id);

      if (error) {
        console.error('[useDocumentTemplatesDelete] Delete error:', error);
        throw new Error(`Kon template niet verwijderen: ${error.message}`);
      }
      
      toast({
        title: "Succes",
        description: "Template succesvol verwijderd"
      });
    } catch (error) {
      console.error('[useDocumentTemplatesDelete] Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout bij verwijderen",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return { deleteTemplate };
};
