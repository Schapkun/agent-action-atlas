
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
  onInviteUser: () => void;
}

export const UserFilters = ({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  onInviteUser
}: UserFiltersProps) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-4">
        <Input
          placeholder="Zoek gebruikers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
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
      <Button onClick={onInviteUser} className="flex items-center gap-2">
        <User className="h-4 w-4" />
        Gebruiker Uitnodigen
      </Button>
    </div>
  );
};
