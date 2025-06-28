
import React, { useEffect } from 'react';
import { UserManagement } from './UserManagement';

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

interface UserFiltersProps {
  users: UserProfile[];
  onUsersUpdate: (users: UserProfile[]) => void;
  onUserRoleUpdate: (role: string | null) => void;
}

export const UserFilters = ({ users, onUsersUpdate, onUserRoleUpdate }: UserFiltersProps) => {
  const userManagement = UserManagement({ onUsersUpdate, onUserRoleUpdate });

  useEffect(() => {
    userManagement.fetchUsers();
  }, []);

  return null; // This component only handles the logic, UI is in UserList
};
