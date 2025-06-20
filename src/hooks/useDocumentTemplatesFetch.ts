
import { supabase } from '@/integrations/supabase/client';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { useDocumentTemplatesAccess } from './useDocumentTemplatesAccess';

export const useDocumentTemplatesFetch = () => {
  const { checkUserAccess } = useDocumentTemplatesAccess();

  const fetchTemplates = async (): Promise<DocumentTemplateWithLabels[]> => {
    try {
      console.log('[useDocumentTemplatesFetch] Fetching templates with optimized query...');
      
      const { organization } = await checkUserAccess();
      
      if (!organization?.id) {
        console.warn('[useDocumentTemplatesFetch] No valid organization ID');
        return [];
      }

      // Single optimized query using LEFT JOIN to get all templates with their labels
      const { data: templateData, error } = await supabase
        .from('document_templates')
        .select(`
          id,
          name,
          description,
          html_content,
          placeholder_values,
          type,
          is_active,
          is_default,
          organization_id,
          workspace_id,
          created_by,
          created_at,
          updated_at,
          document_template_label_assignments (
            document_template_labels (
              id,
              name,
              color,
              organization_id,
              workspace_id,
              created_at,
              updated_at
            )
          )
        `)
        .eq('is_active', true)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[useDocumentTemplatesFetch] Query error:', error);
        throw error;
      }

      // Transform the data to the correct format
      const templatesWithLabels: DocumentTemplateWithLabels[] = (templateData || []).map(template => {
        // Extract labels from the nested structure
        const labels = template.document_template_label_assignments
          ?.map((assignment: any) => assignment.document_template_labels)
          .filter(Boolean) || [];

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          html_content: template.html_content,
          placeholder_values: template.placeholder_values ? 
            (typeof template.placeholder_values === 'object' && template.placeholder_values !== null ? 
              template.placeholder_values as Record<string, string> : null) : null,
          type: template.type,
          is_active: template.is_active,
          is_default: template.is_default,
          organization_id: template.organization_id,
          workspace_id: template.workspace_id,
          created_by: template.created_by,
          created_at: template.created_at,
          updated_at: template.updated_at,
          labels: labels
        };
      });
      
      console.log('[useDocumentTemplatesFetch] Templates fetched efficiently:', templatesWithLabels.length);
      return templatesWithLabels;
    } catch (error) {
      console.error('[useDocumentTemplatesFetch] Error fetching templates:', error);
      throw error;
    }
  };

  return { fetchTemplates };
};
