
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
import { Trash2, Plus, Edit, UserPlus, Building2, Users } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  role?: string;
  organization_id?: string;
  organization_name?: string;
  organizations?: {
    id: string;
    name: string;
    workspaces: {
      id: string;
      name: string;
      role: string;
    }[];
  }[];
}

interface Organization {
  id: string;
  name: string;
}

export const UserProfileSettings = () => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'member', organization_id: '' });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProfiles();
      fetchOrganizations();
    }
  }, [user]);

  const fetchUserProfiles = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching user profiles');

      const isAccountOwner = user.email === 'info@schapkun.com';

      if (isAccountOwner) {
        // Account owner sees ALL users and their memberships
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, avatar_url, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Profiles error:', profilesError);
          throw profilesError;
        }

        // Get all workspace memberships for all users
        const { data: workspaceMemberships, error: workspaceError } = await supabase
          .from('workspace_members')
          .select(`
            user_id,
            role,
            workspace_id,
            workspaces!workspace_members_workspace_id_fkey (
              id,
              name,
              organization_id,
              organizations!workspaces_organization_id_fkey (
                id,
                name
              )
            )
          `);

        if (workspaceError) {
          console.error('Workspace memberships error:', workspaceError);
          throw workspaceError;
        }

        // Process the profiles and group workspaces by organization
        const profilesWithMemberships = profilesData?.map(profile => {
          const userWorkspaces = workspaceMemberships
            ?.filter(wm => wm.user_id === profile.id)
            ?.map(wm => ({
              id: wm.workspace_id,
              name: wm.workspaces?.name || 'Onbekend',
              role: wm.role,
              organization_id: wm.workspaces?.organization_id,
              organization_name: wm.workspaces?.organizations?.name || 'Onbekend'
            })) || [];

          // Group workspaces by organization
          const organizationsMap = new Map();
          userWorkspaces.forEach(workspace => {
            const orgId = workspace.organization_id;
            const orgName = workspace.organization_name;
            
            if (!organizationsMap.has(orgId)) {
              organizationsMap.set(orgId, {
                id: orgId,
                name: orgName,
                workspaces: []
              });
            }
            
            organizationsMap.get(orgId).workspaces.push({
              id: workspace.id,
              name: workspace.name,
              role: workspace.role
            });
          });

          const organizations = Array.from(organizationsMap.values());

          return {
            id: profile.id,
            full_name: profile.full_name || 'Geen naam',
            email: profile.email || '',
            avatar_url: profile.avatar_url,
            created_at: profile.created_at || '',
            organizations: organizations
          };
        }) || [];

        setUserProfiles(profilesWithMemberships);
      } else {
        // Regular users see only users from their organizations
        const { data: membershipData, error: membershipError } = await supabase
          .from('workspace_members')
          .select('role, workspace_id, user_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Membership error:', membershipError);
          throw membershipError;
        }

        if (!membershipData || membershipData.length === 0) {
          setUserProfiles([]);
          setLoading(false);
          return;
        }

        // Get workspaces and organizations
        const workspaceIds = membershipData.map(m => m.workspace_id);
        const { data: workspaceData, error: workspaceDataError } = await supabase
          .from('workspaces')
          .select('id, name, organization_id')
          .in('id', workspaceIds);

        if (workspaceDataError) throw workspaceDataError;

        const orgIds = [...new Set(workspaceData?.map(w => w.organization_id) || [])];
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds);

        if (orgError) throw orgError;

        // Get all workspace members from user's organizations
        const { data: allWorkspaceMembers, error: allMembersError } = await supabase
          .from('workspace_members')
          .select('user_id, role, workspace_id')
          .in('workspace_id', workspaceIds);

        if (allMembersError) throw allMembersError;

        // Get unique user IDs
        const userIds = [...new Set(allWorkspaceMembers?.map(m => m.user_id) || [])];
        
        if (userIds.length === 0) {
          setUserProfiles([]);
          setLoading(false);
          return;
        }

        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, avatar_url, created_at')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Process profiles with membership info grouped by organization
        const profilesWithMemberships = profilesData?.map(profile => {
          const userWorkspaces = allWorkspaceMembers
            ?.filter(wm => wm.user_id === profile.id)
            ?.map(wm => {
              const workspace = workspaceData?.find(w => w.id === wm.workspace_id);
              const organization = orgData?.find(o => o.id === workspace?.organization_id);
              return {
                id: wm.workspace_id,
                name: workspace?.name || 'Onbekend',
                role: wm.role,
                organization_id: workspace?.organization_id,
                organization_name: organization?.name || 'Onbekend'
              };
            }) || [];

          // Group workspaces by organization
          const organizationsMap = new Map();
          userWorkspaces.forEach(workspace => {
            const orgId = workspace.organization_id;
            const orgName = workspace.organization_name;
            
            if (!organizationsMap.has(orgId)) {
              organizationsMap.set(orgId, {
                id: orgId,
                name: orgName,
                workspaces: []
              });
            }
            
            organizationsMap.get(orgId).workspaces.push({
              id: workspace.id,
              name: workspace.name,
              role: workspace.role
            });
          });

          const organizations = Array.from(organizationsMap.values());

          return {
            id: profile.id,
            full_name: profile.full_name || 'Geen naam',
            email: profile.email || '',
            avatar_url: profile.avatar_url,
            created_at: profile.created_at || '',
            organizations: organizations
          };
        }) || [];

        setUserProfiles(profilesWithMemberships);
      }
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      toast({
        title: "Error",
        description: "Kon gebruikersprofielen niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    if (!user?.id) return;

    try {
      // Get organizations where user has admin or owner role
      const { data: membershipData, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'owner']);

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
        .in('id', orgIds);

      if (orgError) {
        console.error('Organizations fetch error:', orgError);
        return;
      }

      setOrganizations(orgData || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const inviteUser = async () => {
    if (!newInvite.email.trim() || !newInvite.organization_id) return;

    try {
      const { error } = await supabase
        .from('user_invitations')
        .insert({
          email: newInvite.email,
          role: newInvite.role as 'owner' | 'admin' | 'member',
          organization_id: newInvite.organization_id,
          invited_by: user?.id
        });

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: newInvite.organization_id,
          action: 'Gebruiker uitgenodigd',
          details: { invited_email: newInvite.email, role: newInvite.role }
        });

      toast({
        title: "Succes",
        description: "Uitnodiging succesvol verzonden",
      });

      setNewInvite({ email: '', role: 'member', organization_id: '' });
      setIsInviteDialogOpen(false);
      fetchUserProfiles();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet verzenden",
        variant: "destructive",
      });
    }
  };

  const updateUserProfile = async () => {
    if (!editingProfile) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editingProfile.full_name,
          email: editingProfile.email
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: editingProfile.organization_id,
          action: 'Gebruikersprofiel bijgewerkt',
          details: { profile_id: editingProfile.id, profile_name: editingProfile.full_name }
        });

      toast({
        title: "Succes",
        description: "Gebruikersprofiel succesvol bijgewerkt",
      });

      setEditingProfile(null);
      fetchUserProfiles();
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Error",
        description: "Kon gebruikersprofiel niet bijwerken",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Gebruikersprofielen laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gebruikersprofielen</h2>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Gebruiker Uitnodigen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Gebruiker Uitnodigen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">E-mailadres</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  placeholder="Voer e-mailadres in"
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Rol</Label>
                <Select
                  value={newInvite.role}
                  onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Lid</SelectItem>
                    <SelectItem value="admin">Beheerder</SelectItem>
                    <SelectItem value="owner">Eigenaar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="invite-org">Organisatie</Label>
                <Select
                  value={newInvite.organization_id}
                  onValueChange={(value) => setNewInvite({ ...newInvite, organization_id: value })}
                >
                  <SelectTrigger>
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
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={inviteUser}>
                  Uitnodigen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {userProfiles.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Geen gebruikersprofielen gevonden.
            </CardContent>
          </Card>
        ) : (
          userProfiles.map((profile) => (
            <Card key={profile.id} className="border-l-4 border-l-primary/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{profile.full_name}</CardTitle>
                      {profile.id === user?.id && (
                        <span className="text-xs text-muted-foreground">(jij)</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {profile.email}
                    </p>
                    
                    {profile.organizations && profile.organizations.length > 0 && (
                      <div className="space-y-4">
                        {profile.organizations.map((organization, orgIndex) => (
                          <div key={orgIndex} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-base">{organization.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({organization.workspaces.length} werkruimte{organization.workspaces.length !== 1 ? 's' : ''})
                              </span>
                            </div>
                            
                            {organization.workspaces.length > 0 && (
                              <div className="ml-6">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead className="text-xs">Werkruimte</TableHead>
                                      <TableHead className="text-xs">Rol</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {organization.workspaces.map((workspace) => (
                                      <TableRow key={workspace.id}>
                                        <TableCell className="py-2">
                                          <div className="flex items-center gap-2">
                                            <Users className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-sm">{workspace.name}</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-2">
                                          <span className="text-xs bg-muted px-2 py-1 rounded">
                                            {workspace.role}
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-4">
                      Aangemaakt: {new Date(profile.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProfile(profile)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {editingProfile && (
        <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gebruikersprofiel Bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Volledige Naam</Label>
                <Input
                  id="edit-name"
                  value={editingProfile.full_name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">E-mailadres</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingProfile.email}
                  onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingProfile(null)}>
                  Annuleren
                </Button>
                <Button onClick={updateUserProfile}>
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
