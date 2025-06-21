
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DocumentType } from '@/hooks/useDocumentTypes';

interface DocumentTypeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, label: string) => Promise<boolean>;
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; label?: string }>({});

  useEffect(() => {
    if (open) {
      setName(documentType?.name || '');
      setLabel(documentType?.label || '');
      setErrors({});
    }
  }, [open, documentType]);

  const validateForm = () => {
    const newErrors: { name?: string; label?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Naam is verplicht';
    } else if (name.length < 2) {
      newErrors.name = 'Naam moet minimaal 2 karakters lang zijn';
    } else if (!/^[a-z_]+$/.test(name)) {
      newErrors.name = 'Naam mag alleen kleine letters en underscores bevatten';
    } else if (existingNames.includes(name) && name !== documentType?.name) {
      newErrors.name = 'Deze naam bestaat al';
    }

    if (!label.trim()) {
      newErrors.label = 'Label is verplicht';
    } else if (label.length < 2) {
      newErrors.label = 'Label moet minimaal 2 karakters lang zijn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const success = await onSave(name.trim(), label.trim());
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {documentType ? 'Document Type Bewerken' : 'Nieuw Document Type'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Naam (technische naam)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z_]/g, ''))}
              placeholder="bijv. contract"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Alleen kleine letters en underscores toegestaan
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="label">Label (weergavenaam)</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="bijv. Contracten"
              disabled={loading}
            />
            {errors.label && (
              <p className="text-sm text-destructive">{errors.label}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
