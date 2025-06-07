
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Plus } from 'lucide-react';
import { WorkspacesList } from './WorkspacesList';
import { CreateWorkspaceForm } from './CreateWorkspaceForm';
import { EditOrgWorkspaceDialog } from './EditOrgWorkspaceDialog';
import type { Organization } from '../types/organization';

interface OrganizationCardProps {
  organization: Organization;
  canCreate: boolean;
  onUpdateOrganization: (orgId: string, name: string) => Promise<void>;
  onDeleteOrganization: (orgId: string, orgName: string) => Promise<void>;
  onCreateWorkspace: (organizationId: string, name: string) => Promise<void>;
  onUpdateWorkspace: (workspaceId: string, name: string) => Promise<void>;
  onDeleteWorkspace: (workspaceId: string, workspaceName: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const OrganizationCard = ({
  organization,
  canCreate,
  onUpdateOrganization,
  onDeleteOrganization,
  onCreateWorkspace,
  onUpdateWorkspace,
  onDeleteWorkspace,
  onRefresh
}: OrganizationCardProps) => {
  const [showCreateWorkspaceForm, setShowCreateWorkspaceForm] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    type: 'organization' | 'workspace';
    item: { id: string; name: string; organization_id?: string };
  } | null>(null);

  const handleCreateWorkspace = async (name: string) => {
    await onCreateWorkspace(organization.id, name);
    setShowCreateWorkspaceForm(false);
  };

  const handleRefreshData = async () => {
    console.log('OrganizationCard - handleRefreshData called');
    await onRefresh();
  };

  const handleEditOrganization = () => {
    console.log('OrganizationCard - handleEditOrganization clicked for:', organization.name);
    setEditingItem({
      type: 'organization',
      item: { id: organization.id, name: organization.name }
    });
    console.log('OrganizationCard - editingItem set to organization:', { id: organization.id, name: organization.name });
  };

  const handleEditWorkspace = (workspace: {id: string; name: string; organization_id: string}) => {
    console.log('OrganizationCard - handleEditWorkspace clicked for:', workspace.name);
    setEditingItem({
      type: 'workspace',
      item: {
        id: workspace.id,
        name: workspace.name,
        organization_id: workspace.organization_id
      }
    });
    console.log('OrganizationCard - editingItem set to workspace:', workspace);
  };

  console.log('OrganizationCard - Current editingItem state:', editingItem);

  return (
    <div className="bg-background rounded-lg border border-border/50">
      {/* Organization Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div>
            <h4 className="font-medium text-base">{organization.name}</h4>
            <p className="text-sm text-muted-foreground">
              Organisatie • Werkruimtes ({organization.workspaces.length})
            </p>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditOrganization}
              className="h-8 w-8 p-0"
              title="Bewerken"
            >
              <Edit className="h-4 w-4" />
            </Button>
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
          onEditWorkspace={handleEditWorkspace}
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

      {/* Single Edit Dialog for both Organization and Workspace */}
      <EditOrgWorkspaceDialog
        isOpen={!!editingItem}
        onClose={() => {
          console.log('OrganizationCard - Closing EditOrgWorkspaceDialog');
          setEditingItem(null);
        }}
        type={editingItem?.type || 'organization'}
        item={editingItem?.item || null}
        onUpdate={handleRefreshData}
      />
    </div>
  );
};
