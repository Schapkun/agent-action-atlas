
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DocumentTemplateLabel } from '@/types/documentTemplateLabels';

export const useDocumentTemplateLabels = () => {
  const [labels, setLabels] = useState<DocumentTemplateLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization } = useOrganization();

  const fetchLabels = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setLabels([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('document_template_labels')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('name');

      if (error) throw error;
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
      toast({
        title: "Fout",
        description: "Kon labels niet laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization?.id, toast]);

  const createLabel = useCallback(async (name: string, color: string) => {
    if (!selectedOrganization?.id) return;

    try {
      const { data, error } = await supabase
        .from('document_template_labels')
        .insert({
          name,
          color,
          organization_id: selectedOrganization.id
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchLabels();
      toast({
        title: "Label aangemaakt",
        description: `Label "${name}" is aangemaakt`
      });
      
      return data;
    } catch (error) {
      console.error('Error creating label:', error);
      toast({
        title: "Fout",
        description: "Kon label niet aanmaken",
        variant: "destructive"
      });
      throw error;
    }
  }, [selectedOrganization?.id, fetchLabels, toast]);

  const updateLabel = useCallback(async (id: string, updates: Partial<Pick<DocumentTemplateLabel, 'name' | 'color'>>) => {
    try {
      const { error } = await supabase
        .from('document_template_labels')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchLabels();
      toast({
        title: "Label bijgewerkt",
        description: "Label is succesvol bijgewerkt"
      });
    } catch (error) {
      console.error('Error updating label:', error);
      toast({
        title: "Fout",
        description: "Kon label niet bijwerken",
        variant: "destructive"
      });
      throw error;
    }
  }, [fetchLabels, toast]);

  const deleteLabel = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_template_labels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchLabels();
      toast({
        title: "Label verwijderd",
        description: "Label is succesvol verwijderd"
      });
    } catch (error) {
      console.error('Error deleting label:', error);
      toast({
        title: "Fout",
        description: "Kon label niet verwijderen",
        variant: "destructive"
      });
      throw error;
    }
  }, [fetchLabels, toast]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  return {
    labels,
    loading,
    createLabel,
    updateLabel,
    deleteLabel,
    refetch: fetchLabels
  };
};
