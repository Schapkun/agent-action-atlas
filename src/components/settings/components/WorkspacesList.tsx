
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Briefcase, Edit, Trash2, Save } from 'lucide-react';
import type { Workspace } from '../types/organization';

interface WorkspacesListProps {
  workspaces: Workspace[];
  canCreate: boolean;
  onUpdateWorkspace: (workspaceId: string, name: string) => Promise<void>;
  onDeleteWorkspace: (workspaceId: string, workspaceName: string) => Promise<void>;
}

export const WorkspacesList = ({
  workspaces,
  canCreate,
  onUpdateWorkspace,
  onDeleteWorkspace
}: WorkspacesListProps) => {
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editWorkspaceData, setEditWorkspaceData] = useState({ name: '' });

  const handleUpdateWorkspace = async (workspaceId: string) => {
    await onUpdateWorkspace(workspaceId, editWorkspaceData.name);
    setEditingWorkspace(null);
  };

  return (
    <div className="p-2">
      {workspaces.map((workspace) => (
        <div key={workspace.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/30">
          <div className="flex items-center gap-3 ml-10">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              {editingWorkspace === workspace.id ? (
                <div className="grid grid-cols-1 gap-2">
                  <Input
                    value={editWorkspaceData.name}
                    onChange={(e) => setEditWorkspaceData({ name: e.target.value })}
                    placeholder="Werkruimte naam"
                  />
                </div>
              ) : (
                <>
                  <p className="font-medium text-sm">{workspace.name}</p>
                  <p className="text-xs text-muted-foreground">Werkruimte</p>
                </>
              )}
            </div>
          </div>
          {canCreate && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteWorkspace(workspace.id, workspace.name)}
                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                title="Verwijder werkruimte"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {editingWorkspace === workspace.id ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpdateWorkspace(workspace.id)}
                  className="h-8 w-8 p-0"
                  title="Opslaan"
                >
                  <Save className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingWorkspace(workspace.id);
                    setEditWorkspaceData({ name: workspace.name });
                  }}
                  className="h-8 w-8 p-0"
                  title="Bewerken"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
