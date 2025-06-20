
import { supabase } from '@/integrations/supabase/client';
import { DocumentTemplateWithTags } from '@/types/documentTags';
import { useDocumentTemplatesAccess } from './useDocumentTemplatesAccess';

export const useDocumentTemplatesFetch = () => {
  const { checkUserAccess } = useDocumentTemplatesAccess();

  const fetchTemplates = async (): Promise<DocumentTemplateWithTags[]> => {
    try {
      console.log('[useDocumentTemplatesFetch] Fetching templates...');
      
      const { organization } = await checkUserAccess();
      
      if (!organization?.id) {
        console.warn('[useDocumentTemplatesFetch] No valid organization ID');
        return [];
      }

      // Simple query without complex joins
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
          tags
        `)
        .eq('is_active', true)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[useDocumentTemplatesFetch] Query error:', error);
        throw error;
      }

      // Transform to ensure tags is always an array
      const templatesWithTags: DocumentTemplateWithTags[] = (templateData || []).map(template => ({
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
        tags: Array.isArray(template.tags) ? template.tags : []
      }));
      
      console.log('[useDocumentTemplatesFetch] Templates fetched:', templatesWithTags.length);
      return templatesWithTags;
    } catch (error) {
      console.error('[useDocumentTemplatesFetch] Error fetching templates:', error);
      throw error;
    }
  };

  return { fetchTemplates };
};
