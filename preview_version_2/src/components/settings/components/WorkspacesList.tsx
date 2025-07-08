
import React from 'react';
import { Briefcase } from 'lucide-react';
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
        <div key={workspace.id} className="flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 ml-10">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">{workspace.name}</p>
            <p className="text-xs text-muted-foreground">Werkruimte</p>
          </div>
        </div>
      ))}
    </div>
  );
};
