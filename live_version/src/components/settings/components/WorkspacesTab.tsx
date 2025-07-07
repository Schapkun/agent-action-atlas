
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { WorkspaceItem } from './WorkspaceItem';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  sender_email?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  hasOrgAccess?: boolean;
  workspaceAccess?: { [workspaceId: string]: boolean };
}

interface WorkspacesTabProps {
  workspaces: Workspace[];
  users: User[];
  loading: boolean;
  onAddWorkspace: (name: string) => Promise<void>;
  onEditWorkspace: (workspaceId: string, newName: string) => Promise<void>;
  onDeleteWorkspace: (workspaceId: string, workspaceName: string) => Promise<void>;
  onUserToggle: (workspaceId: string, userId: string, hasAccess: boolean) => void;
  onWorkspaceEmailChange: (workspaceId: string, email: string) => void;
}

export const WorkspacesTab = ({
  workspaces,
  users,
  loading,
  onAddWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onUserToggle,
  onWorkspaceEmailChange
}: WorkspacesTabProps) => {
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleAddWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;
    await onAddWorkspace(newWorkspaceName.trim());
    setNewWorkspaceName('');
    setShowAddWorkspace(false);
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-end h-10">
          <Button
            size="sm"
            onClick={() => setShowAddWorkspace(!showAddWorkspace)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Werkruimte Toevoegen
          </Button>
        </div>
        
        {showAddWorkspace && (
          <div className="flex gap-2 p-3 border rounded-md bg-muted/20 mb-3">
            <Input
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Werkruimte naam"
              className="flex-1"
            />
            <Button size="sm" onClick={handleAddWorkspace}>
              Toevoegen
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddWorkspace(false)}>
              Annuleren
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full border rounded-md bg-muted/10">
          <div className="p-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Laden...</div>
            ) : workspaces.length === 0 ? (
              <div className="text-sm text-muted-foreground">Geen werkruimtes gevonden</div>
            ) : (
              <div className="space-y-4">
                {workspaces.map((workspace) => (
                  <WorkspaceItem
                    key={workspace.id}
                    workspace={workspace}
                    users={users}
                    onEdit={onEditWorkspace}
                    onDelete={onDeleteWorkspace}
                    onUserToggle={onUserToggle}
                    onEmailChange={onWorkspaceEmailChange}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
