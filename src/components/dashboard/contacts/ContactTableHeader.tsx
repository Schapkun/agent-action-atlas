
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
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
  labels: boolean;
}

interface ContactTableHeaderProps {
  isAllSelected: boolean;
  isIndeterminate: boolean;
  selectedContactsCount: number;
  columnVisibility: ColumnVisibility;
  onSelectAll: (checked: boolean) => void;
  onColumnVisibilityChange: (column: keyof ColumnVisibility, checked: boolean) => void;
  onBulkDelete: () => void;
}

export const ContactTableHeader = ({
  isAllSelected,
  isIndeterminate,
  selectedContactsCount,
  columnVisibility,
  onSelectAll,
  onColumnVisibilityChange,
  onBulkDelete
}: ContactTableHeaderProps) => {
  return (
    <TableHeader>
      <TableRow className="border-b">
        <TableHead className="w-8 p-2">
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate;
            }}
            onCheckedChange={onSelectAll}
            className="h-4 w-4"
          />
        </TableHead>
        <TableHead className="p-2 text-xs font-semibold w-16">Klantnr</TableHead>
        <TableHead className="p-2 text-xs font-semibold">Klant</TableHead>
        {columnVisibility.email && (
          <TableHead className="p-2 text-xs font-semibold">E-mail</TableHead>
        )}
        {columnVisibility.address && (
          <TableHead className="p-2 text-xs font-semibold">Adres</TableHead>
        )}
        {columnVisibility.phone && (
          <TableHead className="p-2 text-xs font-semibold">Telefoon</TableHead>
        )}
        {columnVisibility.mobile && (
          <TableHead className="p-2 text-xs font-semibold">Mobiel</TableHead>
        )}
        {columnVisibility.postal_code && (
          <TableHead className="p-2 text-xs font-semibold">Postcode</TableHead>
        )}
        {columnVisibility.city && (
          <TableHead className="p-2 text-xs font-semibold">Plaats</TableHead>
        )}
        {columnVisibility.country && (
          <TableHead className="p-2 text-xs font-semibold">Land</TableHead>
        )}
        {columnVisibility.labels && (
          <TableHead className="p-2 text-xs font-semibold">Labels</TableHead>
        )}
        {columnVisibility.openstaand && (
          <TableHead className="p-2 text-xs font-semibold text-right">Openstaand</TableHead>
        )}
        {columnVisibility.omzet && (
          <TableHead className="p-2 text-xs font-semibold text-right">Omzet</TableHead>
        )}
        {columnVisibility.actief && (
          <TableHead className="p-2 text-xs font-semibold text-center">Actief</TableHead>
        )}
        <TableHead className="p-2 text-xs font-semibold w-20">
          <div className="flex items-center gap-1">
            {selectedContactsCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBulkDelete}
                className="h-6 px-1 text-red-600 hover:text-red-700"
                title="Geselecteerde contacten verwijderen"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Eye className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
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
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.labels}
                  onCheckedChange={(checked) => onColumnVisibilityChange('labels', checked)}
                >
                  Labels
                </DropdownMenuCheckboxItem>
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
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.actief}
                  onCheckedChange={(checked) => onColumnVisibilityChange('actief', checked)}
                >
                  Actief
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};
