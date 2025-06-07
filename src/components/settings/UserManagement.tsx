
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
          .order('created_at', { ascending: false });

        if (usersError) {
          console.error('Users fetch error:', usersError);
          throw usersError;
        }

        console.log('All users data (account owner):', usersData);
        
        // For each user, get their organization memberships
        const usersWithOrgs = await Promise.all(
          (usersData || []).map(async (userProfile) => {
            const { data: orgMemberships } = await supabase
              .from('organization_members')
              .select('organization_id, organizations(name)')
              .eq('user_id', userProfile.id);

            const organizations = orgMemberships?.map(m => (m as any).organizations?.name).filter(Boolean) || [];

            return {
              ...userProfile,
              organizations
            };
          })
        );

        console.log('Users with organizations:', usersWithOrgs);
        onUsersUpdate(usersWithOrgs);
      } else {
        // For regular users, always include themselves first
        console.log('Fetching users for regular user...');
        console.log('Regular user ID:', user.id);
        console.log('Regular user email:', user.email);
        
        // First, get current user's profile
        const { data: currentUserProfile, error: currentUserError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Current user profile query result:', { currentUserProfile, currentUserError });

        if (currentUserError) {
          console.error('Current user profile fetch error:', currentUserError);
          // If we can't find the current user's profile, create it
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
            onUsersUpdate([newProfile]);
            return;
          } else {
            throw currentUserError;
          }
        }

        let allUsers = [currentUserProfile]; // Always include current user
        console.log('Starting with current user:', currentUserProfile);
        
        // Then get their organization memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        console.log('Organization memberships:', { membershipData, membershipError });

        if (membershipError) {
          console.error('Membership fetch error:', membershipError);
          // Don't throw error here, just continue with current user only
          console.log('Continuing with current user only due to membership error');
        } else if (membershipData && membershipData.length > 0) {
          // If user has organizations, get other users in those organizations
          const orgIds = membershipData.map(m => m.organization_id);
          console.log('Organization IDs:', orgIds);
          
          // Get all users in these organizations (excluding current user)
          const { data: orgUsersData, error: orgUsersError } = await supabase
            .from('organization_members')
            .select('user_id, profiles(id, email, full_name, created_at)')
            .in('organization_id', orgIds)
            .neq('user_id', user.id); // Exclude current user to avoid duplicates

          console.log('Organization users data:', { orgUsersData, orgUsersError });

          if (orgUsersError) {
            console.error('Organization users fetch error:', orgUsersError);
            // Don't throw error here, just continue with current user only
            console.log('Continuing with current user only due to org users error');
          } else {
            // Add organization users
            orgUsersData?.forEach(item => {
              const userProfile = (item as any).profiles;
              if (userProfile) {
                allUsers.push(userProfile);
              }
            });
          }
        } else {
          console.log('No organization memberships found, showing only current user');
        }

        // Remove duplicates based on user ID
        const uniqueUsers = allUsers.filter((user, index, arr) => 
          arr.findIndex(u => u.id === user.id) === index
        );

        console.log('Final user list for regular user:', uniqueUsers);
        console.log('Number of users:', uniqueUsers.length);
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
