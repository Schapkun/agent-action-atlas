
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
  const [showCreateWorkspaceForm, setShowCreateWorkspaceForm] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<{id: string; name: string; organization_id: string} | null>(null);

  const handleCreateWorkspace = async (name: string) => {
    await onCreateWorkspace(organization.id, name);
    setShowCreateWorkspaceForm(false);
  };

  const handleRefreshData = () => {
    // This will be called after successful updates to refresh the parent data
    window.location.reload(); // Simple refresh for now
  };

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
              onClick={() => setEditDialogOpen(true)}
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
          onEditWorkspace={(workspace) => 
            setEditingWorkspace({
              id: workspace.id,
              name: workspace.name,
              organization_id: organization.id
            })
          }
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

      {/* Edit Organization Dialog */}
      <EditOrgWorkspaceDialog
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        type="organization"
        item={organization}
        onUpdate={handleRefreshData}
      />

      {/* Edit Workspace Dialog */}
      <EditOrgWorkspaceDialog
        isOpen={!!editingWorkspace}
        onClose={() => setEditingWorkspace(null)}
        type="workspace"
        item={editingWorkspace}
        onUpdate={handleRefreshData}
      />
    </div>
  );
};
