
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useInvoiceTemplateManager = () => {
  const { templates: allTemplates, loading: templatesLoading } = useDocumentTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplateWithTags | null>(null);

  // Enhanced filtering with strict null/undefined checking + detailed debugging
  const invoiceTemplates = allTemplates.filter(template => {
    console.log('🔍 FILTER CHECK for template:', template.name, template.id, {
      hasTags: 'tags' in template,
      tagsValue: template.tags,
      tagsType: typeof template.tags,
      tagsIsArray: Array.isArray(template.tags),
      tagsLength: template.tags?.length,
      tagNames: template.tags,
      isActive: template.is_active
    });

    // Strict check: tags must exist, be an array, and have at least one item
    if (!template.tags || !Array.isArray(template.tags) || template.tags.length === 0) {
      console.log('❌ FILTER REJECT:', template.name, template.id, 'no valid tags array');
      return false;
    }
    
    // Check if any tag has the name "Factuur" (case-insensitive)
    const hasFactuurTag = template.tags.some(tag => {
      if (!tag || typeof tag !== 'string') {
        console.log('❌ INVALID TAG:', tag);
        return false;
      }
      const isFactuur = tag.toLowerCase() === 'factuur';
      console.log('🏷️ TAG CHECK:', tag, '-> isFactuur:', isFactuur);
      return isFactuur;
    });

    console.log(hasFactuurTag ? '✅ FILTER ACCEPT:' : '❌ FILTER REJECT:', template.name, template.id, 'hasFactuurTag:', hasFactuurTag);
    return hasFactuurTag;
  });

  console.log('🎯 TEMPLATE MANAGER: DETAILED FILTERING RESULTS AFTER CLEANUP:', {
    totalTemplates: allTemplates.length,
    activeTemplates: allTemplates.filter(t => t.is_active).length,
    inactiveTemplates: allTemplates.filter(t => !t.is_active).length,
    templatesWithTags: allTemplates.filter(t => t.tags && Array.isArray(t.tags) && t.tags.length > 0).length,
    templatesWithoutTags: allTemplates.filter(t => !t.tags || !Array.isArray(t.tags) || t.tags.length === 0).length,
    factuurTemplatesFound: invoiceTemplates.length,
    allTemplateAnalysis: allTemplates.map(t => ({
      id: t.id.substring(0, 8) + '...',
      name: t.name,
      isActive: t.is_active,
      hasValidTags: !!(t.tags && Array.isArray(t.tags) && t.tags.length > 0),
      tagCount: t.tags?.length || 0,
      tags: t.tags || [],
      hasFactuurTag: t.tags && Array.isArray(t.tags) && t.tags.some(tag => tag?.toLowerCase() === 'factuur'),
      passesFilter: t.tags && Array.isArray(t.tags) && t.tags.length > 0 && t.tags.some(tag => tag?.toLowerCase() === 'factuur')
    })),
    acceptedTemplateDetails: invoiceTemplates.map(t => ({
      id: t.id.substring(0, 8) + '...',
      name: t.name,
      isDefault: t.is_default,
      tags: t.tags || []
    }))
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
        console.log('🎯 TEMPLATE MANAGER: No default template found, using newest:', defaultTemplate.name, defaultTemplate.id);
      } else {
        console.log('🎯 TEMPLATE MANAGER: Using marked default template:', defaultTemplate.name, defaultTemplate.id);
      }
      
      setSelectedTemplate(defaultTemplate);
    }
  }, [sortedTemplates, selectedTemplate]);

  const handleTemplateSelect = (template: DocumentTemplateWithTags) => {
    console.log('🎯 TEMPLATE MANAGER: User selected template:', template?.name, 'ID:', template?.id);
    setSelectedTemplate(template);
  };

  // Clear any old localStorage entries that might conflict
  useEffect(() => {
    // Remove old template system localStorage entries
    localStorage.removeItem('favoriteTemplate');
  }, []);

  console.log('🎯 TEMPLATE MANAGER: FINAL STATE AFTER TEMPLATE CLEANUP:', {
    selectedTemplate: selectedTemplate ? {
      id: selectedTemplate.id.substring(0, 8) + '...',
      fullId: selectedTemplate.id,
      name: selectedTemplate.name,
      tags: selectedTemplate.tags || []
    } : null,
    availableTemplates: sortedTemplates.length,
    loading: templatesLoading,
    filterRule: 'STRICT: Only templates with valid tags array AND containing "Factuur" tag',
    finalTemplateList: sortedTemplates.map(t => ({
      id: t.id.substring(0, 8) + '...',
      fullId: t.id,
      name: t.name,
      isDefault: t.is_default,
      tags: t.tags || []
    }))
  });

  return {
    selectedTemplate,
    availableTemplates: sortedTemplates,
    templatesLoading,
    handleTemplateSelect
  };
};
