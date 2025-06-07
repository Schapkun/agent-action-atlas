
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" />
          {isViewingOwnProfile ? 'Mijn Organisaties & Werkruimtes' : 'Organisaties & Werkruimtes'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {organizations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {isViewingOwnProfile 
              ? 'Je bent nog geen lid van een organisatie'
              : 'Deze gebruiker is nog geen lid van een organisatie'
            }
          </p>
        ) : (
          <div className="space-y-3">
            {organizations.map((org) => (
              <div key={org.id} className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-primary/20">
                {/* Organization Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium text-sm">{org.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Organisatie • Werkruimtes ({org.workspaces.length})
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveFromOrganization(org.id, org.name)}
                    className="text-destructive hover:text-destructive h-8 w-8 p-0 mr-1"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Workspaces under this organization */}
                {org.workspaces.length > 0 && (
                  <div className="ml-6 space-y-2">
                    {org.workspaces.map((workspace) => (
                      <div key={workspace.id} className="flex items-center justify-between p-3 bg-muted/15 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{workspace.name}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveFromWorkspace(workspace.id, workspace.name)}
                          className="text-destructive hover:text-destructive w-8 h-8 p-0"
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
      </CardContent>
    </Card>
  );
};
