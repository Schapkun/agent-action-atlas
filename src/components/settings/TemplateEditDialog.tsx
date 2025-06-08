
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { DocumentTemplate } from './types/DocumentTemplate';
import { TemplateEditor } from './TemplateEditor';

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
  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">
              {template.name} - Template Bewerken
            </DialogTitle>
            <Button onClick={onSaveTemplate} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <TemplateEditor 
            template={template} 
            onUpdateTemplate={onUpdateTemplate} 
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
