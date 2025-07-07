
import { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContactDialog } from '@/components/contacts/ContactDialog';

interface ContactTableFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  canInviteUsers: boolean;
  contextInfo: string;
  labelFilter: Array<{ id: string; name: string; color: string; }>;
  onRemoveLabelFilter: () => void;
  onContactsUpdated?: () => void;
}

export const ContactTableFilters = ({
  searchTerm,
  onSearchChange,
  canInviteUsers,
  contextInfo,
  labelFilter,
  onRemoveLabelFilter,
  onContactsUpdated
}: ContactTableFiltersProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleContactSaved = () => {
    if (onContactsUpdated) {
      onContactsUpdated();
    }
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Zoek contacten..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {labelFilter.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Gefilterd op:</span>
              {labelFilter.map((label) => (
                <Badge 
                  key={label.id} 
                  variant="secondary" 
                  className="flex items-center gap-1"
                  style={{ backgroundColor: label.color + '20', color: label.color }}
                >
                  {label.name}
                  <button
                    onClick={onRemoveLabelFilter}
                    className="ml-1 hover:bg-black/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canInviteUsers && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Contact
            </Button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Context: {contextInfo}
      </div>

      <ContactDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        contact={null}
        onContactSaved={handleContactSaved}
      />
    </div>
  );
};
