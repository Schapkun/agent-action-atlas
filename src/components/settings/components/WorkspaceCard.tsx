
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Workspace, GroupedWorkspaces } from '../types/workspace';

interface WorkspaceCardProps {
  group: GroupedWorkspaces[string];
  onEditWorkspace: (workspace: Workspace) => void;
  onDeleteWorkspace: (workspaceId: string, workspaceName: string) => void;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({
  group,
  onEditWorkspace,
  onDeleteWorkspace
}) => {
  const { user } = useAuth();

  return (
    <Card className="border-l-4 border-l-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">{group.organization.name}</CardTitle>
          <span className="text-xs text-muted-foreground">
            ({group.workspaces.length} werkruimte{group.workspaces.length !== 1 ? 's' : ''})
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {group.workspaces.map((workspace) => (
            <div key={workspace.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{workspace.name}</h4>
                <p className="text-xs text-muted-foreground">
                  Rol: {workspace.user_role} • 
                  Aangemaakt: {new Date(workspace.created_at).toLocaleDateString('nl-NL')}
                </p>
              </div>
              <div className="flex space-x-1">
                {(workspace.user_role === 'admin' || workspace.user_role === 'owner' || user?.email === 'info@schapkun.com') && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditWorkspace(workspace)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteWorkspace(workspace.id, workspace.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
