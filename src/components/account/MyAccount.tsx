import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileSection } from './UserProfileSection';
import { OrganizationsList } from './OrganizationsList';

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
  onClose?: () => void;
}

type UserRole = "owner" | "admin" | "member";

export const MyAccount = ({ viewingUserId, isEditingOtherUser = false, onClose }: MyAccountProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalRole, setGlobalRole] = useState<UserRole>('member');
  const [originalGlobalRole, setOriginalGlobalRole] = useState<UserRole>('member');
  const [hasChanges, setHasChanges] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const targetUserId = viewingUserId || user?.id;
  const isViewingOwnProfile = !isEditingOtherUser && targetUserId === user?.id;

  // Helper function to translate user roles consistently
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

  // Check for changes whenever profile or globalRole changes
  useEffect(() => {
    if (originalProfile && profile) {
      const profileChanged = originalProfile.full_name !== profile.full_name || 
                           originalProfile.email !== profile.email;
      const roleChanged = originalGlobalRole !== globalRole;
      setHasChanges(profileChanged || roleChanged);
    }
  }, [profile, globalRole, originalProfile, originalGlobalRole]);

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

      // Check if the currently logged in user is the account owner
      // NOT the user being viewed
      const isCurrentUserAccountOwner = user?.email === 'info@schapkun.com';
      console.log('Is current user (not target user) account owner?', isCurrentUserAccountOwner);

      // Fetch organizations with their workspaces for the TARGET USER
      try {
        console.log('Fetching organizations for TARGET user:', targetUserId);
        
        // Always fetch based on actual membership, regardless of who is viewing
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

        console.log('Organization query result for target user:', { orgData, orgError });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          setOrganizations([]);
        } else {
          const orgs = orgData?.map(item => ({
            id: item.organizations?.id || '',
            name: item.organizations?.name || '',
            role: item.role,
            workspaces: []
          })) || [];

          console.log('Mapped organizations for target user:', orgs);

          // Now fetch workspaces for each organization that the TARGET USER is member of
          const orgsWithWorkspaces = await Promise.all(
            orgs.map(async (org) => {
              console.log('Fetching workspaces for organization:', org.id, 'for target user:', targetUserId);
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

              console.log('Workspace query result for org', org.id, 'and target user:', { workspaceData, workspaceError });

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
                  role: item.role
                })) || [];

              console.log('Filtered workspaces for org', org.id, 'and target user:', workspaces);

              return {
                ...org,
                workspaces
              };
            })
          );

          console.log('Final organizations with workspaces for target user:', orgsWithWorkspaces);
          setOrganizations(orgsWithWorkspaces);
          
          // Set global role based on first organization role
          if (orgsWithWorkspaces.length > 0) {
            setGlobalRole(orgsWithWorkspaces[0].role as UserRole);
          } else {
            setGlobalRole('member');
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

  const handleSave = async () => {
    if (!profile || !user?.id) return;

    setSaving(true);
    try {
      // Update profile if changed
      if (originalProfile && (originalProfile.full_name !== profile.full_name || originalProfile.email !== profile.email)) {
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
      }

      // Update global role if changed
      if (originalGlobalRole !== globalRole) {
        await updateGlobalRole(globalRole);
      }

      // Update original values to reflect saved state
      setOriginalProfile({ ...profile });
      setOriginalGlobalRole(globalRole);
      setHasChanges(false);

      toast({
        title: "Succes",
        description: "Wijzigingen succesvol opgeslagen",
      });

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Kon wijzigingen niet opslaan",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (originalProfile) {
      setProfile({ ...originalProfile });
    }
    setGlobalRole(originalGlobalRole);
    setHasChanges(false);
    
    if (onClose) {
      onClose();
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
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse text-sm text-muted-foreground">
          Gebruikersgegevens laden...
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-sm mb-3">Kon profiel niet laden. Probeer de pagina te vernieuwen.</p>
          <Button onClick={fetchUserData} size="sm">
            Opnieuw proberen
          </Button>
        </div>
      </div>
    );
  }

  const isCurrentUserAccountOwner = user?.email === 'info@schapkun.com';
  const showRoleManagement = isCurrentUserAccountOwner && organizations.length > 0;

  return (
    <div className="h-full flex flex-col">
      {/* Content Area - Scrollable */}
      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6 pb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-sm">
                {getInitials(profile.full_name || profile.email || 'U')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">
                {isViewingOwnProfile ? 'Mijn Account' : `Account van ${profile.full_name || profile.email}`}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isViewingOwnProfile 
                  ? 'Beheer je persoonlijke gegevens en voorkeuren'
                  : 'Bekijk en beheer gebruikersgegevens'
                }
              </p>
            </div>
          </div>

          {/* Combined Profile Information and Role Management */}
          <UserProfileSection
            profile={profile}
            setProfile={setProfile}
            isViewingOwnProfile={isViewingOwnProfile}
            saving={false}
            onUpdateProfile={() => {}} // We handle saving in this component now
            showSaveButton={false} // We have our own save/cancel buttons
            globalRole={globalRole}
            onUpdateGlobalRole={setGlobalRole}
            showRoleManagement={showRoleManagement}
          />

          {/* Organizations & Workspaces */}
          <OrganizationsList
            organizations={organizations}
            isViewingOwnProfile={isViewingOwnProfile}
            onRemoveFromOrganization={removeFromOrganization}
            onRemoveFromWorkspace={removeFromWorkspace}
          />
        </div>
      </ScrollArea>

      {/* Fixed Footer with Save/Cancel Buttons */}
      <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0">
        <Button variant="outline" onClick={handleCancel}>
          Annuleren
        </Button>
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </div>
    </div>
  );
};
