
import { useState, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDocumentTemplates } from './useDocumentTemplates';

export const useDocumentTemplateManager = () => {
  const { selectedOrganization } = useOrganization();
  const { templates, loading, error, fetchTemplates } = useDocumentTemplates();
  
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchTemplates();
    }
  }, [selectedOrganization?.id, fetchTemplates]);

  return {
    templates,
    loading,
    error,
    selectedTemplate,
    setSelectedTemplate,
    refetchTemplates: fetchTemplates
  };
};
