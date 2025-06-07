
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentTemplate } from './types/DocumentTemplate';
import { TemplateList } from './TemplateList';
import { TemplateMainContent } from './TemplateMainContent';

export const DocumentLayoutSettings = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Mock data voor document templates
  const documentTemplates: DocumentTemplate[] = [
    {
      id: '1',
      name: 'Dagvaarding',
      type: 'legal',
      description: 'Standaard dagvaarding template',
      lastModified: new Date('2024-05-15'),
      isDefault: true
    },
    {
      id: '2',
      name: 'Vonnis',
      type: 'legal',
      description: 'Standaard vonnis template',
      lastModified: new Date('2024-05-12'),
      isDefault: true
    },
    {
      id: '3',
      name: 'Ingebrekestelling',
      type: 'legal',
      description: 'Template voor ingebrekestellingen',
      lastModified: new Date('2024-05-10'),
      isDefault: true
    },
    {
      id: '4',
      name: 'Arbeidscontract',
      type: 'contract',
      description: 'Standaard arbeidscontract',
      lastModified: new Date('2024-05-08'),
      isDefault: true
    },
    {
      id: '5',
      name: 'Factuur',
      type: 'invoice',
      description: 'Standaard factuur layout',
      lastModified: new Date('2024-05-05'),
      isDefault: true
    },
    {
      id: '6',
      name: 'Brief',
      type: 'correspondence',
      description: 'Zakelijke brief template',
      lastModified: new Date('2024-05-03'),
      isDefault: false
    },
    {
      id: '7',
      name: 'Koopovereenkomst',
      type: 'contract',
      description: 'Template voor koopovereenkomsten',
      lastModified: new Date('2024-05-01'),
      isDefault: false
    },
    {
      id: '8',
      name: 'Huurcontract',
      type: 'contract',
      description: 'Standaard huurcontract',
      lastModified: new Date('2024-04-28'),
      isDefault: false
    },
    {
      id: '9',
      name: 'Opzegging',
      type: 'legal',
      description: 'Template voor opzeggingen',
      lastModified: new Date('2024-04-25'),
      isDefault: false
    },
    {
      id: '10',
      name: 'Volledig',
      type: 'legal',
      description: 'Volledigheid template',
      lastModified: new Date('2024-04-22'),
      isDefault: false
    }
  ];

  const handleEditTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    toast({
      title: "Template bewerken",
      description: `${template.name} template wordt geopend voor bewerking.`,
    });
  };

  const handleSaveTemplate = () => {
    if (selectedTemplate) {
      console.log('Saving template:', selectedTemplate.name);
      toast({
        title: "Template opgeslagen",
        description: `${selectedTemplate.name} template is succesvol opgeslagen.`,
      });
      setIsEditing(false);
      setSelectedTemplate(null);
    }
  };

  const handleSelectTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(false);
  };

  const handleUpdateTemplate = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Document Layout Instellingen</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TemplateList
          templates={documentTemplates}
          onSelectTemplate={handleSelectTemplate}
          onEditTemplate={handleEditTemplate}
          selectedTemplate={selectedTemplate}
        />
        
        <TemplateMainContent
          selectedTemplate={selectedTemplate}
          isEditing={isEditing}
          onSaveTemplate={handleSaveTemplate}
          onEditTemplate={() => setIsEditing(true)}
          onUpdateTemplate={handleUpdateTemplate}
        />
      </div>
    </div>
  );
};
