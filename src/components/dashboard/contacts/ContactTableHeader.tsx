
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Archive, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface ColumnVisibility {
  email: boolean;
  address: boolean;
  phone: boolean;
  mobile: boolean;
  postal_code: boolean;
  city: boolean;
  country: boolean;
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
          {columnVisibility.address && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3">Adres</TableHead>
          )}
          {columnVisibility.phone && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3">Telefoon</TableHead>
          )}
          {columnVisibility.mobile && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3">Mobiel</TableHead>
          )}
          {columnVisibility.postal_code && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3">Postcode</TableHead>
          )}
          {columnVisibility.city && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3">Plaats</TableHead>
          )}
          {columnVisibility.country && (
            <TableHead className="text-xs font-medium text-muted-foreground p-3">Land</TableHead>
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
          
          <TableHead className="text-xs font-medium text-muted-foreground p-3 w-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuLabel>Contactgegevens</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.email}
                  onCheckedChange={(checked) => onColumnVisibilityChange('email', checked)}
                >
                  E-mail
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.address}
                  onCheckedChange={(checked) => onColumnVisibilityChange('address', checked)}
                >
                  Adres
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.phone}
                  onCheckedChange={(checked) => onColumnVisibilityChange('phone', checked)}
                >
                  Telefoon
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.mobile}
                  onCheckedChange={(checked) => onColumnVisibilityChange('mobile', checked)}
                >
                  Mobiel
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.postal_code}
                  onCheckedChange={(checked) => onColumnVisibilityChange('postal_code', checked)}
                >
                  Postcode
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.city}
                  onCheckedChange={(checked) => onColumnVisibilityChange('city', checked)}
                >
                  Plaats
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.country}
                  onCheckedChange={(checked) => onColumnVisibilityChange('country', checked)}
                >
                  Land
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Financiële gegevens</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.openstaand}
                  onCheckedChange={(checked) => onColumnVisibilityChange('openstaand', checked)}
                >
                  Openstaand
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.omzet}
                  onCheckedChange={(checked) => onColumnVisibilityChange('omzet', checked)}
                >
                  Omzet
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.actief}
                  onCheckedChange={(checked) => onColumnVisibilityChange('actief', checked)}
                >
                  Actief
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableHead>
        </TableRow>
      </TableHeader>
    </>
  );
};
