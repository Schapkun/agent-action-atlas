
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
  onInviteUser: () => void;
  userRole?: string;
}

export const UserFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  filterRole, 
  setFilterRole, 
  onInviteUser,
  userRole = 'member'
}: UserFiltersProps) => {
  const { user } = useAuth();
  
  // Check if user can invite users (admin, owner or account owner)
  const canInviteUsers = userRole === 'admin' || userRole === 'owner' || user?.email === 'info@schapkun.com';

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Zoek gebruikers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-full sm:w-[180px]">
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

      {canInviteUsers && (
        <Button onClick={onInviteUser} size="sm" className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Gebruiker Uitnodigen
        </Button>
      )}
    </div>
  );
};
