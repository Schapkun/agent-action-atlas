
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspaceOperations } from './hooks/useWorkspaceOperations';
import { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog';
import { WorkspaceCard } from './components/WorkspaceCard';
import type { Workspace, GroupedWorkspaces } from './types/workspace';
import { EditOrgWorkspaceDialog } from './components/EditOrgWorkspaceDialog';

interface WorkspaceSettingsProps {
  userRole: string;
}

export const WorkspaceSettings = ({ userRole }: WorkspaceSettingsProps) => {
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const { user } = useAuth();
  const {
    workspaces,
    organizations,
    loading,
    fetchWorkspaces,
    fetchOrganizations,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  } = useWorkspaceOperations();

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
      fetchOrganizations();
    }
  }, [user]);

  // Check if user can create workspaces - ONLY show button if explicitly allowed
  const canCreateWorkspace = () => {
    console.log('WorkspaceSettings - canCreateWorkspace check:', { 
      userRole, 
      userEmail: user?.email,
      isAccountOwner: user?.email === 'info@schapkun.com'
    });
    
    // Account owner can always create workspaces
    if (user?.email === 'info@schapkun.com') {
      console.log('Account owner detected, can create workspace');
      return true;
    }
    
    // For all other users, they need admin or eigenaar role
    const canCreate = userRole === 'admin' || userRole === 'eigenaar';
    console.log('Role-based check result:', { userRole, canCreate });
    return canCreate;
  };

  // Group workspaces by organization
  const groupedWorkspaces: GroupedWorkspaces = workspaces.reduce((acc, workspace) => {
    if (!acc[workspace.organization_id]) {
      const org = organizations.find(o => o.id === workspace.organization_id);
      acc[workspace.organization_id] = {
        organization: org || { id: workspace.organization_id, name: workspace.organization_name || 'Onbekende Organisatie' },
        workspaces: []
      };
    }
    acc[workspace.organization_id].workspaces.push(workspace);
    return acc;
  }, {} as GroupedWorkspaces);

  if (loading) {
    return <div className="text-sm">Werkruimtes laden...</div>;
  }

  const canCreate = canCreateWorkspace();
  console.log('WorkspaceSettings - Final render decision:', { 
    canCreate, 
    userRole, 
    userEmail: user?.email,
    organizationsCount: organizations.length 
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Werkruimtes</h2>
        {canCreate && (
          <CreateWorkspaceDialog
            organizations={organizations}
            onCreateWorkspace={createWorkspace}
            canCreateWorkspace={canCreate}
          />
        )}
      </div>

      <div className="space-y-4">
        {Object.keys(groupedWorkspaces).length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              Je hebt nog geen toegang tot werkruimtes. {canCreate ? 'Maak een nieuwe werkruimte aan om te beginnen.' : 'Neem contact op met je beheerder om toegang te krijgen.'}
            </CardContent>
          </Card>
        ) : (
          Object.values(groupedWorkspaces).map((group) => (
            <WorkspaceCard
              key={group.organization.id}
              group={group}
              onEditWorkspace={setEditingWorkspace}
              onDeleteWorkspace={deleteWorkspace}
            />
          ))
        )}
      </div>

      <EditOrgWorkspaceDialog
        isOpen={!!editingWorkspace}
        onClose={() => setEditingWorkspace(null)}
        type="workspace"
        item={editingWorkspace}
        onUpdate={() => {
          fetchWorkspaces();
          fetchOrganizations();
        }}
      />
    </div>
  );
};
