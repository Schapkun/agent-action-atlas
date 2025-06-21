
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DocumentType } from '@/hooks/useDocumentTypes';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';

interface DocumentTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, label: string, templateId?: string) => Promise<boolean>;
  documentType?: DocumentType;
  existingNames: string[];
}

export const DocumentTypeDialog = ({
  open,
  onClose,
  onSave,
  documentType,
  existingNames
}: DocumentTypeDialogProps) => {
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [templateId, setTemplateId] = useState<string>('');
  const [nameError, setNameError] = useState('');

  const { templates } = useDocumentTemplates();

  useEffect(() => {
    if (documentType) {
      setName(documentType.name);
      setLabel(documentType.label);
      setTemplateId(documentType.default_template_id || '');
    } else {
      setName('');
      setLabel('');
      setTemplateId('');
    }
    setNameError('');
  }, [documentType, open]);

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('Naam is verplicht');
      return false;
    }
    
    const isDuplicate = existingNames.some(existing => 
      existing.toLowerCase() === value.toLowerCase() && 
      (!documentType || existing !== documentType.name)
    );
    
    if (isDuplicate) {
      setNameError('Deze naam bestaat al');
      return false;
    }
    
    setNameError('');
    return true;
  };

  const handleSave = async () => {
    if (!validateName(name) || !label.trim()) return;

    const success = await onSave(name.trim(), label.trim(), templateId || undefined);
    if (success) {
      onClose();
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      validateName(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {documentType ? 'Document Type Bewerken' : 'Nieuw Document Type'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Naam (technisch) *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="bijv. contract, brief, rapport"
              className={nameError ? 'border-red-500' : ''}
              disabled={!!documentType}
            />
            {nameError && (
              <p className="text-sm text-red-500">{nameError}</p>
            )}
            {documentType && (
              <p className="text-xs text-muted-foreground">
                De technische naam kan niet worden gewijzigd
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label (weergave) *</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="bijv. Contracten, Brieven, Rapporten"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Standaard Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een template (optioneel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Geen template</SelectItem>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Deze template wordt automatisch geselecteerd bij het aanmaken van dit document type
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim() || !label.trim() || !!nameError}
          >
            {documentType ? 'Bijwerken' : 'Aanmaken'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
