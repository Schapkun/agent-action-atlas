
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentTemplateWithTags } from '@/types/documentTags';
import { useDocumentTemplatesAccess } from './useDocumentTemplatesAccess';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string | null;
  html_content: string;
  organization_id: string | null;
  workspace_id: string | null;
  created_by: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  placeholder_values?: Record<string, string> | null;
  tags?: string[]; // Changed from labels to tags
}

export const useDocumentTemplatesCreate = () => {
  const { toast } = useToast();
  const { checkUserAccess } = useDocumentTemplatesAccess();

  const createTemplate = async (templateData: Partial<DocumentTemplate> & { tags?: string[] }): Promise<DocumentTemplateWithTags> => {
    try {
      console.log('[useDocumentTemplatesCreate] ========= CREATE TEMPLATE START =========');
      console.log('[useDocumentTemplatesCreate] Template data received:', {
        name: templateData.name,
        htmlContentLength: templateData.html_content?.length,
        placeholderValuesKeys: templateData.placeholder_values ? Object.keys(templateData.placeholder_values) : [],
        hasDescription: !!templateData.description,
        tags: templateData.tags
      });
      
      const { user, organization, workspace } = await checkUserAccess();
      
      // Enhanced validation
      if (!templateData.name?.trim()) {
        const error = 'Documentnaam is verplicht';
        console.error('[useDocumentTemplatesCreate] Validation error:', error);
        throw new Error(error);
      }

      if (templateData.name.trim().length < 2) {
        const error = 'Documentnaam moet minimaal 2 karakters bevatten';
        console.error('[useDocumentTemplatesCreate] Validation error:', error);
        throw new Error(error);
      }

      if (!templateData.html_content?.trim()) {
        const error = 'HTML content is verplicht';
        console.error('[useDocumentTemplatesCreate] Validation error:', error);
        throw new Error(error);
      }

      // Check for duplicate names
      console.log('[useDocumentTemplatesCreate] Checking for duplicate names...');
      const { data: existingTemplates, error: duplicateCheckError } = await supabase
        .from('document_templates')
        .select('name')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .ilike('name', templateData.name.trim());

      if (duplicateCheckError) {
        console.error('[useDocumentTemplatesCreate] Duplicate check error:', duplicateCheckError);
        throw new Error(`Fout bij controleren duplicaten: ${duplicateCheckError.message}`);
      }

      if (existingTemplates && existingTemplates.length > 0) {
        const error = `Een document met de naam "${templateData.name.trim()}" bestaat al`;
        console.error('[useDocumentTemplatesCreate] Duplicate name error:', error);
        throw new Error(error);
      }
      
      const insertData = {
        name: templateData.name.trim(),
        description: templateData.description?.trim() || null,
        html_content: templateData.html_content.trim(),
        type: 'custom',
        organization_id: organization.id,
        workspace_id: workspace?.id || null,
        created_by: user.id,
        is_default: templateData.is_default || false,
        is_active: true,
        placeholder_values: templateData.placeholder_values || null,
        tags: templateData.tags || []
      };

      console.log('[useDocumentTemplatesCreate] Final insert data:', {
        ...insertData,
        html_content: `${insertData.html_content.substring(0, 100)}...`,
        placeholder_values: insertData.placeholder_values ? Object.keys(insertData.placeholder_values) : null
      });

      console.log('[useDocumentTemplatesCreate] Attempting database insert...');
      const { data, error } = await supabase
        .from('document_templates')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTemplatesCreate] Database insert error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database fout: ${error.message}`);
      }

      if (!data) {
        console.error('[useDocumentTemplatesCreate] No data returned from insert');
        throw new Error('Template werd aangemaakt maar er werd geen data teruggestuurd');
      }

      console.log('[useDocumentTemplatesCreate] Insert successful:', data.id);

      const newTemplate: DocumentTemplateWithTags = {
        ...data,
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null,
        tags: Array.isArray(data.tags) ? data.tags : []
      };
      
      toast({
        title: "Succes",
        description: `Template "${newTemplate.name}" is aangemaakt`,
      });
      
      console.log('[useDocumentTemplatesCreate] ========= CREATE TEMPLATE SUCCESS =========');
      return newTemplate;
    } catch (error) {
      console.error('[useDocumentTemplatesCreate] ========= CREATE TEMPLATE ERROR =========');
      console.error('[useDocumentTemplatesCreate] Create error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout bij aanmaken",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return { createTemplate };
};
