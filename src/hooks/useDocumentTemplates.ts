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
      console.log('🔄 Fetching templates for organization:', selectedOrganization?.id);
      
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
        console.error('❌ Error fetching templates:', error);
        throw error;
      }
      
      // Transform the data to ensure proper typing
      const transformedData = (data || []).map(item => ({
        ...item,
        type: item.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: item.placeholder_values ? 
          (typeof item.placeholder_values === 'object' && item.placeholder_values !== null ? 
            item.placeholder_values as Record<string, string> : null) : null
      }));
      
      console.log('✅ Templates fetched successfully:', transformedData.length);
      setTemplates(transformedData);
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
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
      console.log('🆕 Creating new template:', templateData);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Ensure required fields are present
      const insertData = {
        name: templateData.name || '',
        type: templateData.type || 'custom',
        description: templateData.description || null,
        html_content: templateData.html_content || '',
        organization_id: selectedOrganization?.id || null,
        workspace_id: selectedWorkspace?.id || null,
        created_by: user?.id || null,
        is_default: templateData.is_default || false,
        is_active: templateData.is_active !== false, // Default to true
        placeholder_values: templateData.placeholder_values || null,
      };

      console.log('📝 Insert data:', insertData);

      const { data, error } = await supabase
        .from('document_templates')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      const newTemplate: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };
      
      setTemplates(prev => [newTemplate, ...prev]);
      
      console.log('✅ Template created successfully:', newTemplate.id);
      
      toast({
        title: "Succes",
        description: "Template succesvol aangemaakt"
      });

      return newTemplate;
    } catch (error) {
      console.error('❌ Error creating template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      toast({
        title: "Fout",
        description: "Kon template niet aanmaken: " + errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<DocumentTemplate>) => {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        placeholder_values: updates.placeholder_values || null,
      };

      const { data, error } = await supabase
        .from('document_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTemplate: DocumentTemplate = {
        ...data,
        type: data.type as 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun',
        placeholder_values: data.placeholder_values ? 
          (typeof data.placeholder_values === 'object' && data.placeholder_values !== null ? 
            data.placeholder_values as Record<string, string> : null) : null
      };
      
      setTemplates(prev => prev.map(t => t.id === id ? updatedTemplate : t));
      
      toast({
        title: "Succes",
        description: "Template succesvol bijgewerkt"
      });

      return updatedTemplate;
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Fout",
        description: "Kon template niet bijwerken",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Succes",
        description: "Template succesvol verwijderd"
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Fout",
        description: "Kon template niet verwijderen",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    if (selectedOrganization) {
      console.log('🔄 Organization changed, fetching templates');
      fetchTemplates();
    } else {
      console.log('⏹️ No organization selected, clearing templates');
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
