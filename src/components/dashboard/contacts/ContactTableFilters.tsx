
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, UserPlus, X } from 'lucide-react';

interface ContactTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onNewContact: () => void;
  canInviteUsers: boolean;
  contextInfo: string;
  labelFilter?: Array<{ id: string; name: string; color: string; }>;
  onRemoveLabelFilter?: () => void;
}

export const ContactTableFilters = ({
  searchTerm,
  onSearchChange,
  onNewContact,
  canInviteUsers,
  contextInfo,
  labelFilter = [],
  onRemoveLabelFilter
}: ContactTableFiltersProps) => {
  return (
    <>
      <div className="text-sm text-muted-foreground">
        {contextInfo}
      </div>
      
      {labelFilter.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md border">
          <span className="text-xs text-muted-foreground">Gefilterd op labels:</span>
          <div className="flex gap-1 flex-wrap">
            {labelFilter.map((label) => (
              <Badge
                key={label.id}
                style={{ backgroundColor: label.color, color: 'white' }}
                className="text-xs px-2 py-1 h-5 border-0"
              >
                {label.name}
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveLabelFilter}
            className="h-6 w-6 p-0 ml-auto"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
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
