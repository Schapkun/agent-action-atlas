
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface CreateOrganizationFormProps {
  onCreateOrganization: (name: string) => Promise<void>;
  onCancel: () => void;
}

export const CreateOrganizationForm = ({ onCreateOrganization, onCancel }: CreateOrganizationFormProps) => {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onCreateOrganization(name);
    setName('');
  };

  return (
    <div className="bg-background rounded-lg border border-border/50 p-4 mb-4">
      <h4 className="font-medium text-base mb-4">Nieuwe Organisatie Aanmaken</h4>
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <Label htmlFor="new-org-name">Naam</Label>
          <Input
            id="new-org-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Organisatie naam"
          />
        </div>
      </div>
      <div className="flex space-x-2">
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Opslaan
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuleren
        </Button>
      </div>
    </div>
  );
};
