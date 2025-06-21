
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DocumentTemplateWithTags } from '@/types/documentTags';
import { useDocumentTemplatesFetch } from './useDocumentTemplatesFetch';
import { useDocumentTemplatesCreate } from './useDocumentTemplatesCreate';
import { useDocumentTemplatesUpdate } from './useDocumentTemplatesUpdate';
import { useDocumentTemplatesDelete } from './useDocumentTemplatesDelete';

export type { DocumentTemplate } from './useDocumentTemplatesCreate';

export const useDocumentTemplates = () => {
  const [templates, setTemplates] = useState<DocumentTemplateWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { selectedOrganization } = useOrganization();

  const { fetchTemplates: fetchTemplatesData } = useDocumentTemplatesFetch();
  const { createTemplate: createTemplateData } = useDocumentTemplatesCreate();
  const { updateTemplate: updateTemplateData, setTemplateFavorite: setTemplateFavoriteData } = useDocumentTemplatesUpdate();
  const { deleteTemplate: deleteTemplateData } = useDocumentTemplatesDelete();

  const organizationId = useMemo(() => selectedOrganization?.id, [selectedOrganization?.id]);

  const fetchTemplates = useCallback(async () => {
    if (!organizationId) {
      console.log('[useDocumentTemplates] No organization selected, clearing templates');
      setTemplates([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const templatesData = await fetchTemplatesData();
      setTemplates(templatesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Kon templates niet ophalen";
      console.error('[useDocumentTemplates] Error fetching templates:', err);
      setError(errorMessage);
      toast({
        title: "Fout bij laden",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [organizationId, fetchTemplatesData, toast]);

  const createTemplate = useCallback(async (templateData: Partial<any>) => {
    try {
      const result = await createTemplateData(templateData);
      await fetchTemplates();
      return result;
    } catch (err) {
      console.error('[useDocumentTemplates] Error creating template:', err);
      throw err;
    }
  }, [createTemplateData, fetchTemplates]);

  const updateTemplate = useCallback(async (id: string, updates: Partial<any>) => {
    try {
      const result = await updateTemplateData(id, updates);
      await fetchTemplates();
      return result;
    } catch (err) {
      console.error('[useDocumentTemplates] Error updating template:', err);
      throw err;
    }
  }, [updateTemplateData, fetchTemplates]);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      await deleteTemplateData(id);
      await fetchTemplates();
    } catch (err) {
      console.error('[useDocumentTemplates] Error deleting template:', err);
      throw err;
    }
  }, [deleteTemplateData, fetchTemplates]);

  const setTemplateFavorite = useCallback(async (templateId: string, isFavorite: boolean) => {
    try {
      await setTemplateFavoriteData(templateId, isFavorite);
      await fetchTemplates();
    } catch (err) {
      console.error('[useDocumentTemplates] Error setting template favorite:', err);
      throw err;
    }
  }, [setTemplateFavoriteData, fetchTemplates]);

  const refreshTemplates = useCallback(() => {
    console.log('[useDocumentTemplates] Manual refresh requested');
    return fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (organizationId) {
      fetchTemplates();
    }
  }, [organizationId]);

  return {
    templates,
    loading,
    error,
    fetchTemplates: refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    setTemplateFavorite
  };
};
