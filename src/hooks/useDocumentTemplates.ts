
import { useState, useEffect, useCallback } from 'react';
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
  const { selectedOrganization } = useOrganization();

  const { fetchTemplates: fetchTemplatesData } = useDocumentTemplatesFetch();
  const { createTemplate: createTemplateData } = useDocumentTemplatesCreate();
  const { updateTemplate: updateTemplateData, setTemplateFavorite: setTemplateFavoriteData } = useDocumentTemplatesUpdate();
  const { deleteTemplate: deleteTemplateData } = useDocumentTemplatesDelete();

  const fetchTemplates = useCallback(async () => {
    if (!selectedOrganization) {
      console.log('[useDocumentTemplates] No organization selected, clearing templates');
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('[useDocumentTemplates] Fetching templates for organization:', selectedOrganization.id);
      const templatesData = await fetchTemplatesData();
      console.log('[useDocumentTemplates] Fetched templates:', templatesData.length);
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
  }, [selectedOrganization, fetchTemplatesData, toast]);

  const createTemplate = async (templateData: Partial<any> & { labelIds?: string[] }) => {
    const result = await createTemplateData(templateData);
    await fetchTemplates();
    return result;
  };

  const updateTemplate = async (id: string, updates: Partial<any> & { labelIds?: string[] }) => {
    const result = await updateTemplateData(id, updates);
    await fetchTemplates();
    return result;
  };

  const deleteTemplate = async (id: string) => {
    await deleteTemplateData(id);
    await fetchTemplates();
  };

  const setTemplateFavorite = async (templateId: string, isFavorite: boolean) => {
    await setTemplateFavoriteData(templateId, isFavorite);
    await fetchTemplates();
  };

  // Manual refresh function for external use
  const refreshTemplates = useCallback(() => {
    console.log('[useDocumentTemplates] Manual refresh requested');
    return fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    fetchTemplates: refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setTemplateFavorite
  };
};
