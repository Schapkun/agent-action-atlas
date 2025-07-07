
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Save } from 'lucide-react';
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
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');

  console.log('CreateWorkspaceDialog - canCreateWorkspace prop:', canCreateWorkspace);

  const handleCreate = () => {
    if (newWorkspaceName.trim() && selectedOrganization) {
      onCreateWorkspace(newWorkspaceName.trim(), selectedOrganization);
      setNewWorkspaceName('');
      setSelectedOrganization('');
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setNewWorkspaceName('');
    setSelectedOrganization('');
    setIsOpen(false);
  };

  // STRICTLY do not render anything if user cannot create workspaces
  if (!canCreateWorkspace) {
    console.log('CreateWorkspaceDialog - Not rendering, canCreateWorkspace is false');
    return null;
  }

  console.log('CreateWorkspaceDialog - Rendering dialog, canCreateWorkspace is true');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Nieuwe Werkruimte
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">Nieuwe Werkruimte</DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Annuleren
            </Button>
            <Button 
              size="sm" 
              onClick={handleCreate}
              disabled={!newWorkspaceName.trim() || !selectedOrganization}
            >
              <Save className="h-4 w-4 mr-2" />
              Aanmaken
            </Button>
          </div>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="workspace-name" className="text-sm">Werkruimte Naam</Label>
            <Input
              id="workspace-name"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Bijv. Ontwikkeling, Marketing..."
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="organization-select" className="text-sm">Organisatie</Label>
            <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecteer een organisatie" />
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
