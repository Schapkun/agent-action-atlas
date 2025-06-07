
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Briefcase, Trash2 } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  organization_name: string;
  role?: string;
}

interface Organization {
  id: string;
  name: string;
  role: string;
  workspaces: Workspace[];
}

interface OrganizationsListProps {
  organizations: Organization[];
  isViewingOwnProfile: boolean;
  onRemoveFromOrganization: (organizationId: string, organizationName: string) => void;
  onRemoveFromWorkspace: (workspaceId: string, workspaceName: string) => void;
}

export const OrganizationsList = ({
  organizations,
  isViewingOwnProfile,
  onRemoveFromOrganization,
  onRemoveFromWorkspace
}: OrganizationsListProps) => {
  return (
    <div className="bg-muted/40 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-5 w-5" />
        <h3 className="text-lg font-medium">
          {isViewingOwnProfile ? 'Mijn Organisaties & Werkruimtes' : 'Organisaties & Werkruimtes'}
        </h3>
      </div>
      
      {organizations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {isViewingOwnProfile 
            ? 'Je bent nog geen lid van een organisatie'
            : 'Deze gebruiker is nog geen lid van een organisatie'
          }
        </p>
      ) : (
        <div className="space-y-4">
          {organizations.map((org) => (
            <div key={org.id} className="bg-background rounded-lg border border-border/50">
              {/* Organization Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium text-base">{org.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Organisatie • Werkruimtes ({org.workspaces.length})
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveFromOrganization(org.id, org.name)}
                  className="text-destructive hover:text-destructive h-8 w-8 p-0 mr-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Workspaces under this organization */}
              {org.workspaces.length > 0 && (
                <div className="p-2">
                  {org.workspaces.map((workspace) => (
                    <div key={workspace.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/30">
                      <div className="flex items-center gap-3 ml-10">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{workspace.name}</p>
                          <p className="text-xs text-muted-foreground">Werkruimte</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveFromWorkspace(workspace.id, workspace.name)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
