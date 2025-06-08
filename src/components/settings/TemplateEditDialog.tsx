
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentTemplate } from './types/DocumentTemplate';
import { VisualTemplateEditor } from './VisualTemplateEditor';
import { VisualTemplateData, DEFAULT_VARIABLES } from './types/VisualTemplate';
import { useOrganization } from '@/contexts/OrganizationContext';

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
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Prevent background scrolling when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  // Convert DocumentTemplate to VisualTemplateData state and functions
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

    // Try to parse existing content as JSON, otherwise use defaults
    let existingData = null;
    try {
      if (template.content && template.content.startsWith('{')) {
        existingData = JSON.parse(template.content);
      }
    } catch (e) {
      // No console.log needed for melding removal
    }

    return existingData || {
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

  if (!open || !template) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background border border-border shadow-2xl flex flex-col h-screen">
      {/* Main content - volledige hoogte */}
      <div className="flex-1 overflow-hidden h-full">
        <VisualTemplateEditor
          templateData={visualTemplateData}
          onUpdateTemplate={handleUpdateVisualTemplate}
          workspaceId={selectedWorkspace?.id}
          organizationId={selectedOrganization?.id}
          workspaceName={selectedWorkspace?.name}
          organizationName={selectedOrganization?.name}
        />
      </div>

      {/* Footer buttons */}
      <div className="flex-shrink-0 flex justify-end space-x-2 p-4 border-t bg-background">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          Annuleren
        </Button>
        <Button size="sm" onClick={onSaveTemplate} disabled={saving}>
          {saving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </div>
    </div>
  );
};
