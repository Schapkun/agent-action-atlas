
import { useState, useEffect } from 'react';
import { useDocumentTemplates, DocumentTemplate } from './useDocumentTemplates';
import { useOrganization } from '@/contexts/OrganizationContext';

export const useInvoiceTemplates = () => {
  const { templates, loading } = useDocumentTemplates();
  const [invoiceTemplates, setInvoiceTemplates] = useState<DocumentTemplate[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<DocumentTemplate | null>(null);
  
  useEffect(() => {
    // Filter templates that have "Factuur" label - no type filtering
    const factuurTemplates = templates.filter(t => 
      t.labels?.some(label => label.name.toLowerCase() === 'factuur')
    );
    
    // Sort templates: favorite first, then by creation date (oldest first)
    const sortedTemplates = [...factuurTemplates].sort((a, b) => {
      // Favorite templates first
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      
      // Then by creation date (oldest first)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
    
    setInvoiceTemplates(sortedTemplates);
    
    // Find default template (favorite) or use first available
    const defaultTpl = sortedTemplates.find(t => t.is_default) || sortedTemplates[0] || null;
    setDefaultTemplate(defaultTpl);
  }, [templates]);

  return {
    invoiceTemplates,
    defaultTemplate,
    loading
  };
};
