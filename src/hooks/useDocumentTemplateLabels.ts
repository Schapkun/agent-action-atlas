import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DocumentTemplateLabel } from '@/types/documentLabels';

export const useDocumentTemplateLabels = () => {
  const [labels, setLabels] = useState<DocumentTemplateLabel[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization } = useOrganization();

  const fetchLabels = async () => {
    if (!selectedOrganization) {
      setLabels([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('document_template_labels')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('name');

      if (error) throw error;
      
      setLabels(data || []);
    } catch (error) {
      console.error('Error fetching document template labels:', error);
      toast({
        title: "Fout bij laden",
        description: "Kon labels niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createLabel = async (labelData: { name: string; color: string }) => {
    if (!selectedOrganization) {
      throw new Error('Geen organisatie geselecteerd');
    }

    try {
      const { data, error } = await supabase
        .from('document_template_labels')
        .insert({
          name: labelData.name,
          color: labelData.color,
          organization_id: selectedOrganization.id
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh the labels list immediately
      await fetchLabels();
      
      toast({
        title: "Label aangemaakt",
        description: `Label "${labelData.name}" is aangemaakt`
      });

      return data;
    } catch (error) {
      console.error('Error creating label:', error);
      toast({
        title: "Fout bij aanmaken",
        description: "Kon label niet aanmaken",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateLabel = async (id: string, updates: { name?: string; color?: string }) => {
    try {
      const { data, error } = await supabase
        .from('document_template_labels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Refresh the labels list immediately
      await fetchLabels();
      
      toast({
        title: "Label bijgewerkt",
        description: `Label "${data.name}" is bijgewerkt`
      });

      return data;
    } catch (error) {
      console.error('Error updating label:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Kon label niet bijwerken",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteLabel = async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_template_labels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh the labels list immediately
      await fetchLabels();
      
      toast({
        title: "Label verwijderd",
        description: "Label is succesvol verwijderd"
      });
    } catch (error) {
      console.error('Error deleting label:', error);
      toast({
        title: "Fout bij verwijderen",
        description: "Kon label niet verwijderen",
        variant: "destructive"
      });
      throw error;
    }
  };

  const assignLabelToTemplate = async (templateId: string, labelId: string) => {
    try {
      const { error } = await supabase
        .from('document_template_label_assignments')
        .insert({
          template_id: templateId,
          label_id: labelId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error assigning label to template:', error);
      throw error;
    }
  };

  const removeLabelFromTemplate = async (templateId: string, labelId: string) => {
    try {
      const { error } = await supabase
        .from('document_template_label_assignments')
        .delete()
        .eq('template_id', templateId)
        .eq('label_id', labelId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing label from template:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [selectedOrganization]);

  return {
    labels,
    loading,
    fetchLabels,
    createLabel,
    updateLabel,
    deleteLabel,
    assignLabelToTemplate,
    removeLabelFromTemplate
  };
};
