
import { useState, useEffect } from 'react';
import { useDocumentTemplates } from './useDocumentTemplates';
import { DocumentTemplateWithTags } from '@/types/documentTags';

export const useInvoiceTemplates = () => {
  const { templates, loading } = useDocumentTemplates();
  const [invoiceTemplates, setInvoiceTemplates] = useState<DocumentTemplateWithTags[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<DocumentTemplateWithTags | null>(null);
  
  useEffect(() => {
    // Filter templates ONLY with "Factuur" tag (removed type filtering)
    const factuurTemplates = templates.filter(t => 
      t.tags?.some(tag => tag.toLowerCase() === 'factuur')
    );
    
    // Sort templates: favorite first, then by creation date (newest first)
    const sortedTemplates = [...factuurTemplates].sort((a, b) => {
      // Favorite templates first
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      
      // Then by creation date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    setInvoiceTemplates(sortedTemplates);
    
    // Find default template (favorite) or use first available (newest)
    const defaultTpl = sortedTemplates.find(t => t.is_default) || sortedTemplates[0] || null;
    setDefaultTemplate(defaultTpl);
  }, [templates]);

  return {
    invoiceTemplates,
    defaultTemplate,
    loading
  };
};
