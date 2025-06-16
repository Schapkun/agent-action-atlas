
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';

interface ContactTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewContact: () => void;
  canInviteUsers: boolean;
  contextInfo: string;
}

export const ContactTableFilters = ({
  searchTerm,
  onSearchChange,
  onNewContact,
  canInviteUsers,
  contextInfo
}: ContactTableFiltersProps) => {
  return (
    <>
      <div className="text-sm text-muted-foreground">
        {contextInfo}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoeken in deze tabel"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {canInviteUsers && (
          <Button variant="outline" size="sm" onClick={onNewContact}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nieuw
          </Button>
        )}
      </div>
    </>
  );
};
