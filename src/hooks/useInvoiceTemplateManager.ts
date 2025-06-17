
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

export const useInvoiceTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithLabels | null>(null);

  // Enhanced filtering with strict null/undefined checking
  const invoiceTemplates = allTemplates.filter(template => {
    console.log('🔍 FILTER CHECK for template:', template.name, {
      hasLabelsProperty: 'labels' in template,
      labelsValue: template.labels,
      labelsType: typeof template.labels,
      labelsIsArray: Array.isArray(template.labels),
      labelsLength: template.labels?.length,
      labelNames: template.labels?.map(l => l.name)
    });

    // Strict check: labels must exist, be an array, and have at least one item
    if (!template.labels || !Array.isArray(template.labels) || template.labels.length === 0) {
      console.log('❌ FILTER REJECT:', template.name, 'no valid labels array');
      return false;
    }
    
    // Check if any label has the name "Factuur" (case-insensitive)
    const hasFactuurLabel = template.labels.some(label => {
      if (!label || !label.name || typeof label.name !== 'string') {
        console.log('❌ INVALID LABEL:', label);
        return false;
      }
      const isFactuur = label.name.toLowerCase() === 'factuur';
      console.log('🏷️ LABEL CHECK:', label.name, '-> isFactuur:', isFactuur);
      return isFactuur;
    });

    console.log(hasFactuurLabel ? '✅ FILTER ACCEPT:' : '❌ FILTER REJECT:', template.name, 'hasFactuurLabel:', hasFactuurLabel);
    return hasFactuurLabel;
  });

  console.log('🎯 TEMPLATE MANAGER: DETAILED FILTERING RESULTS:', {
    totalTemplates: allTemplates.length,
    templatesWithLabels: allTemplates.filter(t => t.labels && Array.isArray(t.labels) && t.labels.length > 0).length,
    templatesWithoutLabels: allTemplates.filter(t => !t.labels || !Array.isArray(t.labels) || t.labels.length === 0).length,
    factuurTemplatesFound: invoiceTemplates.length,
    allTemplateAnalysis: allTemplates.map(t => ({
      name: t.name,
      hasValidLabels: !!(t.labels && Array.isArray(t.labels) && t.labels.length > 0),
      labelCount: t.labels?.length || 0,
      labels: t.labels?.map(l => l?.name || 'INVALID_LABEL') || [],
      hasFactuurLabel: t.labels && Array.isArray(t.labels) && t.labels.some(l => l?.name?.toLowerCase() === 'factuur'),
      passesFilter: t.labels && Array.isArray(t.labels) && t.labels.length > 0 && t.labels.some(l => l?.name?.toLowerCase() === 'factuur')
    })),
    acceptedTemplateNames: invoiceTemplates.map(t => t.name)
  });

  // Sort templates: favorite first, then by creation date (NEWEST FIRST)
  const sortedTemplates = [...invoiceTemplates].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    // Newest first for better UX
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Auto-select default template when available, fallback to newest
  useEffect(() => {
    if (sortedTemplates.length > 0 && !selectedTemplate) {
      // First try to find a template marked as default
      let defaultTemplate = sortedTemplates.find(t => t.is_default);
      
      // If no default is found, use the newest template (first in sorted array)
      if (!defaultTemplate) {
        defaultTemplate = sortedTemplates[0];
        console.log('🎯 TEMPLATE MANAGER: No default template found, using newest:', defaultTemplate.name);
      } else {
        console.log('🎯 TEMPLATE MANAGER: Using marked default template:', defaultTemplate.name);
      }
      
      setSelectedTemplate(defaultTemplate);
    }
  }, [sortedTemplates, selectedTemplate]);

  const handleTemplateSelect = (templateId: string) => {
    const template = sortedTemplates.find(t => t.id === templateId);
    console.log('🎯 TEMPLATE MANAGER: User selected template:', template?.name, 'ID:', templateId);
    setSelectedTemplate(template || null);
  };

  // Clear any old localStorage entries that might conflict
  useEffect(() => {
    // Remove old template system localStorage entries
    localStorage.removeItem('favoriteTemplate');
  }, []);

  console.log('🎯 TEMPLATE MANAGER: FINAL STATE WITH ENHANCED FILTERING:', {
    selectedTemplate: selectedTemplate ? {
      id: selectedTemplate.id,
      name: selectedTemplate.name,
      labels: selectedTemplate.labels?.map(l => l.name)
    } : null,
    availableTemplates: sortedTemplates.length,
    loading: templatesLoading,
    filterRule: 'STRICT: Only templates with valid labels array AND containing "Factuur" label',
    finalTemplateList: sortedTemplates.map(t => ({
      id: t.id,
      name: t.name,
      isDefault: t.is_default,
      labels: t.labels?.map(l => l.name)
    }))
  });

  return {
    selectedTemplate,
    availableTemplates: sortedTemplates,
    templatesLoading,
    handleTemplateSelect
  };
};
