
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
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
}

export const useDocumentTemplates = () => {
  const [templates, setTemplates] = useState<DocumentTemplateWithLabels[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Enhanced access check with better error messages
  const checkUserAccess = async () => {
    try {
      console.log('[useDocumentTemplates] Starting access check...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('[useDocumentTemplates] User check result:', { user: !!user, error: userError });
      
      if (userError || !user) {
        throw new Error('Je bent niet ingelogd');
      }

      if (!selectedOrganization) {
        throw new Error('Geen organisatie geselecteerd');
      }

      console.log('[useDocumentTemplates] Checking organization membership for:', {
        userId: user.id,
        orgId: selectedOrganization.id
      });

      // Check organization membership
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', selectedOrganization.id)
        .eq('user_id', user.id)
        .single();

      console.log('[useDocumentTemplates] Membership check result:', { membership, error: membershipError });

      if (membershipError || !membership) {
        throw new Error('Geen toegang tot deze organisatie');
      }

      console.log('[useDocumentTemplates] Access check successful');
      return { user, organization: selectedOrganization };
    } catch (error) {
      console.error('[useDocumentTemplates] Access check failed:', error);
      throw error;
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('[useDocumentTemplates] Fetching templates...');
      
      const { organization } = await checkUserAccess();
      
      // First get the templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (templatesError) {
        console.error('[useDocumentTemplates] Fetch error:', templatesError);
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
          type: template.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
          placeholder_values: template.placeholder_values ? 
            (typeof template.placeholder_values === 'object' && template.placeholder_values !== null ? 
              template.placeholder_values as Record<string, string> : null) : null,
          labels: labels as any[]
        });
      }
      
      console.log('[useDocumentTemplates] Templates fetched:', templatesWithLabels.length);
      setTemplates(templatesWithLabels);
    } catch (error) {
      console.error('[useDocumentTemplates] Error fetching templates:', error);
      toast({
        title: "Fout bij laden",
        description: error instanceof Error ? error.message : "Kon templates niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Partial<DocumentTemplate> & { labelIds?: string[] }) => {
    try {
      console.log('[useDocumentTemplates] ========= CREATE TEMPLATE START =========');
      console.log('[useDocumentTemplates] Template data received:', {
        name: templateData.name,
        type: templateData.type,
        htmlContentLength: templateData.html_content?.length,
        placeholderValuesKeys: templateData.placeholder_values ? Object.keys(templateData.placeholder_values) : [],
        hasDescription: !!templateData.description,
        labelIds: templateData.labelIds
      });
      
      const { user, organization } = await checkUserAccess();
      
      // Enhanced validation
      if (!templateData.name?.trim()) {
        const error = 'Documentnaam is verplicht';
        console.error('[useDocumentTemplates] Validation error:', error);
        throw new Error(error);
      }

      if (templateData.name.trim().length < 2) {
        const error = 'Documentnaam moet minimaal 2 karakters bevatten';
        console.error('[useDocumentTemplates] Validation error:', error);
        throw new Error(error);
      }

      if (!templateData.html_content?.trim()) {
        const error = 'HTML content is verplicht';
        console.error('[useDocumentTemplates] Validation error:', error);
        throw new Error(error);
      }

      // Check for duplicate names
      console.log('[useDocumentTemplates] Checking for duplicate names...');
      const { data: existingTemplates, error: duplicateCheckError } = await supabase
        .from('document_templates')
        .select('name')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .ilike('name', templateData.name.trim());

      if (duplicateCheckError) {
        console.error('[useDocumentTemplates] Duplicate check error:', duplicateCheckError);
        throw new Error(`Fout bij controleren duplicaten: ${duplicateCheckError.message}`);
      }

      if (existingTemplates && existingTemplates.length > 0) {
        const error = `Een document met de naam "${templateData.name.trim()}" bestaat al`;
        console.error('[useDocumentTemplates] Duplicate name error:', error);
        throw new Error(error);
      }
      
      const insertData = {
        name: templateData.name.trim(),
        type: templateData.type || 'custom',
        description: templateData.description?.trim() || null,
        html_content: templateData.html_content.trim(),
        organization_id: organization.id,
        workspace_id: selectedWorkspace?.id || null,
        created_by: user.id,
        is_default: templateData.is_default || false,
        is_active: true,
        placeholder_values: templateData.placeholder_values || null,
      };

      console.log('[useDocumentTemplates] Final insert data:', {
        ...insertData,
        html_content: `${insertData.html_content.substring(0, 100)}...`,
        placeholder_values: insertData.placeholder_values ? Object.keys(insertData.placeholder_values) : null
      });

      console.log('[useDocumentTemplates] Attempting database insert...');
      const { data, error } = await supabase
        .from('document_templates')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTemplates] Database insert error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Database fout: ${error.message}`);
      }

      if (!data) {
        console.error('[useDocumentTemplates] No data returned from insert');
        throw new Error('Template werd aangemaakt maar er werd geen data teruggestuurd');
      }

      // Assign labels if provided
      if (templateData.labelIds && templateData.labelIds.length > 0) {
        for (const labelId of templateData.labelIds) {
          await supabase
            .from('document_template_label_assignments')
            .insert({
              template_id: data.id,
              label_id: labelId
            });
        }
      }

      console.log('[useDocumentTemplates] Insert successful:', data.id);

      const newTemplate: DocumentTemplateWithLabels = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null,
        labels: []
      };
      
      // Refresh templates to get updated data with labels
      await fetchTemplates();
      
      toast({
        title: "Succes",
        description: `Template "${newTemplate.name}" is aangemaakt`,
      });
      
      console.log('[useDocumentTemplates] ========= CREATE TEMPLATE SUCCESS =========');
      return newTemplate;
    } catch (error) {
      console.error('[useDocumentTemplates] ========= CREATE TEMPLATE ERROR =========');
      console.error('[useDocumentTemplates] Create error details:', {
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

  const updateTemplate = async (id: string, updates: Partial<DocumentTemplate> & { labelIds?: string[] }) => {
    try {
      console.log('[useDocumentTemplates] Updating template:', id);
      
      const { organization } = await checkUserAccess();

      if (updates.name !== undefined && !updates.name.trim()) {
        throw new Error('Documentnaam is verplicht');
      }

      if (updates.html_content !== undefined && !updates.html_content.trim()) {
        throw new Error('HTML content is verplicht');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        placeholder_values: updates.placeholder_values || null,
      };

      // Remove labelIds from update data as it's not a column
      delete (updateData as any).labelIds;

      const { data, error } = await supabase
        .from('document_templates')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', organization.id)
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTemplates] Update error:', error);
        throw new Error(`Kon template niet bijwerken: ${error.message}`);
      }

      if (!data) {
        throw new Error('Template niet gevonden of geen toegang');
      }

      // Update labels if provided
      if (updates.labelIds !== undefined) {
        // First remove all existing label assignments
        await supabase
          .from('document_template_label_assignments')
          .delete()
          .eq('template_id', id);

        // Then add new ones
        if (updates.labelIds.length > 0) {
          for (const labelId of updates.labelIds) {
            await supabase
              .from('document_template_label_assignments')
              .insert({
                template_id: id,
                label_id: labelId
              });
          }
        }
      }

      // Refresh templates to get updated data with labels
      await fetchTemplates();
      
      console.log('[useDocumentTemplates] Template updated successfully');
      
      return data;
    } catch (error) {
      console.error('[useDocumentTemplates] Update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout bij bijwerken",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      console.log('[useDocumentTemplates] Deleting template:', id);
      
      const { organization } = await checkUserAccess();
      
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
        .eq('id', id)
        .eq('organization_id', organization.id);

      if (error) {
        console.error('[useDocumentTemplates] Delete error:', error);
        throw new Error(`Kon template niet verwijderen: ${error.message}`);
      }

      setTemplates(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Succes",
        description: "Template succesvol verwijderd"
      });
    } catch (error) {
      console.error('[useDocumentTemplates] Delete error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout bij verwijderen",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  useEffect(() => {
    if (selectedOrganization) {
      console.log('[useDocumentTemplates] Organization changed, fetching templates');
      fetchTemplates();
    } else {
      console.log('[useDocumentTemplates] No organization selected, clearing templates');
      setTemplates([]);
      setLoading(false);
    }
  }, [selectedOrganization, selectedWorkspace]);

  return {
    templates,
    loading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate
  };
};
