
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Archive, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ColumnVisibility {
  email: boolean;
  openstaand: boolean;
  omzet: boolean;
  actief: boolean;
}

interface ContactTableHeaderProps {
  isAllSelected: boolean;
  isIndeterminate: boolean;
  selectedContactsCount: number;
  columnVisibility: ColumnVisibility;
  onSelectAll: (checked: boolean) => void;
  onColumnVisibilityChange: (column: keyof ColumnVisibility, checked: boolean) => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
}

export const ContactTableHeader = ({
  isAllSelected,
  isIndeterminate,
  selectedContactsCount,
  columnVisibility,
  onSelectAll,
  onColumnVisibilityChange,
  onBulkArchive,
  onBulkDelete
}: ContactTableHeaderProps) => {
  return (
    <>
      {/* Bulk Actions Row */}
      {selectedContactsCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border-b">
          <Button variant="outline" size="sm" onClick={onBulkArchive}>
            <Archive className="h-4 w-4 mr-2" />
            Archiveren ({selectedContactsCount})
          </Button>
          <Button variant="outline" size="sm" onClick={onBulkDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Verwijderen ({selectedContactsCount})
          </Button>
          
          {/* Column visibility settings */}
          <div className="ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.email}
                  onCheckedChange={(checked) => 
                    onColumnVisibilityChange('email', checked)
                  }
                >
                  E-mail
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.openstaand}
                  onCheckedChange={(checked) => 
                    onColumnVisibilityChange('openstaand', checked)
                  }
                >
                  Openstaand
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.omzet}
                  onCheckedChange={(checked) => 
                    onColumnVisibilityChange('omzet', checked)
                  }
                >
                  Omzet
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.actief}
                  onCheckedChange={(checked) => 
                    onColumnVisibilityChange('actief', checked)
                  }
                >
                  Actief
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Table Header */}
      <TableHeader>
        <TableRow className="text-xs border-b bg-gray-50">
          <TableHead className="w-8 p-3">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className={`h-4 w-4 ${isIndeterminate ? 'data-[state=checked]:bg-blue-500' : ''}`}
              data-state={isIndeterminate ? 'indeterminate' : isAllSelected ? 'checked' : 'unchecked'}
            />
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground p-3 w-20">Klantnr</TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground p-3">Klant</TableHead>
          {columnVisibility.email && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3">E-mail</TableHead>
          )}
          {columnVisibility.openstaand && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3 text-right w-24">Openstaand</TableHead>
          )}
          {columnVisibility.omzet && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3 text-right w-24">Omzet</TableHead>
          )}
          {columnVisibility.actief && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3 text-center w-16">Actief</TableHead>
          )}
        </TableRow>
      </TableHeader>
    </>
  );
};
