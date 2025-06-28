
import { useState, useEffect, useRef } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const fetchingRef = useRef(false);

  // Update parent component when user role changes
  useEffect(() => {
    onUserRoleUpdate(userRole);
  }, [userRole, onUserRoleUpdate]);

  const fetchUsers = async () => {
    if (!user?.id || fetchingRef.current) {
      console.log('🔍 UserManagement: Skipping fetch - no user ID or already fetching');
      return;
    }

    if (userRole === null) {
      console.log('🔍 UserManagement: Skipping fetch - user role not loaded yet');
      return;
    }

    try {
      fetchingRef.current = true;
      console.log('🔍 UserManagement: Starting fetch for user:', user.id);
      console.log('👤 User email:', user.email);
      console.log('🏷️ User role:', userRole);
      
      if (userRole === 'owner') {
        // If user has owner role, show ALL users in the entire system
        console.log('🔓 Owner access: fetching all users and invitations');
        const usersWithOrgs = await fetchUsersForAccountOwner();
        const pendingUsers = await fetchPendingInvitations();

        console.log('📨 Pending invitations:', pendingUsers);
        console.log('👥 Users with organizations:', usersWithOrgs);
        
        // Combine existing users and pending invitations, then sort by creation date
        const allUsers = [...usersWithOrgs, ...pendingUsers]
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        onUsersUpdate(allUsers);
      } else {
        console.log('🔒 Regular user access: fetching limited users');
        // For regular users
        const allUsers = await fetchUsersForRegularUser(user.id, user.email);
        onUsersUpdate(allUsers);
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      toast({
        title: "Error",
        description: "Kon gebruikers niet ophalen. Controleer je internetverbinding en probeer opnieuw.",
        variant: "destructive",
      });
      onUsersUpdate([]);
    } finally {
      fetchingRef.current = false;
      setIsInitialized(true);
    }
  };

  const userOperations = useUserOperations(user?.id, fetchUsers);

  // Only fetch once when both user and userRole are available
  useEffect(() => {
    if (user && userRole !== null && !isInitialized) {
      console.log('🔍 UserManagement: Initial fetch triggered');
      fetchUsers();
    }
  }, [user, userRole, isInitialized]);

  return {
    fetchUsers,
    updateUser: userOperations.updateUser,
    deleteUser: userOperations.deleteUser,
    inviteUser: userOperations.inviteUser
  };
};
