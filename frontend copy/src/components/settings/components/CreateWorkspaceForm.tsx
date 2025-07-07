
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';

interface CreateWorkspaceFormProps {
  onCreateWorkspace: (name: string) => Promise<void>;
  onCancel: () => void;
}

export const CreateWorkspaceForm = ({ onCreateWorkspace, onCancel }: CreateWorkspaceFormProps) => {
  const [name, setName] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await onCreateWorkspace(name);
    setName('');
  };

  return (
    <div className="p-3 bg-muted/15 rounded-lg border-2 border-dashed border-muted-foreground/20 mx-2 mb-2">
      <div className="grid grid-cols-1 gap-2 mb-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Werkruimte naam"
        />
      </div>
      <div className="flex space-x-2">
        <Button size="sm" onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Opslaan
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Annuleren
        </Button>
      </div>
    </div>
  );
};
