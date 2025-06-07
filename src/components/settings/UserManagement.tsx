
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserDataFetcher } from './hooks/useUserDataFetcher';
import { useUserOperations } from './hooks/useUserOperations';
import { useUserRole } from './hooks/useUserRole';

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
  const { fetchUsersForAccountOwner, fetchPendingInvitations, fetchUsersForRegularUser } = useUserDataFetcher();
  const { userRole } = useUserRole(user?.id, user?.email);

  // Update parent component when user role changes
  useEffect(() => {
    onUserRoleUpdate(userRole);
  }, [userRole, onUserRoleUpdate]);

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
        const usersWithOrgs = await fetchUsersForAccountOwner();
        const pendingUsers = await fetchPendingInvitations();

        console.log('Pending invitations:', pendingUsers);
        console.log('Users with organizations:', usersWithOrgs);
        
        // Combine existing users and pending invitations, then sort by creation date
        const allUsers = [...usersWithOrgs, ...pendingUsers]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        onUsersUpdate(allUsers);
      } else {
        // For regular users
        const allUsers = await fetchUsersForRegularUser(user.id, user.email);
        onUsersUpdate(allUsers);
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

  const userOperations = useUserOperations(user?.id, fetchUsers);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  return {
    fetchUsers,
    updateUser: userOperations.updateUser,
    deleteUser: userOperations.deleteUser,
    inviteUser: userOperations.inviteUser
  };
};
