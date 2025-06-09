
import React, { useState } from 'react';
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

export const UserManagementComponent = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleUsersUpdate = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
  };

  const handleUserRoleUpdate = (role: string | null) => {
    setUserRole(role);
  };

  // Initialize the hook
  const userManagement = UserManagement({
    onUsersUpdate: handleUsersUpdate,
    onUserRoleUpdate: handleUserRoleUpdate
  });

  // For now, return a simple div - this would be expanded with actual UI
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Gebruikersbeheer</h2>
      <p className="text-muted-foreground">
        Gebruikers: {users.length} | Rol: {userRole || 'Laden...'}
      </p>
    </div>
  );
};
