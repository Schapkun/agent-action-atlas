
import React from 'react';
import { Shield, UserCheck } from 'lucide-react';
import { OrganizationMembership, WorkspaceMembership } from '../types/UserProfile';
import { translateRole, getRoleIcon, getRoleIconProps } from '../utils/roleHelpers';

interface MembershipsListProps {
  organizations: OrganizationMembership[];
  workspaces: WorkspaceMembership[];
}

export const MembershipsList = ({ organizations, workspaces }: MembershipsListProps) => {
  return (
    <div className="space-y-6">
      {/* Organizations */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Organisaties ({organizations.length})
        </h3>
        {organizations.length > 0 ? (
          <div className="space-y-2">
            {organizations.map((org) => {
              const IconComponent = getRoleIcon(org.role);
              const iconProps = getRoleIconProps(org.role);
              return (
                <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent {...iconProps} />
                    <div>
                      <p className="font-medium">{org.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Lid sinds: {new Date(org.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {translateRole(org.role)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Geen organisaties gevonden</p>
        )}
      </div>

      {/* Workspaces */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Werkruimtes ({workspaces.length})
        </h3>
        {workspaces.length > 0 ? (
          <div className="space-y-2">
            {workspaces.map((workspace) => {
              const IconComponent = getRoleIcon(workspace.role);
              const iconProps = getRoleIconProps(workspace.role);
              return (
                <div key={workspace.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <IconComponent {...iconProps} />
                    <div>
                      <p className="font-medium">{workspace.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Organisatie: {workspace.organization_name} • Lid sinds: {new Date(workspace.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {translateRole(workspace.role)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Geen werkruimtes gevonden</p>
        )}
      </div>
    </div>
  );
};
