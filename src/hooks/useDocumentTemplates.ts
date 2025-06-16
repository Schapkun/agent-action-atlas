
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

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
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Enhanced access check with better error messages
  const checkUserAccess = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Je bent niet ingelogd');
      }

      if (!selectedOrganization) {
        throw new Error('Geen organisatie geselecteerd');
      }

      // Check organization membership
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', selectedOrganization.id)
        .eq('user_id', user.id)
        .single();

      if (membershipError || !membership) {
        throw new Error('Geen toegang tot deze organisatie');
      }

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
      
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useDocumentTemplates] Fetch error:', error);
        throw error;
      }
      
      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: item.placeholder_values ? 
          (typeof item.placeholder_values === 'object' && item.placeholder_values !== null ? 
            item.placeholder_values as Record<string, string> : null) : null
      }));
      
      console.log('[useDocumentTemplates] Templates fetched:', transformedData.length);
      setTemplates(transformedData);
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

  const createTemplate = async (templateData: Partial<DocumentTemplate>) => {
    try {
      console.log('[useDocumentTemplates] Creating template:', templateData.name);
      
      const { user, organization } = await checkUserAccess();
      
      // Validate required fields
      if (!templateData.name?.trim()) {
        throw new Error('Documentnaam is verplicht');
      }

      if (!templateData.html_content?.trim()) {
        throw new Error('HTML content is verplicht');
      }
      
      const insertData = {
        name: templateData.name.trim(),
        type: templateData.type || 'custom',
        description: templateData.description || null,
        html_content: templateData.html_content,
        organization_id: organization.id,
        workspace_id: selectedWorkspace?.id || null,
        created_by: user.id,
        is_default: templateData.is_default || false,
        is_active: true,
        placeholder_values: templateData.placeholder_values || null,
      };

      console.log('[useDocumentTemplates] Inserting data:', {
        ...insertData,
        html_content: `${insertData.html_content.substring(0, 50)}...`
      });

      const { data, error } = await supabase
        .from('document_templates')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTemplates] Insert error:', error);
        throw new Error(`Kon template niet aanmaken: ${error.message}`);
      }

      if (!data) {
        throw new Error('Template werd aangemaakt maar er werd geen data teruggestuurd');
      }

      const newTemplate: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      
      toast({
        title: "Succes",
        description: `Template "${newTemplate.name}" is aangemaakt`,
      });
      
      return newTemplate;
    } catch (error) {
      console.error('[useDocumentTemplates] Create error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout bij aanmaken",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<DocumentTemplate>) => {
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

      const updatedTemplate: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };
      
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      
      console.log('[useDocumentTemplates] Template updated successfully');
      
      return updatedTemplate;
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
