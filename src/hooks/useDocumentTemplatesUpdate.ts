
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentTemplate } from './useDocumentTemplatesCreate';
import { useDocumentTemplatesAccess } from './useDocumentTemplatesAccess';

export const useDocumentTemplatesUpdate = () => {
  const { toast } = useToast();
  const { checkUserAccess } = useDocumentTemplatesAccess();

  const updateTemplate = async (id: string, updates: Partial<DocumentTemplate> & { labelIds?: string[] }) => {
    try {
      console.log('[useDocumentTemplatesUpdate] Updating template:', id);
      
      const { organization } = await checkUserAccess();

      if (updates.name !== undefined && !updates.name.trim()) {
        throw new Error('Documentnaam is verplicht');
      }

      if (updates.html_content !== undefined && !updates.html_content.trim()) {
        throw new Error('HTML content is verplicht');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        placeholder_values: updates.placeholder_values || null,
        type: 'custom',
      };

      // Remove labelIds from update data as it's not a column
      delete (updateData as any).labelIds;

      const { data, error } = await supabase
        .from('document_templates')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', organization.id)
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTemplatesUpdate] Update error:', error);
        throw new Error(`Kon template niet bijwerken: ${error.message}`);
      }

      if (!data) {
        throw new Error('Template niet gevonden of geen toegang');
      }

      // Update labels if provided
      if (updates.labelIds !== undefined) {
        // First remove all existing label assignments
        await supabase
          .from('document_template_label_assignments')
          .delete()
          .eq('template_id', id);

        // Then add new ones
        if (updates.labelIds.length > 0) {
          for (const labelId of updates.labelIds) {
            await supabase
              .from('document_template_label_assignments')
              .insert({
                template_id: id,
                label_id: labelId
              });
          }
        }
      }

      console.log('[useDocumentTemplatesUpdate] Template updated successfully');
      
      return data;
    } catch (error) {
      console.error('[useDocumentTemplatesUpdate] Update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout bij bijwerken",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const setTemplateFavorite = async (templateId: string, isFavorite: boolean) => {
    try {
      console.log('[useDocumentTemplatesUpdate] Setting template favorite:', templateId, isFavorite);
      
      const { organization } = await checkUserAccess();

      // If setting as favorite, first remove favorite from all other templates
      if (isFavorite) {
        await supabase
          .from('document_templates')
          .update({ is_default: false })
          .eq('organization_id', organization.id)
          .eq('is_active', true);
      }

      const { error } = await supabase
        .from('document_templates')
        .update({ is_default: isFavorite })
        .eq('id', templateId)
        .eq('organization_id', organization.id);

      if (error) {
        console.error('[useDocumentTemplatesUpdate] Favorite error:', error);
        throw new Error(`Kon favoriet niet instellen: ${error.message}`);
      }
      
      toast({
        title: isFavorite ? "Favoriet ingesteld" : "Favoriet verwijderd",
        description: `Template is ${isFavorite ? 'ingesteld' : 'verwijderd'} als favoriet`,
      });
      
      console.log('[useDocumentTemplatesUpdate] Template favorite updated successfully');
    } catch (error) {
      console.error('[useDocumentTemplatesUpdate] Favorite error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout bij instellen favoriet",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return { updateTemplate, setTemplateFavorite };
};
