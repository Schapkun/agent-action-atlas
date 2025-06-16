
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface DocumentNameDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  existingNames: string[];
  initialName?: string;
  initialDescription?: string;
}

export const DocumentNameDialog = ({ 
  open, 
  onClose, 
  onSave, 
  existingNames, 
  initialName = '',
  initialDescription = ''
}: DocumentNameDialogProps) => {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Document naam is verplicht');
      return;
    }

    if (existingNames.includes(name.trim()) && name.trim() !== initialName) {
      setError('Deze naam bestaat al');
      return;
    }

    onSave(name.trim(), description.trim());
    handleClose();
  };

  const handleClose = () => {
    setName(initialName);
    setDescription(initialDescription);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            {initialName ? 'Document Bewerken' : 'Nieuw Document'}
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClose}>
              Annuleren
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              {initialName ? 'Bijwerken' : 'Aanmaken'}
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="document-name">Document Naam *</Label>
            <Input
              id="document-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Voer document naam in..."
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <Label htmlFor="document-description">Beschrijving</Label>
            <Input
              id="document-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optionele beschrijving..."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
