
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, Building2, Settings, Save, Trash2 } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  organization_name: string;
  role?: string;
}

interface MyAccountProps {
  viewingUserId?: string;
  isEditingOtherUser?: boolean;
}

export const MyAccount = ({ viewingUserId, isEditingOtherUser = false }: MyAccountProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const targetUserId = viewingUserId || user?.id;
  const isViewingOwnProfile = !isEditingOtherUser && targetUserId === user?.id;

  useEffect(() => {
    if (targetUserId) {
      fetchUserData();
    }
  }, [targetUserId]);

  const fetchUserData = async () => {
    if (!targetUserId) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching user data for user:', targetUserId);
      
      // First try to get from user_profiles table
      let { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', targetUserId)
        .maybeSingle();

      // If no profile in user_profiles, try profiles table as fallback
      if (!profileData && !profileError) {
        console.log('No profile in user_profiles, trying profiles table as fallback');
        const { data: fallbackProfile, error: fallbackError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', targetUserId)
          .maybeSingle();

        if (fallbackError) {
          console.error('Fallback profile fetch error:', fallbackError);
        } else if (fallbackProfile) {
          profileData = fallbackProfile;
          console.log('Using fallback profile from profiles table:', fallbackProfile);
        }
      }

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }

      // If still no profile and we're viewing own profile, create one
      if (!profileData && isViewingOwnProfile && user) {
        console.log('No profile found, creating one for current user');
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            id: targetUserId,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || ''
          })
          .select()
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
          throw createError;
        }
        
        profileData = newProfile;
        console.log('Created new profile:', newProfile);
      }

      setProfile(profileData);

      // Fetch organizations with better error handling
      try {
        const { data: orgData, error: orgError } = await supabase
          .from('organization_members')
          .select(`
            role,
            organizations!fk_organization_members_organization (
              id,
              name
            )
          `)
          .eq('user_id', targetUserId);

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
        } else {
          const orgs = orgData?.map(item => ({
            id: item.organizations?.id || '',
            name: item.organizations?.name || '',
            role: item.role
          })) || [];
          setOrganizations(orgs);
        }
      } catch (orgErr) {
        console.error('Organizations error:', orgErr);
        setOrganizations([]);
      }

      // Fetch workspaces with better error handling
      try {
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspace_members')
          .select(`
            role,
            workspaces!fk_workspace_members_workspace (
              id,
              name,
              organizations!fk_workspaces_organization (
                name
              )
            )
          `)
          .eq('user_id', targetUserId);

        if (workspaceError) {
          console.error('Workspaces fetch error:', workspaceError);
        } else {
          const workspaces = workspaceData?.map(item => ({
            id: item.workspaces?.id || '',
            name: item.workspaces?.name || '',
            organization_name: item.workspaces?.organizations?.name || '',
            role: item.role
          })) || [];
          setWorkspaces(workspaces);
        }
      } catch (wsErr) {
        console.error('Workspaces error:', wsErr);
        setWorkspaces([]);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Kon gebruikersgegevens niet ophalen. Probeer de pagina te vernieuwen.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile || !user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.full_name,
          email: profile.email
        })
        .eq('id', profile.id);

      if (error) throw error;

      // Log the update
      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            action: isViewingOwnProfile ? 'Profiel bijgewerkt' : 'Gebruikersprofiel bijgewerkt',
            details: { full_name: profile.full_name, email: profile.email, target_user_id: profile.id }
          });
      } catch (logError) {
        console.error('Failed to log update:', logError);
      }

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
    } finally {
      setSaving(false);
    }
  };

  const updateOrganizationRole = async (organizationId: string, newRole: string, organizationName: string) => {
    if (!targetUserId || !user?.id) return;

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('user_id', targetUserId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      // Log the action
      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            action: 'Organisatierol bijgewerkt',
            details: { 
              target_user_id: targetUserId,
              organization_id: organizationId,
              organization_name: organizationName,
              new_role: newRole
            }
          });
      } catch (logError) {
        console.error('Failed to log role update:', logError);
      }

      toast({
        title: "Succes",
        description: `Rol bijgewerkt naar ${newRole} in organisatie "${organizationName}"`,
      });

      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error('Error updating organization role:', error);
      toast({
        title: "Error",
        description: "Kon rol niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const updateWorkspaceRole = async (workspaceId: string, newRole: string, workspaceName: string) => {
    if (!targetUserId || !user?.id) return;

    try {
      const { error } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('user_id', targetUserId)
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      // Log the action
      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            action: 'Werkruimterol bijgewerkt',
            details: { 
              target_user_id: targetUserId,
              workspace_id: workspaceId,
              workspace_name: workspaceName,
              new_role: newRole
            }
          });
      } catch (logError) {
        console.error('Failed to log role update:', logError);
      }

      toast({
        title: "Succes",
        description: `Rol bijgewerkt naar ${newRole} in werkruimte "${workspaceName}"`,
      });

      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error('Error updating workspace role:', error);
      toast({
        title: "Error",
        description: "Kon rol niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const removeFromOrganization = async (organizationId: string, organizationName: string) => {
    if (!targetUserId || !user?.id) return;

    const confirmMessage = isViewingOwnProfile 
      ? `Weet je zeker dat je jezelf wilt verwijderen uit organisatie "${organizationName}"?`
      : `Weet je zeker dat je deze gebruiker wilt verwijderen uit organisatie "${organizationName}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('user_id', targetUserId)
        .eq('organization_id', organizationId);

      if (error) throw error;

      // Log the action
      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            action: isViewingOwnProfile ? 'Zichzelf verwijderd uit organisatie' : 'Gebruiker verwijderd uit organisatie',
            details: { 
              target_user_id: targetUserId,
              organization_id: organizationId,
              organization_name: organizationName
            }
          });
      } catch (logError) {
        console.error('Failed to log organization removal:', logError);
      }

      toast({
        title: "Succes",
        description: `${isViewingOwnProfile ? 'Jezelf' : 'Gebruiker'} verwijderd uit organisatie "${organizationName}"`,
      });

      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error('Error removing from organization:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet verwijderen uit organisatie",
        variant: "destructive",
      });
    }
  };

  const removeFromWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!targetUserId || !user?.id) return;

    const confirmMessage = isViewingOwnProfile 
      ? `Weet je zeker dat je jezelf wilt verwijderen uit werkruimte "${workspaceName}"?`
      : `Weet je zeker dat je deze gebruiker wilt verwijderen uit werkruimte "${workspaceName}"?`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('user_id', targetUserId)
        .eq('workspace_id', workspaceId);

      if (error) throw error;

      // Log the action
      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            action: isViewingOwnProfile ? 'Zichzelf verwijderd uit werkruimte' : 'Gebruiker verwijderd uit werkruimte',
            details: { 
              target_user_id: targetUserId,
              workspace_id: workspaceId,
              workspace_name: workspaceName
            }
          });
      } catch (logError) {
        console.error('Failed to log workspace removal:', logError);
      }

      toast({
        title: "Succes",
        description: `${isViewingOwnProfile ? 'Jezelf' : 'Gebruiker'} verwijderd uit werkruimte "${workspaceName}"`,
      });

      // Refresh data
      fetchUserData();
    } catch (error) {
      console.error('Error removing from workspace:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet verwijderen uit werkruimte",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Kon profiel niet laden. Probeer de pagina te vernieuwen.</p>
          <Button onClick={fetchUserData} className="mt-4">
            Opnieuw proberen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-lg">
            {getInitials(profile.full_name || profile.email || 'U')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">
            {isViewingOwnProfile ? 'Mijn Account' : `Account van ${profile.full_name || profile.email}`}
          </h1>
          <p className="text-muted-foreground">
            {isViewingOwnProfile 
              ? 'Beheer je persoonlijke gegevens en voorkeuren'
              : 'Bekijk en beheer gebruikersgegevens'
            }
          </p>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Persoonlijke Informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full-name">Volledige Naam</Label>
              <Input
                id="full-name"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Voer volledige naam in"
                disabled={!isViewingOwnProfile}
              />
            </div>
            <div>
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Voer e-mailadres in"
                disabled={!isViewingOwnProfile}
              />
            </div>
          </div>
          {isViewingOwnProfile && (
            <Button onClick={updateProfile} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Opslaan...' : 'Profiel Opslaan'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {isViewingOwnProfile ? 'Mijn Organisaties' : 'Organisaties'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <p className="text-muted-foreground">
              {isViewingOwnProfile 
                ? 'Je bent nog geen lid van een organisatie'
                : 'Deze gebruiker is nog geen lid van een organisatie'
              }
            </p>
          ) : (
            <div className="space-y-3">
              {organizations.map((org) => (
                <div key={org.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{org.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">Rol:</span>
                      <Select
                        value={org.role}
                        onValueChange={(newRole) => updateOrganizationRole(org.id, newRole, org.name)}
                        disabled={isViewingOwnProfile}
                      >
                        <SelectTrigger 
                          className={`w-32 h-8 text-xs ${isViewingOwnProfile ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromOrganization(org.id, org.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workspaces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {isViewingOwnProfile ? 'Mijn Werkruimtes' : 'Werkruimtes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <p className="text-muted-foreground">
              {isViewingOwnProfile 
                ? 'Je hebt nog geen toegang tot werkruimtes'
                : 'Deze gebruiker heeft nog geen toegang tot werkruimtes'
              }
            </p>
          ) : (
            <div className="space-y-3">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{workspace.name}</p>
                    <p className="text-sm text-muted-foreground mb-1">Organisatie: {workspace.organization_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rol:</span>
                      <Select
                        value={workspace.role || 'member'}
                        onValueChange={(newRole) => updateWorkspaceRole(workspace.id, newRole, workspace.name)}
                        disabled={isViewingOwnProfile}
                      >
                        <SelectTrigger 
                          className={`w-32 h-8 text-xs ${isViewingOwnProfile ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromWorkspace(workspace.id, workspace.name)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
