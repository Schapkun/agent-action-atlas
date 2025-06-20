import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { useDocumentTemplatesFetch } from './useDocumentTemplatesFetch';
import { useDocumentTemplatesCreate } from './useDocumentTemplatesCreate';
import { useDocumentTemplatesUpdate } from './useDocumentTemplatesUpdate';
import { useDocumentTemplatesDelete } from './useDocumentTemplatesDelete';

export type { DocumentTemplate } from './useDocumentTemplatesCreate';

export const useDocumentTemplates = () => {
  const [templates, setTemplates] = useState<DocumentTemplateWithLabels[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const { fetchTemplates: fetchTemplatesData } = useDocumentTemplatesFetch();
  const { createTemplate: createTemplateData } = useDocumentTemplatesCreate();
  const { updateTemplate: updateTemplateData, setTemplateFavorite: setTemplateFavoriteData } = useDocumentTemplatesUpdate();
  const { deleteTemplate: deleteTemplateData } = useDocumentTemplatesDelete();

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await fetchTemplatesData();
      setTemplates(templatesData);
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

  const createTemplate = async (templateData: Partial<any> & { labelIds?: string[] }) => {
    const result = await createTemplateData(templateData);
    // Refresh templates to get updated data with labels
    await fetchTemplates();
    return result;
  };

  const updateTemplate = async (id: string, updates: Partial<any> & { labelIds?: string[] }) => {
    const result = await updateTemplateData(id, updates);
    // Refresh templates to get updated data with labels
    await fetchTemplates();
    return result;
  };

  const deleteTemplate = async (id: string) => {
    await deleteTemplateData(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const setTemplateFavorite = async (templateId: string, isFavorite: boolean) => {
    await setTemplateFavoriteData(templateId, isFavorite);
    // Refresh templates to show updated favorite status
    await fetchTemplates();
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
    deleteTemplate,
    setTemplateFavorite
  };
};
