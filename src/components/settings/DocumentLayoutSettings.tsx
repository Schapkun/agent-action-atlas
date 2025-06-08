
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentTemplate } from './types/DocumentTemplate';
import { TemplateList } from './TemplateList';
import { TemplateEditDialog } from './TemplateEditDialog';

export const DocumentLayoutSettings = () => {
  const [editingTemplate, setEditingTemplate] = useState<DocumentTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
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
    setEditingTemplate(template);
    setIsDialogOpen(true);
    toast({
      title: "Template bewerken",
      description: `${template.name} template wordt geopend voor bewerking.`,
    });
  };

  const handleSaveTemplate = async () => {
    if (editingTemplate) {
      setSaving(true);
      console.log('Saving template:', editingTemplate.name);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Template opgeslagen",
        description: `${editingTemplate.name} template is succesvol opgeslagen.`,
      });
      setSaving(false);
      setIsDialogOpen(false);
      setEditingTemplate(null);
    }
  };

  const handleUpdateTemplate = (template: DocumentTemplate) => {
    setEditingTemplate(template);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <TemplateList
          templates={documentTemplates}
          onSelectTemplate={() => {}} // Not used anymore since we don't show preview
          onEditTemplate={handleEditTemplate}
          selectedTemplate={null} // Not used anymore
        />
      </div>

      <TemplateEditDialog
        open={isDialogOpen}
        onOpenChange={handleCloseDialog}
        template={editingTemplate}
        onUpdateTemplate={handleUpdateTemplate}
        onSaveTemplate={handleSaveTemplate}
        saving={saving}
      />
    </div>
  );
};
