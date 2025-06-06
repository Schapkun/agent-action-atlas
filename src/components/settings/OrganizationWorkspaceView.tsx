import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Edit, Building2, Users, UserPlus } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  user_role?: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  created_at: string;
  user_role?: string;
}

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  isCurrentUser?: boolean;
}

interface GroupedData {
  [organizationId: string]: {
    organization: Organization;
    workspaces: Workspace[];
  };
}

export const OrganizationWorkspaceView = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const [isCreateWorkspaceDialogOpen, setIsCreateWorkspaceDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [newWorkspace, setNewWorkspace] = useState({ name: '', organization_id: '' });
  const [selectedWorkspaceUsers, setSelectedWorkspaceUsers] = useState<UserProfile[]>([]);
  const [selectedWorkspaceName, setSelectedWorkspaceName] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const isAccountOwner = user.email === 'info@schapkun.com';
      
      if (isAccountOwner) {
        // Fetch all organizations and workspaces for account owner - order by created_at ascending for newest at bottom
        const [orgResponse, workspaceResponse] = await Promise.all([
          supabase.from('organizations').select('id, name, slug, created_at').order('created_at', { ascending: true }),
          supabase.from('workspaces').select('id, name, slug, organization_id, created_at').order('created_at', { ascending: true })
        ]);

        if (orgResponse.error) throw orgResponse.error;
        if (workspaceResponse.error) throw workspaceResponse.error;

        const orgsWithRoles = orgResponse.data?.map(org => ({
          ...org,
          user_role: 'owner'
        })) || [];

        const workspacesWithRoles = workspaceResponse.data?.map(workspace => ({
          ...workspace,
          user_role: 'owner'
        })) || [];

        setOrganizations(orgsWithRoles);
        setWorkspaces(workspacesWithRoles);
      } else {
        // For regular users, fetch based on workspace membership first
        const workspaceMembership = await supabase
          .from('workspace_members')
          .select('role, workspace_id')
          .eq('user_id', user.id);

        if (workspaceMembership.error) throw workspaceMembership.error;

        if (workspaceMembership.data && workspaceMembership.data.length > 0) {
          const workspaceIds = workspaceMembership.data.map(m => m.workspace_id);
          const { data: workspaceData, error: workspaceError } = await supabase
            .from('workspaces')
            .select('id, name, slug, organization_id, created_at')
            .in('id', workspaceIds)
            .order('created_at', { ascending: true });

          if (workspaceError) throw workspaceError;

          const workspacesWithRoles = workspaceData?.map(workspace => {
            const membership = workspaceMembership.data.find(m => m.workspace_id === workspace.id);
            return { ...workspace, user_role: membership?.role };
          }) || [];

          setWorkspaces(workspacesWithRoles);

          // Get unique organization IDs from workspaces
          const orgIds = [...new Set(workspacesWithRoles.map(w => w.organization_id))];
          
          if (orgIds.length > 0) {
            const { data: orgData, error: orgError } = await supabase
              .from('organizations')
              .select('id, name, slug, created_at')
              .in('id', orgIds)
              .order('created_at', { ascending: true });

            if (orgError) throw orgError;

            const orgsWithRoles = orgData?.map(org => ({
              ...org,
              user_role: 'member' // Default role through workspace membership
            })) || [];

            setOrganizations(orgsWithRoles);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Kon gegevens niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim() || !user?.id) return;

    try {
      const slug = newOrgName.toLowerCase().replace(/\s+/g, '-');
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: newOrgName, slug: slug })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create default workspace for new organization
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: 'Hoofd Werkruimte',
          slug: 'main',
          organization_id: orgData.id
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add user as workspace admin (this gives access to the organization)
      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceData.id,
          user_id: user.id,
          role: 'admin'
        });

      toast({
        title: "Succes",
        description: "Organisatie en standaard werkruimte succesvol aangemaakt",
      });

      setNewOrgName('');
      setIsCreateOrgDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet aanmaken",
        variant: "destructive",
      });
    }
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

      toast({
        title: "Succes",
        description: "Werkruimte succesvol aangemaakt",
      });

      setNewWorkspace({ name: '', organization_id: '' });
      setIsCreateWorkspaceDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const updateOrganization = async () => {
    if (!editingOrg || !editingOrg.name.trim()) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editingOrg.name,
          slug: editingOrg.name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', editingOrg.id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Organisatie succesvol bijgewerkt",
      });

      setEditingOrg(null);
      fetchData();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet bijwerken",
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

      toast({
        title: "Succes",
        description: "Werkruimte succesvol bijgewerkt",
      });

      setEditingWorkspace(null);
      fetchData();
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Weet je zeker dat je organisatie "${orgName}" wilt verwijderen? Dit verwijdert ook alle bijbehorende werkruimtes.`)) return;

    try {
      const { error } = await supabase.from('organizations').delete().eq('id', orgId);
      if (error) throw error;

      toast({
        title: "Succes",
        description: "Organisatie en alle werkruimtes succesvol verwijderd",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const deleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!confirm(`Weet je zeker dat je werkruimte "${workspaceName}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase.from('workspaces').delete().eq('id', workspaceId);
      if (error) throw error;

      toast({
        title: "Succes",
        description: "Werkruimte succesvol verwijderd",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const viewWorkspaceUsers = async (workspaceId: string, workspaceName: string) => {
    try {
      const { data: membershipData, error: membershipError } = await supabase
        .from('workspace_members')
        .select('user_id, role')
        .eq('workspace_id', workspaceId);

      if (membershipError) throw membershipError;

      // Always include current user, even if not in membership data
      let allUserIds = membershipData?.map(m => m.user_id) || [];
      if (user?.id && !allUserIds.includes(user.id)) {
        allUserIds.push(user.id);
      }

      if (allUserIds.length === 0) {
        setSelectedWorkspaceUsers([]);
        setSelectedWorkspaceName(workspaceName);
        setIsUsersDialogOpen(true);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .in('id', allUserIds);

      if (profilesError) throw profilesError;

      const usersWithRoles = profilesData?.map(profile => {
        const membership = membershipData?.find(m => m.user_id === profile.id);
        let role = membership?.role || 'geen toegang';
        
        // If this is the current user and they don't have explicit membership, 
        // but they can see this workspace, they might have access through organization ownership
        if (profile.id === user?.id && !membership && user?.email === 'info@schapkun.com') {
          role = 'eigenaar (organisatie)';
        }

        return {
          id: profile.id,
          full_name: profile.full_name || 'Geen naam',
          email: profile.email || '',
          role: role,
          isCurrentUser: profile.id === user?.id
        };
      }) || [];

      // Sort so current user appears first
      usersWithRoles.sort((a, b) => {
        if (a.isCurrentUser) return -1;
        if (b.isCurrentUser) return 1;
        return 0;
      });

      setSelectedWorkspaceUsers(usersWithRoles);
      setSelectedWorkspaceName(workspaceName);
      setIsUsersDialogOpen(true);
    } catch (error) {
      console.error('Error fetching workspace users:', error);
      toast({
        title: "Error",
        description: "Kon gebruikers niet ophalen",
        variant: "destructive",
      });
    }
  };

  // Group workspaces by organization
  const groupedData: GroupedData = workspaces.reduce((acc, workspace) => {
    if (!acc[workspace.organization_id]) {
      const org = organizations.find(o => o.id === workspace.organization_id);
      if (org) {
        acc[workspace.organization_id] = {
          organization: org,
          workspaces: []
        };
      }
    }
    if (acc[workspace.organization_id]) {
      acc[workspace.organization_id].workspaces.push(workspace);
    }
    return acc;
  }, {} as GroupedData);

  // Add organizations without workspaces
  organizations.forEach(org => {
    if (!groupedData[org.id]) {
      groupedData[org.id] = {
        organization: org,
        workspaces: []
      };
    }
  });

  if (loading) {
    return <div className="text-sm">Gegevens laden...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Organisaties & Werkruimtes</h2>
        <div className="flex gap-2">
          <Dialog open={isCreateOrgDialogOpen} onOpenChange={setIsCreateOrgDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Organisatie
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Nieuwe Organisatie</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="org-name" className="text-sm">Naam</Label>
                  <Input
                    id="org-name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Organisatie naam"
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsCreateOrgDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button size="sm" onClick={createOrganization}>
                    Aanmaken
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateWorkspaceDialogOpen} onOpenChange={setIsCreateWorkspaceDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Werkruimte
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-lg">Nieuwe Werkruimte</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="workspace-name" className="text-sm">Naam</Label>
                  <Input
                    id="workspace-name"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                    placeholder="Werkruimte naam"
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
                  <Button variant="outline" size="sm" onClick={() => setIsCreateWorkspaceDialogOpen(false)}>
                    Annuleren
                  </Button>
                  <Button size="sm" onClick={createWorkspace}>
                    Aanmaken
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {Object.keys(groupedData).length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              Geen organisaties of werkruimtes gevonden.
            </CardContent>
          </Card>
        ) : (
          Object.values(groupedData).map((group) => (
            <Card key={group.organization.id} className="border-l-4 border-l-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-base">{group.organization.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      ({group.workspaces.length} werkruimte{group.workspaces.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {(user?.email === 'info@schapkun.com') && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingOrg(group.organization)}
                          title="Bewerk organisatie"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOrganization(group.organization.id, group.organization.name)}
                          className="text-destructive hover:text-destructive"
                          title="Verwijder organisatie"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              {group.workspaces.length > 0 && (
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewWorkspaceUsers(workspace.id, workspace.name)}
                            title="Bekijk gebruikers"
                          >
                            <Users className="h-3 w-3" />
                          </Button>
                          {(workspace.user_role === 'admin' || workspace.user_role === 'owner' || user?.email === 'info@schapkun.com') && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingWorkspace(workspace)}
                                title="Bewerk werkruimte"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteWorkspace(workspace.id, workspace.name)}
                                className="text-destructive hover:text-destructive"
                                title="Verwijder werkruimte"
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
              )}
            </Card>
          ))
        )}
      </div>

      {/* Edit Organization Dialog */}
      {editingOrg && (
        <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Organisatie Bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-org-name" className="text-sm">Naam</Label>
                <Input
                  id="edit-org-name"
                  value={editingOrg.name}
                  onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditingOrg(null)}>
                  Annuleren
                </Button>
                <Button size="sm" onClick={updateOrganization}>
                  Opslaan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Workspace Dialog */}
      {editingWorkspace && (
        <Dialog open={!!editingWorkspace} onOpenChange={() => setEditingWorkspace(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Werkruimte Bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-workspace-name" className="text-sm">Naam</Label>
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

      {/* Workspace Users Dialog */}
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Gebruikers in {selectedWorkspaceName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedWorkspaceUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Geen gebruikers gevonden in deze werkruimte.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Naam</TableHead>
                    <TableHead className="text-xs">E-mail</TableHead>
                    <TableHead className="text-xs">Rol</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedWorkspaceUsers.map((userProfile) => (
                    <TableRow key={userProfile.id} className={userProfile.isCurrentUser ? "bg-muted/50" : ""}>
                      <TableCell className="text-sm">
                        {userProfile.full_name}
                        {userProfile.isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(jij)</span>}
                      </TableCell>
                      <TableCell className="text-sm">{userProfile.email}</TableCell>
                      <TableCell className="text-sm">{userProfile.role}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
