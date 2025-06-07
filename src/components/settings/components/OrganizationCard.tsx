
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Save, Plus } from 'lucide-react';
import { WorkspacesList } from './WorkspacesList';
import { CreateWorkspaceForm } from './CreateWorkspaceForm';
import type { Organization } from '../types/organization';

interface OrganizationCardProps {
  organization: Organization;
  canCreate: boolean;
  onUpdateOrganization: (orgId: string, name: string) => Promise<void>;
  onDeleteOrganization: (orgId: string, orgName: string) => Promise<void>;
  onCreateWorkspace: (organizationId: string, name: string) => Promise<void>;
  onUpdateWorkspace: (workspaceId: string, name: string) => Promise<void>;
  onDeleteWorkspace: (workspaceId: string, workspaceName: string) => Promise<void>;
}

export const OrganizationCard = ({
  organization,
  canCreate,
  onUpdateOrganization,
  onDeleteOrganization,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace
}: OrganizationCardProps) => {
  const [editingOrganization, setEditingOrganization] = useState(false);
  const [showCreateWorkspaceForm, setShowCreateWorkspaceForm] = useState(false);
  const [editOrgData, setEditOrgData] = useState({ name: organization.name });

  const handleUpdateOrganization = async () => {
    await onUpdateOrganization(organization.id, editOrgData.name);
    setEditingOrganization(false);
  };

  const handleCreateWorkspace = async (name: string) => {
    await onCreateWorkspace(organization.id, name);
    setShowCreateWorkspaceForm(false);
  };

  return (
    <div className="bg-background rounded-lg border border-border/50">
      {/* Organization Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div>
            {editingOrganization ? (
              <div className="grid grid-cols-1 gap-2">
                <Input
                  value={editOrgData.name}
                  onChange={(e) => setEditOrgData({ name: e.target.value })}
                  placeholder="Organisatie naam"
                />
              </div>
            ) : (
              <>
                <h4 className="font-medium text-base">{organization.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Organisatie • Werkruimtes ({organization.workspaces.length})
                </p>
              </>
            )}
          </div>
        </div>
        {canCreate && (
          <div className="flex space-x-1 mr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteOrganization(organization.id, organization.name)}
              className="text-destructive hover:text-destructive h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            {editingOrganization ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdateOrganization}
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
                  setEditingOrganization(true);
                  setEditOrgData({ name: organization.name });
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

      {/* Workspaces */}
      {organization.workspaces.length > 0 && (
        <WorkspacesList
          workspaces={organization.workspaces}
          canCreate={canCreate}
          onUpdateWorkspace={onUpdateWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
        />
      )}

      {/* Create Workspace Form */}
      {showCreateWorkspaceForm && (
        <CreateWorkspaceForm
          onCreateWorkspace={handleCreateWorkspace}
          onCancel={() => setShowCreateWorkspaceForm(false)}
        />
      )}

      {/* Add Workspace Button */}
      {!showCreateWorkspaceForm && canCreate && (
        <div className="p-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateWorkspaceForm(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Werkruimte
          </Button>
        </div>
      )}
    </div>
  );
};
