
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { VisualTemplateEditor } from './VisualTemplateEditor';
import { VisualTemplateData, DEFAULT_VARIABLES } from './types/VisualTemplate';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Save } from 'lucide-react';

interface TemplateEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: DocumentTemplateWithLabels | null;
  onUpdateTemplate: (template: DocumentTemplateWithLabels) => void;
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

    // Try to parse existing htmlContent as JSON, otherwise use defaults
    let existingData = null;
    try {
      if (template.html_content && template.html_content.startsWith('{')) {
        existingData = JSON.parse(template.html_content);
      }
    } catch (e) {
      // No console.log needed for melding removal
    }

    return existingData || {
      id: template.id,
      name: template.name,
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
  });

  const handleUpdateVisualTemplate = (data: VisualTemplateData) => {
    setVisualTemplateData(data);
    
    // Update the original template
    if (template) {
      onUpdateTemplate({
        ...template,
        name: data.name,
        // Store visual data as JSON in html_content field
        html_content: JSON.stringify(data)
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!open || !template) return null;

  return (
    <div 
      className="fixed z-50 bg-background flex flex-col"
      style={{ 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0
      }}
    >
      {/* Header with actions */}
      <div className="flex-shrink-0 flex justify-between items-center p-4 border-b bg-background">
        <h2 className="text-lg font-semibold">Template bewerken</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel}>
            Annuleren
          </Button>
          <Button size="sm" onClick={onSaveTemplate} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </div>

      {/* Main content - volledige viewport hoogte minus header */}
      <div className="flex-1 overflow-hidden">
        <VisualTemplateEditor
          templateData={visualTemplateData}
          onUpdateTemplate={handleUpdateVisualTemplate}
          workspaceId={selectedWorkspace?.id}
          organizationId={selectedOrganization?.id}
          workspaceName={selectedWorkspace?.name}
          organizationName={selectedOrganization?.name}
        />
      </div>
    </div>
  );
};
