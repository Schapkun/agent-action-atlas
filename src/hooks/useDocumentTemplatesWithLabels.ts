import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DocumentTemplateWithLabels } from '@/types/documentTemplateLabels';

export const useDocumentTemplatesWithLabels = () => {
  const [templates, setTemplates] = useState<DocumentTemplateWithLabels[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization } = useOrganization();

  const fetchTemplatesWithLabels = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch all templates with their labels using LEFT JOIN
      const { data: templatesData, error: templatesError } = await supabase
        .from('document_templates')
        .select(`
          *,
          document_template_label_assignments(
            document_template_labels(*)
          )
        `)
        .eq('organization_id', selectedOrganization.id)
        .eq('is_active', true);

      if (templatesError) throw templatesError;

      // Transform the data to include labels
      const templatesWithLabels: DocumentTemplateWithLabels[] = (templatesData || []).map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        html_content: template.html_content,
        organization_id: template.organization_id,
        workspace_id: template.workspace_id,
        created_by: template.created_by,
        is_default: template.is_default,
        is_active: template.is_active,
        created_at: template.created_at,
        updated_at: template.updated_at,
        placeholder_values: template.placeholder_values,
        type: template.type,
        tags: template.tags || [],
        labels: (template as any).document_template_label_assignments?.map((assignment: any) => assignment.document_template_labels).filter(Boolean) || []
      }));

      setTemplates(templatesWithLabels);
    } catch (error) {
      console.error('Error fetching templates with labels:', error);
      toast({
        title: "Fout",
        description: "Kon templates niet laden",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization?.id, toast]);

  const assignLabelToTemplate = useCallback(async (templateId: string, labelId: string) => {
    try {
      const { error } = await supabase
        .from('document_template_label_assignments')
        .insert({
          template_id: templateId,
          label_id: labelId
        });

      if (error) throw error;
      
      await fetchTemplatesWithLabels();
      toast({
        title: "Label toegewezen",
        description: "Label is toegewezen aan template"
      });
    } catch (error) {
      console.error('Error assigning label:', error);
      toast({
        title: "Fout",
        description: "Kon label niet toewijzen",
        variant: "destructive"
      });
      throw error;
    }
  }, [fetchTemplatesWithLabels, toast]);

  const removeLabelFromTemplate = useCallback(async (templateId: string, labelId: string) => {
    try {
      const { error } = await supabase
        .from('document_template_label_assignments')
        .delete()
        .eq('template_id', templateId)
        .eq('label_id', labelId);

      if (error) throw error;
      
      await fetchTemplatesWithLabels();
      toast({
        title: "Label verwijderd",
        description: "Label is verwijderd van template"
      });
    } catch (error) {
      console.error('Error removing label:', error);
      toast({
        title: "Fout",
        description: "Kon label niet verwijderen",
        variant: "destructive"
      });
      throw error;
    }
  }, [fetchTemplatesWithLabels, toast]);

  useEffect(() => {
    fetchTemplatesWithLabels();
  }, [fetchTemplatesWithLabels]);

  return {
    templates,
    loading,
    assignLabelToTemplate,
    removeLabelFromTemplate,
    refetch: fetchTemplatesWithLabels
  };
};
