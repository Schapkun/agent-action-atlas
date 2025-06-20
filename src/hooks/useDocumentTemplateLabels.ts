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
      console.log('[useDocumentTemplateLabels] Fetching labels for organization:', selectedOrganization.id);
      
      const { data, error } = await supabase
        .from('document_template_labels')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('name');

      if (error) {
        console.error('[useDocumentTemplateLabels] Fetch error:', error);
        throw error;
      }
      
      console.log('[useDocumentTemplateLabels] Fetched labels:', data?.length || 0, data);
      setLabels(data || []);

      // Auto-create essential labels if they don't exist
      await ensureEssentialLabels(data || []);
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

  const ensureEssentialLabels = async (existingLabels: DocumentTemplateLabel[]) => {
    if (!selectedOrganization) return;

    const essentialLabels = [
      { name: 'Factuur', color: '#3B82F6' },
      { name: 'Offerte', color: '#10B981' }
    ];

    for (const essential of essentialLabels) {
      const exists = existingLabels.some(label => 
        label.name.toLowerCase() === essential.name.toLowerCase()
      );

      if (!exists) {
        console.log('[useDocumentTemplateLabels] Creating essential label:', essential.name);
        try {
          await createLabel(essential, false);
        } catch (error) {
          console.error('[useDocumentTemplateLabels] Error creating essential label:', essential.name, error);
        }
      }
    }
  };

  const createLabel = async (labelData: { name: string; color: string }, showToast = true) => {
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

      await fetchLabels();
      
      if (showToast) {
        toast({
          title: "Label aangemaakt",
          description: `Label "${labelData.name}" is aangemaakt`
        });
      }

      return data;
    } catch (error) {
      console.error('Error creating label:', error);
      if (showToast) {
        toast({
          title: "Fout bij aanmaken",
          description: "Kon label niet aanmaken",
          variant: "destructive"
        });
      }
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
      // Check ALL templates (including inactive ones) that use this label
      const { data: assignments } = await supabase
        .from('document_template_label_assignments')
        .select(`
          template_id,
          document_templates!inner (
            id,
            name,
            is_active,
            organization_id
          )
        `)
        .eq('label_id', id);

      console.log('[useDocumentTemplateLabels] Label assignments check:', assignments);

      if (assignments && assignments.length > 0) {
        // Filter for assignments that belong to current organization
        const orgAssignments = assignments.filter(assignment => 
          (assignment as any).document_templates?.organization_id === selectedOrganization?.id
        );

        if (orgAssignments.length > 0) {
          const activeTemplates = orgAssignments.filter(assignment => 
            (assignment as any).document_templates?.is_active !== false
          );
          
          const inactiveTemplates = orgAssignments.filter(assignment => 
            (assignment as any).document_templates?.is_active === false
          );

          let message = `Dit label wordt gebruikt door ${orgAssignments.length} template(s)`;
          
          if (activeTemplates.length > 0) {
            message += ` (${activeTemplates.length} actief`;
            if (inactiveTemplates.length > 0) {
              message += `, ${inactiveTemplates.length} inactief`;
            }
            message += ')';
          } else if (inactiveTemplates.length > 0) {
            message += ` (allemaal inactief)`;
          }
          
          message += ' en kan niet worden verwijderd. ';
          
          if (inactiveTemplates.length > 0) {
            message += 'Er zijn verborgen/inactieve templates die dit label gebruiken. ';
          }
          
          message += 'Verwijder eerst het label van alle templates.';

          toast({
            title: "Kan label niet verwijderen",
            description: message,
            variant: "destructive"
          });
          return;
        }

        // If there are assignments but none belong to current org, clean them up
        console.log('[useDocumentTemplateLabels] Found cross-organization assignments, cleaning up...');
        await supabase
          .from('document_template_label_assignments')
          .delete()
          .eq('label_id', id);
      }

      // Now delete the label
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
        title: "Fout bij verwijderen",
        description: "Kon label niet verwijderen",
        variant: "destructive"
      });
      throw error;
    }
  };

  const assignLabelToTemplate = async (templateId: string, labelId: string) => {
    if (!selectedOrganization) {
      throw new Error('Geen organisatie geselecteerd');
    }

    try {
      // Verify that both template and label belong to the same organization
      const { data: templateData } = await supabase
        .from('document_templates')
        .select('organization_id')
        .eq('id', templateId)
        .single();

      const { data: labelData } = await supabase
        .from('document_template_labels')
        .select('organization_id')
        .eq('id', labelId)
        .single();

      if (templateData?.organization_id !== labelData?.organization_id || 
          templateData?.organization_id !== selectedOrganization.id) {
        throw new Error('Template en label moeten van dezelfde organisatie zijn');
      }

      // Check if assignment already exists
      const { data: existing } = await supabase
        .from('document_template_label_assignments')
        .select('id')
        .eq('template_id', templateId)
        .eq('label_id', labelId)
        .single();

      if (existing) {
        console.log('[useDocumentTemplateLabels] Label already assigned to template');
        return;
      }

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
