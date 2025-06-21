
import { useState, useEffect, useCallback } from 'react';
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
      // Use fetch API to query the document_settings table with labels
      const response = await fetch(`https://rybezhoovslkutsugzvv.supabase.co/rest/v1/document_settings?organization_id=eq.${selectedOrganization.id}&select=document_type,default_label_id,document_template_labels:default_label_id(*)`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5YmV6aG9vdnNsa3V0c3VnenZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMjMwNDgsImV4cCI6MjA2NDc5OTA0OH0.JihNgpfEygljiszxH7wYD1NKW6smmg17rgP1fJcMxBA`
        }
      });

      const data = await response.json();

      const labelsMap: Record<string, DocumentTemplateLabel> = {};
      
      if (data && Array.isArray(data)) {
        for (const setting of data) {
          if (setting.document_template_labels) {
            labelsMap[setting.document_type] = setting.document_template_labels;
          }
        }
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
