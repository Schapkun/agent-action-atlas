
import { useState, useEffect } from 'react';
import { useDocumentTemplates, DocumentTemplate } from './useDocumentTemplates';
import { useOrganization } from '@/contexts/OrganizationContext';

export const useInvoiceTemplates = () => {
  const { templates, loading } = useDocumentTemplates();
  const [invoiceTemplates, setInvoiceTemplates] = useState<DocumentTemplate[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<DocumentTemplate | null>(null);
  
  useEffect(() => {
    // Filter templates that have "Factuur" label and exclude custom types
    const factuurTemplates = templates.filter(t => 
      t.labels?.some(label => label.name.toLowerCase() === 'factuur') &&
      t.type !== 'custom'
    );
    setInvoiceTemplates(factuurTemplates);
    
    // Find default template or use first available
    const defaultTpl = factuurTemplates.find(t => t.is_default) || factuurTemplates[0] || null;
    setDefaultTemplate(defaultTpl);
  }, [templates]);

  return {
    invoiceTemplates,
    defaultTemplate,
    loading
  };
};
