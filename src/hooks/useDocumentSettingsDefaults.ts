
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { DocumentTemplateLabel } from '@/types/documentTemplateLabels';

interface DocumentSettingsDefaults {
  defaultLabels: Record<string, DocumentTemplateLabel>;
  loading: boolean;
}

export const useDocumentSettingsDefaults = () => {
  const [defaultLabels, setDefaultLabels] = useState<Record<string, DocumentTemplateLabel>>({});
  const [loading, setLoading] = useState(true);
  const { selectedOrganization } = useOrganization();

  const fetchDefaults = useCallback(async () => {
    if (!selectedOrganization?.id) {
      setDefaultLabels({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('document_settings')
        .select(`
          document_type,
          default_label_id,
          default_label:document_template_labels!default_label_id(*)
        `)
        .eq('organization_id', selectedOrganization.id);

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const labelsMap: Record<string, DocumentTemplateLabel> = {};
      
      if (data) {
        data.forEach((setting) => {
          if (setting.default_label) {
            labelsMap[setting.document_type] = setting.default_label;
          }
        });
      }

      setDefaultLabels(labelsMap);
    } catch (error) {
      console.error('Error fetching document settings defaults:', error);
      setDefaultLabels({});
    } finally {
      setLoading(false);
    }
  }, [selectedOrganization?.id]);

  const getDefaultLabelForType = useCallback((documentType: string): DocumentTemplateLabel | null => {
    return defaultLabels[documentType] || null;
  }, [defaultLabels]);

  useEffect(() => {
    fetchDefaults();
  }, [fetchDefaults]);

  return {
    defaultLabels,
    getDefaultLabelForType,
    loading,
    refetch: fetchDefaults
  };
};
