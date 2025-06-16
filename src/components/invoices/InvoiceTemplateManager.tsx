
import { useEffect } from 'react';

interface InvoiceTemplateManagerProps {
  documentTemplates: any[];
  templatesLoading: boolean;
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
}

export const InvoiceTemplateManager = ({ 
  documentTemplates, 
  templatesLoading, 
  selectedTemplate, 
  setSelectedTemplate 
}: InvoiceTemplateManagerProps) => {
  
  // Debug template loading
  useEffect(() => {
    console.log('Document templates loaded:', documentTemplates);
    console.log('Templates loading:', templatesLoading);
    console.log('All available templates:', documentTemplates.map(t => ({ 
      id: t.id, 
      name: t.name, 
      type: t.type,
      is_active: t.is_active 
    })));
  }, [documentTemplates, templatesLoading]);

  // Include ALL active templates
  const availableTemplates = documentTemplates.filter(t => {
    const isValid = t.is_active === true;
    console.log(`Template ${t.name} (${t.type}): ${isValid ? 'included' : 'excluded'} - active: ${t.is_active}`);
    return isValid;
  });

  console.log('Filtered available templates:', availableTemplates.length, availableTemplates);

  // Better template initialization
  useEffect(() => {
    if (availableTemplates.length > 0 && !selectedTemplate) {
      const factuurTemplate = availableTemplates.find(t => t.type === 'factuur');
      const defaultTemplate = availableTemplates.find(t => t.is_default);
      const templateToSelect = factuurTemplate || defaultTemplate || availableTemplates[0];
      
      console.log('Setting template:', templateToSelect);
      setSelectedTemplate(templateToSelect.id);
    }
  }, [availableTemplates, selectedTemplate, setSelectedTemplate]);

  return { availableTemplates };
};
