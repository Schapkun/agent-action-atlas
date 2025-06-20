
import { supabase } from '@/integrations/supabase/client';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { useDocumentTemplatesAccess } from './useDocumentTemplatesAccess';

export const useDocumentTemplatesFetch = () => {
  const { checkUserAccess } = useDocumentTemplatesAccess();

  const fetchTemplates = async (): Promise<DocumentTemplateWithLabels[]> => {
    try {
      console.log('[useDocumentTemplatesFetch] Fetching templates...');
      
      const { organization } = await checkUserAccess();
      
      // First get the templates - sorted by created_at ASC (oldest first)
      const { data: templatesData, error: templatesError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: true });

      if (templatesError) {
        console.error('[useDocumentTemplatesFetch] Fetch error:', templatesError);
        throw templatesError;
      }

      // Get labels for each template
      const templatesWithLabels: DocumentTemplateWithLabels[] = [];
      
      for (const template of templatesData || []) {
        const { data: labelAssignments } = await supabase
          .from('document_template_label_assignments')
          .select(`
            label_id,
            document_template_labels (
              id,
              name,
              color,
              organization_id,
              workspace_id,
              created_at,
              updated_at
            )
          `)
          .eq('template_id', template.id);

        const labels = labelAssignments?.map(assignment => assignment.document_template_labels).filter(Boolean) || [];

        templatesWithLabels.push({
          ...template,
          placeholder_values: template.placeholder_values ? 
            (typeof template.placeholder_values === 'object' && template.placeholder_values !== null ? 
              template.placeholder_values as Record<string, string> : null) : null,
          labels: labels as any[]
        });
      }
      
      console.log('[useDocumentTemplatesFetch] Templates fetched:', templatesWithLabels.length);
      return templatesWithLabels;
    } catch (error) {
      console.error('[useDocumentTemplatesFetch] Error fetching templates:', error);
      throw error;
    }
  };

  return { fetchTemplates };
};
