import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './hooks/useUserRole';
import { Trash2, Plus, Edit, Building2 } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  created_at: string;
  organization_name?: string;
  user_role?: string;
}

interface Organization {
  id: string;
  name: string;
}

interface GroupedWorkspaces {
  [organizationId: string]: {
    organization: Organization;
    workspaces: Workspace[];
  };
}

export const WorkspaceSettings = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', organization_id: '' });
  const { user } = useAuth();
  const { userRole } = useUserRole(user?.id, user?.email);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWorkspaces();
      fetchOrganizations();
    }
  }, [user]);

  const fetchWorkspaces = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching workspaces for user:', user.id);
      
      // Check if user is the account owner (Michael Schapkun)
      const isAccountOwner = user.email === 'info@schapkun.com';
      
      if (isAccountOwner) {
        // If account owner, show ALL workspaces
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id, name, slug, organization_id, created_at')
          .order('created_at', { ascending: false });

        if (workspaceError) {
          console.error('Workspaces fetch error:', workspaceError);
          throw workspaceError;
        }

        console.log('All workspace data (account owner):', workspaceData);

        // Get organization names
        const orgIds = [...new Set(workspaceData?.map(w => w.organization_id) || [])];
        let orgNames: { [key: string]: string } = {};
        
        if (orgIds.length > 0) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .in('id', orgIds);

          if (!orgError && orgData) {
            orgNames = orgData.reduce((acc, org) => {
              acc[org.id] = org.name;
              return acc;
            }, {} as { [key: string]: string });
          }
        }

        // Combine data with owner role for account owner
        const workspacesWithRoles = workspaceData?.map(workspace => {
          return {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            organization_id: workspace.organization_id,
            created_at: workspace.created_at,
            organization_name: orgNames[workspace.organization_id] || 'Onbekend',
            user_role: 'owner' // Account owner has owner role on everything
          };
        }) || [];

        setWorkspaces(workspacesWithRoles);
      } else {
        // For regular users, only show workspaces they are members of
        const { data: membershipData, error: membershipError } = await supabase
          .from('workspace_members')
          .select('role, workspace_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Workspace membership error:', membershipError);
          throw membershipError;
        }

        console.log('Workspace membership data:', membershipData);

        if (!membershipData || membershipData.length === 0) {
          console.log('No workspace memberships found');
          setWorkspaces([]);
          setLoading(false);
          return;
        }

        // Get workspace details
        const workspaceIds = membershipData.map(m => m.workspace_id);
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id, name, slug, organization_id, created_at')
          .in('id', workspaceIds);

        if (workspaceError) {
          console.error('Workspaces fetch error:', workspaceError);
          throw workspaceError;
        }

        console.log('Workspace data:', workspaceData);

        // Get organization names for user's workspaces only
        const orgIds = [...new Set(workspaceData?.map(w => w.organization_id) || [])];
        let orgNames: { [key: string]: string } = {};
        
        if (orgIds.length > 0) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .in('id', orgIds);

          if (!orgError && orgData) {
            orgNames = orgData.reduce((acc, org) => {
              acc[org.id] = org.name;
              return acc;
            }, {} as { [key: string]: string });
          }
        }

        // Combine data
        const workspacesWithRoles = workspaceData?.map(workspace => {
          const membership = membershipData.find(m => m.workspace_id === workspace.id);
          return {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            organization_id: workspace.organization_id,
            created_at: workspace.created_at,
            organization_name: orgNames[workspace.organization_id] || 'Onbekend',
            user_role: membership?.role
          };
        }) || [];

        setWorkspaces(workspacesWithRoles);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: "Kon werkruimtes niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    if (!user?.id) return;

    try {
      // Check if user is the account owner (Michael Schapkun)
      const isAccountOwner = user.email === 'info@schapkun.com';
      
      if (isAccountOwner) {
        // If account owner, show ALL organizations
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name', { ascending: true });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          return;
        }

        setOrganizations(orgData || []);
      } else {
        // For regular users, get organizations through membership only
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Organization membership error:', membershipError);
          return;
        }

        if (!membershipData || membershipData.length === 0) {
          setOrganizations([]);
          return;
        }

        const orgIds = membershipData.map(m => m.organization_id);
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds)
          .order('name', { ascending: true });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          return;
        }

        setOrganizations(orgData || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  // Check if user can create workspaces - use same logic as organization creation
  const canCreateWorkspace = () => {
    console.log('WorkspaceSettings - canCreateWorkspace check:', { userRole, userEmail: user?.email });
    
    // Account owner can always create workspaces
    if (user?.email === 'info@schapkun.com') return true;
    
    // Only admin and owner roles can create workspaces
    return userRole === 'admin' || userRole === 'eigenaar';
  };

  const createWorkspace = async () => {
    if (!newWorkspace.name.trim() || !newWorkspace.organization_id) return;

    try {
      const slug = newWorkspace.name.toLowerCase().replace(/\s+/g, '-');
      
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspace.name,
          slug: slug,
          organization_id: newWorkspace.organization_id
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceData.id,
          user_id: user?.id,
          role: 'admin'
        });

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: newWorkspace.organization_id,
          workspace_id: workspaceData.id,
          action: 'Werkruimte aangemaakt',
          details: { workspace_name: newWorkspace.name }
        });

      toast({
        title: "Succes",
        description: "Werkruimte succesvol aangemaakt",
      });

      setNewWorkspace({ name: '', organization_id: '' });
      setIsCreateDialogOpen(false);
      fetchWorkspaces();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const updateWorkspace = async () => {
    if (!editingWorkspace || !editingWorkspace.name.trim()) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: editingWorkspace.name,
          slug: editingWorkspace.name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', editingWorkspace.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: editingWorkspace.organization_id,
          workspace_id: editingWorkspace.id,
          action: 'Werkruimte bijgewerkt',
          details: { workspace_name: editingWorkspace.name }
        });

      toast({
        title: "Succes",
        description: "Werkruimte succesvol bijgewerkt",
      });

      setEditingWorkspace(null);
      fetchWorkspaces();
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!confirm(`Weet je zeker dat je werkruimte "${workspaceName}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Werkruimte succesvol verwijderd",
      });

      fetchWorkspaces();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet verwijderen",
        variant: "destructive",
      });
    }
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

  console.log('WorkspaceSettings - Rendering with canCreateWorkspace:', canCreateWorkspace());

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Werkruimtes</h2>
        {canCreateWorkspace() && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Werkruimte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Nieuwe Werkruimte Aanmaken</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="workspace-name" className="text-sm">Werkruimte Naam</Label>
                  <Input
                    id="workspace-name"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                    placeholder="Voer werkruimte naam in"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="organization" className="text-sm">Organisatie</Label>
                  <Select
                    value={newWorkspace.organization_id}
                    onValueChange={(value) => setNewWorkspace({ ...newWorkspace, organization_id: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecteer organisatie" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button size="sm" onClick={createWorkspace}>
                    Aanmaken
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {Object.keys(groupedWorkspaces).length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              Je hebt nog geen toegang tot werkruimtes. {canCreateWorkspace() ? 'Maak een nieuwe werkruimte aan om te beginnen.' : 'Neem contact op met je beheerder om toegang te krijgen.'}
            </CardContent>
          </Card>
        ) : (
          Object.values(groupedWorkspaces).map((group) => (
            <Card key={group.organization.id} className="border-l-4 border-l-primary/20">
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
                              onClick={() => setEditingWorkspace(workspace)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteWorkspace(workspace.id, workspace.name)}
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
          ))
        )}
      </div>

      {editingWorkspace && (
        <Dialog open={!!editingWorkspace} onOpenChange={() => setEditingWorkspace(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Werkruimte Bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-workspace-name" className="text-sm">Werkruimte Naam</Label>
                <Input
                  id="edit-workspace-name"
                  value={editingWorkspace.name}
                  onChange={(e) => setEditingWorkspace({ ...editingWorkspace, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditingWorkspace(null)}>
                  Annuleren
                </Button>
                <Button size="sm" onClick={updateWorkspace}>
                  Opslaan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
