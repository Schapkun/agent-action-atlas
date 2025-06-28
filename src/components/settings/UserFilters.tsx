import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Search } from 'lucide-react';
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
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  filterRole?: string;
  setFilterRole?: (role: string) => void;
  onInviteUser?: () => void;
  userRole?: string;
}

export const UserFilters = ({ 
  users, 
  onUsersUpdate, 
  onUserRoleUpdate,
  searchTerm = '',
  setSearchTerm,
  filterRole = 'all',
  setFilterRole,
  onInviteUser,
  userRole = 'member'
}: UserFiltersProps) => {
  const userManagement = UserManagement({ onUsersUpdate, onUserRoleUpdate });

  useEffect(() => {
    userManagement.fetchUsers();
  }, []);

  // If search and filter props are provided, render the filter UI
  if (setSearchTerm && setFilterRole && onInviteUser) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gebruikersbeheer</h2>
          <Button onClick={onInviteUser} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Gebruiker uitnodigen
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Zoek op naam of e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter op rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle rollen</SelectItem>
              <SelectItem value="eigenaar">Eigenaar</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="gebruiker">Gebruiker</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  // Otherwise, just handle the logic without UI
  return null;
};
