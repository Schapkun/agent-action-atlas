
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DocumentNameDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, type: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun', description: string) => void;
  existingNames: string[];
  initialName?: string;
  initialType?: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
  initialDescription?: string;
}

export const DocumentNameDialog = ({ 
  open, 
  onClose, 
  onSave, 
  existingNames, 
  initialName = '',
  initialType = 'factuur',
  initialDescription = ''
}: DocumentNameDialogProps) => {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState<'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun'>(initialType);
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

    onSave(name.trim(), type, description.trim());
    handleClose();
  };

  const handleClose = () => {
    setName(initialName);
    setType(initialType);
    setDescription(initialDescription);
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {initialName ? 'Document Bewerken' : 'Nieuw Document'}
          </DialogTitle>
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
            <Label htmlFor="document-type">Type</Label>
            <Select value={type} onValueChange={(value: 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun') => setType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="factuur">Factuur</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="brief">Brief</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
                <SelectItem value="schapkun">Schapkun</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Annuleren
            </Button>
            <Button onClick={handleSave}>
              {initialName ? 'Bijwerken' : 'Aanmaken'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
