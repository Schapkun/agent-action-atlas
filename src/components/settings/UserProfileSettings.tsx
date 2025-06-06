import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Edit, Mail, Shield, User } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  organization_role?: string;
  organization_id?: string;
  organization_name?: string;
}

interface Organization {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
  organization_id: string;
}

const menuItems = [
  { id: 'overview', label: 'Dashboard Overzicht' },
  { id: 'pending-tasks', label: 'Openstaande Taken' },
  { id: 'actions', label: 'AI Acties' },
  { id: 'documents', label: 'Documenten' },
  { id: 'active-dossiers', label: 'Actieve Dossiers' },
  { id: 'closed-dossiers', label: 'Gesloten Dossiers' },
  { id: 'invoices', label: 'Facturen' },
  { id: 'phone-calls', label: 'Telefoongesprekken' },
  { id: 'emails', label: 'E-mails' },
  { id: 'contacts', label: 'Contacten' },
  { id: 'settings', label: 'Instellingen' }
];

export const UserProfileSettings = () => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [roleEditDialogOpen, setRoleEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newInvite, setNewInvite] = useState({
    email: '',
    role: 'member' as 'owner' | 'admin' | 'member',
    organization_ids: [] as string[],
    workspace_ids: [] as string[],
    menu_access: [] as string[]
  });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfiles();
    fetchCurrentUserProfile();
    fetchOrganizations();
    fetchWorkspaces();
    fetchCurrentUserRole();
  }, []);

  const fetchCurrentUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user?.id)
        .limit(1)
        .single();

      if (error) throw error;
      setCurrentUserRole(data?.role || 'member');
    } catch (error) {
      console.error('Error fetching current user role:', error);
    }
  };

  const fetchCurrentUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setCurrentUserProfile(data);
    } catch (error) {
      console.error('Error fetching current user profile:', error);
    }
  };

  const fetchUserProfiles = async () => {
    // Only fetch all profiles if user is admin or owner
    if (currentUserRole === 'member') {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          organization_members(role, organization_id, organizations(name))
        `);

      if (error) throw error;

      const profilesWithOrgInfo = data?.map(profile => ({
        ...profile,
        organization_role: profile.organization_members?.[0]?.role,
        organization_id: profile.organization_members?.[0]?.organization_id,
        organization_name: profile.organization_members?.[0]?.organizations?.name
      })) || [];

      setUserProfiles(profilesWithOrgInfo);
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
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, organization_id')
        .order('name');

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const updateCurrentUserProfile = async () => {
    if (!currentUserProfile) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: currentUserProfile.full_name,
          email: currentUserProfile.email
        })
        .eq('id', user?.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          action: 'Profiel bijgewerkt',
          details: { full_name: currentUserProfile.full_name, email: currentUserProfile.email }
        });

      toast({
        title: "Succes",
        description: "Profiel succesvol bijgewerkt",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Kon profiel niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Weet je zeker dat je gebruiker "${userName}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Gebruiker succesvol verwijderd",
      });

      fetchUserProfiles();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const canEditUser = (userRole: string) => {
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin' && userRole !== 'owner') return true;
    return false;
  };

  const canDeleteUser = (userRole: string) => {
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin' && userRole !== 'owner') return true;
    return false;
  };

  if (loading) {
    return <div>Gebruikersprofielen laden...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Gebruikersprofielen</h2>

      {/* Current User Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Mijn Profiel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUserProfile && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current-name">Volledige Naam</Label>
                  <Input
                    id="current-name"
                    value={currentUserProfile.full_name || ''}
                    onChange={(e) => setCurrentUserProfile({
                      ...currentUserProfile,
                      full_name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="current-email">E-mailadres</Label>
                  <Input
                    id="current-email"
                    value={currentUserProfile.email || ''}
                    onChange={(e) => setCurrentUserProfile({
                      ...currentUserProfile,
                      email: e.target.value
                    })}
                  />
                </div>
              </div>
              <Button onClick={updateCurrentUserProfile}>
                Profiel Bijwerken
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Other User Profiles (only for admin/owner) */}
      {(currentUserRole === 'admin' || currentUserRole === 'owner') && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Alle Gebruikers</h3>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <Mail className="h-4 w-4 mr-2" />
              Gebruiker Uitnodigen
            </Button>
          </div>

          <div className="grid gap-4">
            {userProfiles.map((profile) => (
              <Card key={profile.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{profile.full_name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {profile.email} • Rol: {profile.organization_role} • 
                        Organisatie: {profile.organization_name}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {canEditUser(profile.organization_role || '') && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(profile);
                              setRoleEditDialogOpen(true);
                            }}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(profile)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {canDeleteUser(profile.organization_role || '') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteUser(profile.id, profile.full_name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Invite User Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gebruiker Uitnodigen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invite-email">E-mailadres</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  placeholder="gebruiker@example.com"
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Rol</Label>
                <Select
                  value={newInvite.role}
                  onValueChange={(value: 'owner' | 'admin' | 'member') => 
                    setNewInvite({ ...newInvite, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Lid</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {currentUserRole === 'owner' && (
                      <SelectItem value="owner">Eigenaar</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Organisaties</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={newInvite.organization_ids.includes(org.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewInvite({
                            ...newInvite,
                            organization_ids: [...newInvite.organization_ids, org.id]
                          });
                        } else {
                          setNewInvite({
                            ...newInvite,
                            organization_ids: newInvite.organization_ids.filter(id => id !== org.id)
                          });
                        }
                      }}
                    />
                    <Label className="text-sm">{org.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Werkruimtes</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {workspaces.map((workspace) => (
                  <div key={workspace.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={newInvite.workspace_ids.includes(workspace.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewInvite({
                            ...newInvite,
                            workspace_ids: [...newInvite.workspace_ids, workspace.id]
                          });
                        } else {
                          setNewInvite({
                            ...newInvite,
                            workspace_ids: newInvite.workspace_ids.filter(id => id !== workspace.id)
                          });
                        }
                      }}
                    />
                    <Label className="text-sm">{workspace.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Menu Toegang</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={newInvite.menu_access.includes(item.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNewInvite({
                            ...newInvite,
                            menu_access: [...newInvite.menu_access, item.id]
                          });
                        } else {
                          setNewInvite({
                            ...newInvite,
                            menu_access: newInvite.menu_access.filter(id => id !== item.id)
                          });
                        }
                      }}
                    />
                    <Label className="text-sm">{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Annuleren
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Info",
                  description: "Uitnodigingsfunctionaliteit wordt binnenkort toegevoegd",
                });
                setInviteDialogOpen(false);
              }}>
                Uitnodigen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
