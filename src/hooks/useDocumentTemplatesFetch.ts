
import { supabase } from '@/integrations/supabase/client';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { useDocumentTemplatesAccess } from './useDocumentTemplatesAccess';

export const useDocumentTemplatesFetch = () => {
  const { checkUserAccess } = useDocumentTemplatesAccess();

  const fetchTemplates = async (): Promise<DocumentTemplateWithLabels[]> => {
    try {
      console.log('[useDocumentTemplatesFetch] Fetching templates with optimized JOIN query...');
      
      const { organization } = await checkUserAccess();
      
      // Single optimized query using JOIN to get templates with their labels
      const { data: templatesWithLabels, error } = await supabase
        .from('document_templates')
        .select(`
          *,
          document_template_label_assignments!inner (
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
        console.error('[useDocumentTemplatesFetch] JOIN query error:', error);
        throw error;
      }

      // Also get templates without any labels
      const { data: templatesWithoutLabels, error: templatesError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .eq('organization_id', organization.id)
        .not('id', 'in', `(${(templatesWithLabels || []).map(t => `'${t.id}'`).join(',') || "''"})`)
        .order('created_at', { ascending: true });

      if (templatesError) {
        console.error('[useDocumentTemplatesFetch] Templates without labels error:', templatesError);
        throw templatesError;
      }

      // Process templates with labels
      const processedTemplatesWithLabels: DocumentTemplateWithLabels[] = (templatesWithLabels || []).map(template => {
        // Extract labels from the nested structure
        const labels = template.document_template_label_assignments
          ?.map((assignment: any) => assignment.document_template_labels)
          .filter(Boolean) || [];

        return {
          ...template,
          placeholder_values: template.placeholder_values ? 
            (typeof template.placeholder_values === 'object' && template.placeholder_values !== null ? 
              template.placeholder_values as Record<string, string> : null) : null,
          labels: labels,
          document_template_label_assignments: undefined // Remove the nested structure
        };
      });

      // Process templates without labels
      const processedTemplatesWithoutLabels: DocumentTemplateWithLabels[] = (templatesWithoutLabels || []).map(template => ({
        ...template,
        placeholder_values: template.placeholder_values ? 
          (typeof template.placeholder_values === 'object' && template.placeholder_values !== null ? 
            template.placeholder_values as Record<string, string> : null) : null,
        labels: []
      }));

      // Combine and sort all templates
      const allTemplates = [...processedTemplatesWithLabels, ...processedTemplatesWithoutLabels]
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      console.log('[useDocumentTemplatesFetch] Templates fetched with optimized query:', allTemplates.length);
      return allTemplates;
    } catch (error) {
      console.error('[useDocumentTemplatesFetch] Error fetching templates:', error);
      throw error;
    }
  };

  return { fetchTemplates };
};
