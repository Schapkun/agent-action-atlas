
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import type { Organization } from '../types/workspace';

interface CreateWorkspaceDialogProps {
  organizations: Organization[];
  onCreateWorkspace: (name: string, organizationId: string) => void;
  canCreateWorkspace: boolean;
}

export const CreateWorkspaceDialog: React.FC<CreateWorkspaceDialogProps> = ({
  organizations,
  onCreateWorkspace,
  canCreateWorkspace
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', organization_id: '' });

  const handleCreate = () => {
    onCreateWorkspace(newWorkspace.name, newWorkspace.organization_id);
    setNewWorkspace({ name: '', organization_id: '' });
    setIsOpen(false);
  };

  if (!canCreateWorkspace) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Werkruimte
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Nieuwe Werkruimte Aanmaken</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="workspace-name" className="text-sm">Werkruimte Naam</Label>
            <Input
              id="workspace-name"
              value={newWorkspace.name}
              onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
              placeholder="Voer werkruimte naam in"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="organization" className="text-sm">Organisatie</Label>
            <Select
              value={newWorkspace.organization_id}
              onValueChange={(value) => setNewWorkspace({ ...newWorkspace, organization_id: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecteer organisatie" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Annuleren
            </Button>
            <Button size="sm" onClick={handleCreate}>
              Aanmaken
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
