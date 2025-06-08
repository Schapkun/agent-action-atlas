
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {template.name} - Template Bewerken
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <TemplateEditor 
            template={template} 
            onUpdateTemplate={onUpdateTemplate} 
          />
        </div>

        <div className="flex justify-end space-x-2 pt-2">
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
