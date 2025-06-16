
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

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('[useDocumentTemplates] Fetching templates for organization:', selectedOrganization?.id);
      
      let query = supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedOrganization) {
        query = query.eq('organization_id', selectedOrganization.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[useDocumentTemplates] Database error:', error);
        throw error;
      }
      
      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: item.placeholder_values ? 
          (typeof item.placeholder_values === 'object' && item.placeholder_values !== null ? 
            item.placeholder_values as Record<string, string> : null) : null
      }));
      
      console.log('[useDocumentTemplates] Templates fetched successfully:', transformedData.length);
      setTemplates(transformedData);
    } catch (error) {
      console.error('[useDocumentTemplates] Error fetching templates:', error);
      toast({
        title: "Fout",
        description: "Kon templates niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: Partial<DocumentTemplate>) => {
    try {
      console.log('[useDocumentTemplates] Creating new template:', templateData.name);
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[useDocumentTemplates] Auth error:', userError);
        throw new Error('Gebruiker niet ingelogd');
      }
      
      if (!user) {
        throw new Error('Gebruiker niet gevonden');
      }

      // Check organization context
      if (!selectedOrganization) {
        throw new Error('Geen organisatie geselecteerd');
      }
      
      // Prepare insert data with all required fields
      const insertData = {
        name: templateData.name || '',
        type: templateData.type || 'custom',
        description: templateData.description || null,
        html_content: templateData.html_content || '',
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        created_by: user.id,
        is_default: templateData.is_default || false,
        is_active: templateData.is_active !== false,
        placeholder_values: templateData.placeholder_values || null,
      };

      console.log('[useDocumentTemplates] Insert data prepared:', {
        ...insertData,
        html_content: insertData.html_content.substring(0, 100) + '...'
      });

      // Validate required fields
      if (!insertData.name.trim()) {
        throw new Error('Documentnaam is verplicht');
      }

      const { data, error } = await supabase
        .from('document_templates')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTemplates] Database insert error:', error);
        
        // Provide specific error messages for common issues
        if (error.code === '23502') {
          throw new Error('Verplichte velden ontbreken');
        } else if (error.code === '23505') {
          throw new Error('Een template met deze naam bestaat al');
        } else {
          throw new Error(`Database fout: ${error.message}`);
        }
      }

      if (!data) {
        throw new Error('Geen data ontvangen van database');
      }

      const newTemplate: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      
      console.log('[useDocumentTemplates] Template created successfully:', newTemplate.id);
      
      toast({
        title: "Succes",
        description: "Template succesvol aangemaakt"
      });

      return newTemplate;
    } catch (error) {
      console.error('[useDocumentTemplates] Create template error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout",
        description: `Kon template niet aanmaken: ${errorMessage}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<DocumentTemplate>) => {
    try {
      console.log('[useDocumentTemplates] Updating template:', id);
      
      // Get current user for security
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Gebruiker niet ingelogd');
      }

      // Validate required fields
      if (updates.name !== undefined && !updates.name.trim()) {
        throw new Error('Documentnaam is verplicht');
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        placeholder_values: updates.placeholder_values || null,
      };

      console.log('[useDocumentTemplates] Update data:', {
        ...updateData,
        html_content: updateData.html_content ? updateData.html_content.substring(0, 100) + '...' : undefined
      });

      const { data, error } = await supabase
        .from('document_templates')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', selectedOrganization?.id) // Security check
        .select()
        .single();

      if (error) {
        console.error('[useDocumentTemplates] Database update error:', error);
        
        if (error.code === '23502') {
          throw new Error('Verplichte velden ontbreken');
        } else if (error.code === '23505') {
          throw new Error('Een template met deze naam bestaat al');
        } else {
          throw new Error(`Database fout: ${error.message}`);
        }
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
      
      toast({
        title: "Succes",
        description: "Template succesvol bijgewerkt"
      });

      return updatedTemplate;
    } catch (error) {
      console.error('[useDocumentTemplates] Update template error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout",
        description: `Kon template niet bijwerken: ${errorMessage}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      console.log('[useDocumentTemplates] Deleting template:', id);
      
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
        .eq('id', id)
        .eq('organization_id', selectedOrganization?.id); // Security check

      if (error) {
        console.error('[useDocumentTemplates] Delete error:', error);
        throw new Error(`Database fout: ${error.message}`);
      }

      setTemplates(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: "Succes",
        description: "Template succesvol verwijderd"
      });
    } catch (error) {
      console.error('[useDocumentTemplates] Delete template error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      
      toast({
        title: "Fout",
        description: `Kon template niet verwijderen: ${errorMessage}`,
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
