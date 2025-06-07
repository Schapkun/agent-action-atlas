import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  organizations?: string[];
  workspaces?: string[];
  isPending?: boolean;
  invitationId?: string;
  role?: string;
  avatar_url?: string | null;
  updated_at?: string;
  member_since?: string;
}

interface UserManagementProps {
  onUsersUpdate: (users: UserProfile[]) => void;
  onUserRoleUpdate: (role: string | null) => void;
}

export const UserManagement = ({ onUsersUpdate, onUserRoleUpdate }: UserManagementProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserRole = async () => {
    if (!user?.id) return;

    try {
      // Check if user is account owner
      if (user.email === 'info@schapkun.com') {
        onUserRoleUpdate('owner');
        return;
      }

      // Get user's role from their organization memberships
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .limit(1);

      if (memberships && memberships.length > 0) {
        onUserRoleUpdate(memberships[0].role);
      } else {
        onUserRoleUpdate('member');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      onUserRoleUpdate('member');
    }
  };

  const fetchUsers = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      console.log('Fetching users for user:', user.id);
      console.log('User email:', user.email);
      
      // Check if user is the account owner (Michael Schapkun)
      const isAccountOwner = user.email === 'info@schapkun.com';
      console.log('Is account owner:', isAccountOwner);
      
      if (isAccountOwner) {
        // If account owner, show ALL users in the entire system
        console.log('Fetching ALL users for account owner...');
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });

        if (usersError) {
          console.error('Users fetch error:', usersError);
          throw usersError;
        }

        console.log('All users data (account owner):', usersData);
        
        // For each user, get their organization memberships, roles, and workspaces
        const usersWithOrgs = await Promise.all(
          (usersData || []).map(async (userProfile) => {
            // Get organization memberships
            const { data: orgMemberships } = await supabase
              .from('organization_members')
              .select(`
                organization_id, 
                role, 
                created_at,
                organizations!organization_members_organization_id_fkey(name)
              `)
              .eq('user_id', userProfile.id);

            // Get workspace memberships  
            const { data: workspaceMemberships } = await supabase
              .from('workspace_members')
              .select(`
                workspace_id,
                role,
                created_at,
                workspaces!workspace_members_workspace_id_fkey(name)
              `)
              .eq('user_id', userProfile.id);

            const organizations = orgMemberships?.map(m => (m as any).organizations?.name).filter(Boolean) || [];
            const workspaces = workspaceMemberships?.map(m => (m as any).workspaces?.name).filter(Boolean) || [];
            
            // Get the highest role from organizations
            const roles = orgMemberships?.map(m => m.role) || [];
            let highestRole = 'member';
            if (roles.includes('owner')) highestRole = 'owner';
            else if (roles.includes('admin')) highestRole = 'admin';

            // Special case for the account owner
            if (userProfile.email === 'info@schapkun.com') {
              highestRole = 'eigenaar';
            }

            // Use the earliest membership date as "member since" date
            const membershipDates = [
              ...(orgMemberships?.map(m => m.created_at) || []),
              ...(workspaceMemberships?.map(m => m.created_at) || [])
            ];
            const earliestMembership = membershipDates.length > 0 
              ? Math.min(...membershipDates.map(d => new Date(d).getTime()))
              : new Date(userProfile.created_at).getTime();

            return {
              ...userProfile,
              organizations,
              workspaces,
              isPending: false,
              role: highestRole,
              member_since: new Date(earliestMembership).toISOString()
            };
          })
        );

        // Also fetch pending invitations
        const { data: pendingInvitations, error: invitationsError } = await supabase
          .from('user_invitations')
          .select(`
            id,
            email,
            created_at,
            role,
            organization_id,
            workspace_id,
            organizations(name),
            workspaces(name)
          `)
          .is('accepted_at', null)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: true });

        if (invitationsError) {
          console.error('Invitations fetch error:', invitationsError);
        }

        // Convert pending invitations to user profile format
        const pendingUsers = (pendingInvitations || []).map(invitation => ({
          id: invitation.id,
          email: invitation.email,
          full_name: `${invitation.email} (Uitnodiging pending)`,
          created_at: invitation.created_at,
          organizations: [(invitation as any).organizations?.name].filter(Boolean),
          workspaces: [(invitation as any).workspaces?.name].filter(Boolean),
          isPending: true,
          invitationId: invitation.id,
          role: invitation.role,
          avatar_url: null,
          updated_at: invitation.created_at,
          member_since: invitation.created_at
        }));

        console.log('Pending invitations:', pendingUsers);
        console.log('Users with organizations:', usersWithOrgs);
        
        // Combine existing users and pending invitations, then sort by creation date
        const allUsers = [...usersWithOrgs, ...pendingUsers]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        onUsersUpdate(allUsers);
      } else {
        // For regular users, always include themselves first
        console.log('Fetching users for regular user...');
        
        // First, get current user's profile
        const { data: currentUserProfile, error: currentUserError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Current user profile query result:', { currentUserProfile, currentUserError });

        if (currentUserError) {
          console.error('Current user profile fetch error:', currentUserError);
          if (currentUserError.code === 'PGRST116') {
            console.log('Creating missing profile for user:', user.id);
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.email
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating profile:', createError);
              throw createError;
            }
            
            console.log('Created new profile:', newProfile);
            onUsersUpdate([{...newProfile, isPending: false, role: 'member', member_since: newProfile.created_at}]);
            return;
          } else {
            throw currentUserError;
          }
        }

        // Get current user's role and membership info
        const { data: currentUserMemberships } = await supabase
          .from('organization_members')
          .select('role, created_at')
          .eq('user_id', user.id);

        const currentUserRoles = currentUserMemberships?.map(m => m.role) || [];
        let currentUserRole = 'member';
        if (currentUserRoles.includes('owner')) currentUserRole = 'owner';
        else if (currentUserRoles.includes('admin')) currentUserRole = 'admin';

        const currentUserMemberSince = currentUserMemberships?.length > 0 
          ? currentUserMemberships[0].created_at 
          : currentUserProfile.created_at;

        let allUsers = [{
          ...currentUserProfile, 
          isPending: false, 
          role: currentUserRole,
          member_since: currentUserMemberSince,
          organizations: [],
          workspaces: []
        }];
        
        // Then get their organization memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        console.log('Organization memberships:', { membershipData, membershipError });

        if (membershipError) {
          console.error('Membership fetch error:', membershipError);
        } else if (membershipData && membershipData.length > 0) {
          // If user has organizations, get other users in those organizations
          const orgIds = membershipData.map(m => m.organization_id);
          console.log('Organization IDs:', orgIds);
          
          // Get all users in these organizations (excluding current user)
          const { data: orgUsersData, error: orgUsersError } = await supabase
            .from('organization_members')
            .select(`
              user_id, 
              role, 
              created_at,
              profiles(id, email, full_name, created_at, avatar_url, updated_at)
            `)
            .in('organization_id', orgIds)
            .neq('user_id', user.id);

          console.log('Organization users data:', { orgUsersData, orgUsersError });

          if (!orgUsersError && orgUsersData) {
            // Add organization users with their roles and membership info
            for (const item of orgUsersData) {
              const userProfile = (item as any).profiles;
              if (userProfile) {
                // Get this user's organizations and workspaces
                const { data: userOrgMemberships } = await supabase
                  .from('organization_members')
                  .select(`
                    organization_id, 
                    role, 
                    created_at,
                    organizations!organization_members_organization_id_fkey(name)
                  `)
                  .eq('user_id', userProfile.id);

                const { data: userWorkspaceMemberships } = await supabase
                  .from('workspace_members')
                  .select(`
                    workspace_id,
                    role,
                    created_at,
                    workspaces!workspace_members_workspace_id_fkey(name)
                  `)
                  .eq('user_id', userProfile.id);

                const organizations = userOrgMemberships?.map(m => (m as any).organizations?.name).filter(Boolean) || [];
                const workspaces = userWorkspaceMemberships?.map(m => (m as any).workspaces?.name).filter(Boolean) || [];

                allUsers.push({
                  ...userProfile, 
                  isPending: false, 
                  role: item.role,
                  member_since: item.created_at,
                  organizations,
                  workspaces
                });
              }
            }
          }

          // Also fetch pending invitations for the organizations the user is part of
          const { data: pendingInvitations, error: invitationsError } = await supabase
            .from('user_invitations')
            .select(`
              id,
              email,
              created_at,
              role,
              organization_id,
              workspace_id,
              organizations(name),
              workspaces(name)
            `)
            .in('organization_id', orgIds)
            .is('accepted_at', null)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: true });

          if (!invitationsError && pendingInvitations) {
            // Convert pending invitations to user profile format
            const pendingUsers = pendingInvitations.map(invitation => ({
              id: invitation.id,
              email: invitation.email,
              full_name: `${invitation.email} (Uitnodiging pending)`,
              created_at: invitation.created_at,
              organizations: [(invitation as any).organizations?.name].filter(Boolean),
              workspaces: [(invitation as any).workspaces?.name].filter(Boolean),
              isPending: true,
              invitationId: invitation.id,
              role: invitation.role,
              avatar_url: null,
              updated_at: invitation.created_at,
              member_since: invitation.created_at
            }));

            allUsers = [...allUsers, ...pendingUsers];
          }
        }

        // Update current user with their organization and workspace info
        if (allUsers.length > 0) {
          const { data: currentUserOrgMemberships } = await supabase
            .from('organization_members')
            .select(`
              organization_id, 
              role, 
              created_at,
              organizations!organization_members_organization_id_fkey(name)
            `)
            .eq('user_id', user.id);

          const { data: currentUserWorkspaceMemberships } = await supabase
            .from('workspace_members')
            .select(`
              workspace_id,
              role,
              created_at,
              workspaces!workspace_members_workspace_id_fkey(name)
            `)
            .eq('user_id', user.id);

          const currentUserOrganizations = currentUserOrgMemberships?.map(m => (m as any).organizations?.name).filter(Boolean) || [];
          const currentUserWorkspaces = currentUserWorkspaceMemberships?.map(m => (m as any).workspaces?.name).filter(Boolean) || [];

          allUsers[0].organizations = currentUserOrganizations;
          allUsers[0].workspaces = currentUserWorkspaces;
        }

        // Remove duplicates based on user ID/email and sort by creation date
        const uniqueUsers = allUsers
          .filter((user, index, arr) => 
            arr.findIndex(u => u.id === user.id || u.email === user.email) === index
          )
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

        console.log('Final user list for regular user:', uniqueUsers);
        onUsersUpdate(uniqueUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Kon gebruikers niet ophalen. Controleer je internetverbinding en probeer opnieuw.",
        variant: "destructive",
      });
      onUsersUpdate([]);
    }
  };

  const updateUser = async (editingUser: UserProfile) => {
    if (!editingUser || !editingUser.email.trim() || !user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: editingUser.email,
          full_name: editingUser.full_name
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            action: 'Gebruiker bijgewerkt',
            details: { user_email: editingUser.email }
          });
      } catch (logError) {
        console.error('Failed to log user update:', logError);
      }

      toast({
        title: "Succes",
        description: "Gebruiker succesvol bijgewerkt",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Weet je zeker dat je gebruiker "${userEmail}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Gebruiker succesvol verwijderd",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const inviteUser = async (inviteEmail: string) => {
    if (!inviteEmail.trim() || !user?.id) return;
    // For now, just show a success message
    // In a real implementation, you would send an invitation email
  };

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchUsers();
    }
  }, [user]);

  return {
    fetchUsers,
    updateUser,
    deleteUser,
    inviteUser
  };
};
