
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './hooks/useUserRole';
import { useWorkspaceOperations } from './hooks/useWorkspaceOperations';
import { CreateWorkspaceDialog } from './components/CreateWorkspaceDialog';
import { EditWorkspaceDialog } from './components/EditWorkspaceDialog';
import { WorkspaceCard } from './components/WorkspaceCard';
import type { Workspace, GroupedWorkspaces } from './types/workspace';

export const WorkspaceSettings = () => {
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const { user } = useAuth();
  const { userRole } = useUserRole(user?.id, user?.email);
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

  // Use the EXACT same logic as organization creation
  const canCreateWorkspace = () => {
    console.log('WorkspaceSettings - canCreateWorkspace check:', { userRole, userEmail: user?.email });
    
    // Account owner can always create workspaces
    if (user?.email === 'info@schapkun.com') {
      console.log('Account owner detected, can create workspace');
      return true;
    }
    
    // Only admin and eigenaar roles can create workspaces (SAME as organization logic)
    const canCreate = userRole === 'admin' || userRole === 'eigenaar';
    console.log('Role-based check result:', canCreate);
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
  console.log('WorkspaceSettings - Final canCreate result:', canCreate);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Werkruimtes</h2>
        <CreateWorkspaceDialog
          organizations={organizations}
          onCreateWorkspace={createWorkspace}
          canCreateWorkspace={canCreate}
        />
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

      <EditWorkspaceDialog
        workspace={editingWorkspace}
        onUpdateWorkspace={updateWorkspace}
        onClose={() => setEditingWorkspace(null)}
      />
    </div>
  );
};
