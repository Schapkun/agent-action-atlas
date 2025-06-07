
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Workspace } from '../types/workspace';

interface EditWorkspaceDialogProps {
  workspace: Workspace | null;
  onUpdateWorkspace: (workspace: Workspace) => void;
  onClose: () => void;
}

export const EditWorkspaceDialog: React.FC<EditWorkspaceDialogProps> = ({
  workspace,
  onUpdateWorkspace,
  onClose
}) => {
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

  useEffect(() => {
    setEditingWorkspace(workspace);
  }, [workspace]);

  const handleUpdate = () => {
    if (editingWorkspace) {
      onUpdateWorkspace(editingWorkspace);
      onClose();
    }
  };

  return (
    <Dialog open={!!workspace} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Werkruimte Bewerken</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="edit-workspace-name" className="text-sm">Werkruimte Naam</Label>
            <Input
              id="edit-workspace-name"
              value={editingWorkspace?.name || ''}
              onChange={(e) => editingWorkspace && setEditingWorkspace({ ...editingWorkspace, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Annuleren
            </Button>
            <Button size="sm" onClick={handleUpdate}>
              Opslaan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
