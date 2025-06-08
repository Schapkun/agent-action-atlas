
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DocumentTemplate } from './types/DocumentTemplate';
import { VisualTemplateEditor } from './VisualTemplateEditor';
import { VisualTemplateData, DEFAULT_VARIABLES } from './types/VisualTemplate';

interface TemplateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: DocumentTemplate | null;
  onUpdateTemplate: (template: DocumentTemplate) => void;
  onSaveTemplate: () => void;
  saving?: boolean;
}

export const TemplateEditDialog = ({ 
  open, 
  onOpenChange, 
  template, 
  onUpdateTemplate, 
  onSaveTemplate,
  saving = false
}: TemplateEditDialogProps) => {
  // Convert DocumentTemplate to VisualTemplateData
  const [visualTemplateData, setVisualTemplateData] = useState<VisualTemplateData>(() => {
    if (!template) {
      return {
        id: '',
        name: '',
        documentType: 'invoice',
        layout: 'modern-blue',
        styling: {
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          font: 'Arial',
          logoPosition: 'left',
          headerStyle: 'simple'
        },
        companyInfo: {
          name: '',
          address: '',
          postalCode: '',
          city: '',
          country: 'Nederland',
          phone: '',
          email: '',
          website: '',
          logo: undefined
        },
        variables: DEFAULT_VARIABLES,
        content: {
          header: '',
          footer: '',
          customFields: {}
        }
      };
    }

    return {
      id: template.id,
      name: template.name,
      documentType: template.type as any || 'invoice',
      layout: 'modern-blue',
      styling: {
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        font: 'Arial',
        logoPosition: 'left',
        headerStyle: 'simple'
      },
      companyInfo: {
        name: '',
        address: '',
        postalCode: '',
        city: '',
        country: 'Nederland',
        phone: '',
        email: '',
        website: '',
        logo: undefined
      },
      variables: DEFAULT_VARIABLES,
      content: {
        header: '',
        footer: '',
        customFields: {}
      }
    };
  });

  const handleUpdateVisualTemplate = (data: VisualTemplateData) => {
    setVisualTemplateData(data);
    
    // Update the original template
    if (template) {
      onUpdateTemplate({
        ...template,
        name: data.name,
        type: data.documentType,
        // Store visual data as JSON in content field
        content: JSON.stringify(data)
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="text-lg">
            {template.name} - Visual Editor
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <VisualTemplateEditor
            templateData={visualTemplateData}
            onUpdateTemplate={handleUpdateVisualTemplate}
          />
        </div>

        <div className="flex-shrink-0 flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Annuleren
          </Button>
          <Button size="sm" onClick={onSaveTemplate} disabled={saving}>
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
