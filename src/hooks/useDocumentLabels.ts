
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export const useDocumentLabels = () => {
  const { toast } = useToast();
  const { selectedOrganization } = useOrganization();

  const updateDocumentLabels = useCallback(async (documentId: string, labelIds: string[]) => {
    if (!selectedOrganization) {
      throw new Error('Geen organisatie geselecteerd');
    }

    try {
      console.log('[useDocumentLabels] Updating labels for document:', documentId, 'with labels:', labelIds);

      // First, remove all existing labels for this document
      await supabase
        .from('document_template_label_assignments')
        .delete()
        .eq('template_id', documentId);

      // Then, add the new labels
      if (labelIds.length > 0) {
        const assignments = labelIds.map(labelId => ({
          template_id: documentId,
          label_id: labelId
        }));

        const { error: insertError } = await supabase
          .from('document_template_label_assignments')
          .insert(assignments);

        if (insertError) {
          console.error('[useDocumentLabels] Insert error:', insertError);
          throw insertError;
        }
      }

      console.log('[useDocumentLabels] Labels updated successfully');
      return true;
    } catch (error) {
      console.error('[useDocumentLabels] Error updating labels:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Kon labels niet bijwerken",
        variant: "destructive"
      });
      throw error;
    }
  }, [selectedOrganization, toast]);

  return {
    updateDocumentLabels
  };
};
