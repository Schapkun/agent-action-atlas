
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'factuur' | 'contract' | 'brief' | 'custom';
  description: string | null;
  html_content: string;
  organization_id: string | null;
  workspace_id: string | null;
  created_by: string | null;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useDocumentTemplates = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('document_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (selectedOrganization) {
        query = query.eq('organization_id', selectedOrganization.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
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
      const { data, error } = await supabase
        .from('document_templates')
        .insert({
          ...templateData,
          organization_id: selectedOrganization?.id || null,
          workspace_id: selectedWorkspace?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => [data, ...prev]);
      toast({
        title: "Succes",
        description: "Template succesvol aangemaakt"
      });

      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Fout",
        description: "Kon template niet aanmaken",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<DocumentTemplate>) => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTemplates(prev => prev.map(t => t.id === id ? data : t));
      toast({
        title: "Succes",
        description: "Template succesvol bijgewerkt"
      });

      return data;
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
      fetchTemplates();
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
