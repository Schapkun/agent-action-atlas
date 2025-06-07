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
import { User, Building2, Save, Trash2, Briefcase } from 'lucide-react';

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
  workspaces: Workspace[];
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

type UserRole = "owner" | "admin" | "member";

export const MyAccount = ({ viewingUserId, isEditingOtherUser = false }: MyAccountProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalRole, setGlobalRole] = useState<UserRole>('member');
  const { user } = useAuth();
  const { toast } = useToast();

  const targetUserId = viewingUserId || user?.id;
  const isViewingOwnProfile = !isEditingOtherUser && targetUserId === user?.id;

  // Helper function to translate user roles
  const translateRole = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'Eigenaar';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Gebruiker';
      default:
        return role;
    }
  };

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

      // Check if this is the account owner
      const isAccountOwner = profileData?.email === 'info@schapkun.com';

      // Fetch organizations with their workspaces
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
          setOrganizations([]);
        } else {
          const orgs = orgData?.map(item => ({
            id: item.organizations?.id || '',
            name: item.organizations?.name || '',
            role: isAccountOwner ? 'owner' : item.role, // Force owner role for account owner
            workspaces: []
          })) || [];

          // Now fetch workspaces for each organization
          const orgsWithWorkspaces = await Promise.all(
            orgs.map(async (org) => {
              const { data: workspaceData, error: workspaceError } = await supabase
                .from('workspace_members')
                .select(`
                  role,
                  workspaces!fk_workspace_members_workspace (
                    id,
                    name,
                    organization_id
                  )
                `)
                .eq('user_id', targetUserId);

              if (workspaceError) {
                console.error('Workspaces fetch error for org:', org.id, workspaceError);
                return org;
              }

              const workspaces = workspaceData
                ?.filter(item => item.workspaces?.organization_id === org.id)
                ?.map(item => ({
                  id: item.workspaces?.id || '',
                  name: item.workspaces?.name || '',
                  organization_name: org.name,
                  role: isAccountOwner ? 'owner' : item.role // Force owner role for account owner
                })) || [];

              return {
                ...org,
                workspaces
              };
            })
          );

          setOrganizations(orgsWithWorkspaces);
          
          // Set global role based on account owner status or first organization role
          if (isAccountOwner) {
            setGlobalRole('owner');
          } else if (orgsWithWorkspaces.length > 0) {
            setGlobalRole(orgsWithWorkspaces[0].role as UserRole);
          }
        }
      } catch (orgErr) {
        console.error('Organizations error:', orgErr);
        setOrganizations([]);
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

  const updateGlobalRole = async (newRole: UserRole) => {
    if (!targetUserId || !user?.id) return;

    try {
      // Update all organization memberships
      const orgPromises = organizations.map(org => 
        supabase
          .from('organization_members')
          .update({ role: newRole })
          .eq('user_id', targetUserId)
          .eq('organization_id', org.id)
      );

      // Update all workspace memberships
      const workspacePromises = organizations.flatMap(org =>
        org.workspaces.map(workspace => 
          supabase
            .from('workspace_members')
            .update({ role: newRole })
            .eq('user_id', targetUserId)
            .eq('workspace_id', workspace.id)
        )
      );

      await Promise.all([...orgPromises, ...workspacePromises]);

      // Log the action
      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            action: 'Globale gebruikersrol bijgewerkt',
            details: { 
              target_user_id: targetUserId,
              new_role: newRole,
              organizations: organizations.length,
              workspaces: organizations.reduce((acc, org) => acc + org.workspaces.length, 0)
            }
          });
      } catch (logError) {
        console.error('Failed to log role update:', logError);
      }

      setGlobalRole(newRole);
      toast({
        title: "Succes",
        description: `Rol bijgewerkt naar ${translateRole(newRole)} voor alle organisaties en werkruimtes`,
      });

      // Refresh data to show updated roles
      fetchUserData();
    } catch (error) {
      console.error('Error updating global role:', error);
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
      <div className="space-y-4 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-4 p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Kon profiel niet laden. Probeer de pagina te vernieuwen.</p>
          <Button onClick={fetchUserData} className="mt-3" size="sm">
            Opnieuw proberen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-sm">
            {getInitials(profile.full_name || profile.email || 'U')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-semibold">
            {isViewingOwnProfile ? 'Mijn Account' : `Account van ${profile.full_name || profile.email}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isViewingOwnProfile 
              ? 'Beheer je persoonlijke gegevens en voorkeuren'
              : 'Bekijk en beheer gebruikersgegevens'
            }
          </p>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Persoonlijke Informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full-name" className="text-sm">Volledige Naam</Label>
              <Input
                id="full-name"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Voer volledige naam in"
                disabled={!isViewingOwnProfile}
                className="text-sm"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ''}
                placeholder="Voer e-mailadres in"
                disabled={true}
                className="bg-muted/50 cursor-not-allowed text-sm"
              />
            </div>
          </div>
          
          {/* Global Role Management with button next to it */}
          {user?.email === 'info@schapkun.com' && organizations.length > 0 && (
            <div className="flex gap-4 items-end">
              <div className="flex-1 md:w-1/2">
                <Label htmlFor="global-role" className="text-sm">Globale Rol (voor alle organisaties en werkruimtes)</Label>
                <Select
                  value={globalRole}
                  onValueChange={(newRole) => updateGlobalRole(newRole as UserRole)}
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Gebruiker</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Eigenaar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isViewingOwnProfile && (
                <Button onClick={updateProfile} disabled={saving} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Opslaan...' : 'Profiel Opslaan'}
                </Button>
              )}
            </div>
          )}

          {/* If no global role section, show save button normally */}
          {isViewingOwnProfile && !(user?.email === 'info@schapkun.com' && organizations.length > 0) && (
            <div className="flex justify-end">
              <Button onClick={updateProfile} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Opslaan...' : 'Profiel Opslaan'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organizations & Workspaces */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            {isViewingOwnProfile ? 'Mijn Organisaties & Werkruimtes' : 'Organisaties & Werkruimtes'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {isViewingOwnProfile 
                ? 'Je bent nog geen lid van een organisatie'
                : 'Deze gebruiker is nog geen lid van een organisatie'
              }
            </p>
          ) : (
            <div className="space-y-3">
              {organizations.map((org) => (
                <div key={org.id} className="p-3 bg-muted/30 rounded-lg border-l-4 border-l-primary/20">
                  {/* Organization Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium text-sm">{org.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            Organisatie • Werkruimtes ({org.workspaces.length})
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromOrganization(org.id, org.name)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Workspaces under this organization */}
                  {org.workspaces.length > 0 && (
                    <div className="ml-5 space-y-2">
                      {org.workspaces.map((workspace) => (
                        <div key={workspace.id} className="flex items-center justify-between p-2 bg-muted/15 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-3 w-3 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{workspace.name}</p>
                              <p className="text-xs text-muted-foreground">Werkruimte</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromWorkspace(workspace.id, workspace.name)}
                            className="text-destructive hover:text-destructive h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
