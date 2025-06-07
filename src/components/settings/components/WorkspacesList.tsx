
import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, Edit, Trash2 } from 'lucide-react';
import type { Workspace } from '../types/organization';

interface WorkspacesListProps {
  workspaces: Workspace[];
  canCreate: boolean;
  onUpdateWorkspace: (workspaceId: string, name: string) => Promise<void>;
  onDeleteWorkspace: (workspaceId: string, workspaceName: string) => Promise<void>;
  onEditWorkspace?: (workspace: Workspace) => void;
}

export const WorkspacesList = ({
  workspaces,
  canCreate,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onEditWorkspace
}: WorkspacesListProps) => {
  return (
    <div className="p-2">
      {workspaces.map((workspace) => (
        <div key={workspace.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/30">
          <div className="flex items-center gap-3 ml-10">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium text-sm">{workspace.name}</p>
              <p className="text-xs text-muted-foreground">Werkruimte</p>
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
              {onEditWorkspace && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditWorkspace(workspace)}
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
