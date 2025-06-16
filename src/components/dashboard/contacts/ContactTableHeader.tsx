
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Archive, Trash2, Check } from 'lucide-react';
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
        <TableRow className="h-10 border-b bg-gray-50">
          <TableHead className="w-8 p-2">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={onSelectAll}
              className={`h-4 w-4 ${isIndeterminate ? 'data-[state=checked]:bg-blue-500' : ''}`}
              data-state={isIndeterminate ? 'indeterminate' : isAllSelected ? 'checked' : 'unchecked'}
            />
          </TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground p-2 w-16">Klantnr</TableHead>
          <TableHead className="text-xs font-medium text-muted-foreground p-2">Klant</TableHead>
          
          {columnVisibility.email && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2">E-mail</TableHead>
          )}
          {columnVisibility.address && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2">Adres</TableHead>
          )}
          {columnVisibility.phone && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2">Telefoon</TableHead>
          )}
          {columnVisibility.mobile && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2">Mobiel</TableHead>
          )}
          {columnVisibility.postal_code && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2">Postcode</TableHead>
          )}
          {columnVisibility.city && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2">Plaats</TableHead>
          )}
          {columnVisibility.country && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2">Land</TableHead>
          )}
          {columnVisibility.openstaand && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2 text-right w-20">Openstaand</TableHead>
          )}
          {columnVisibility.omzet && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2 text-right w-20">Omzet</TableHead>
          )}
          {columnVisibility.actief && (
            <TableHead className="text-xs font-medium text-muted-foreground p-2 text-center w-16">Actief</TableHead>
          )}
          
          <TableHead className="text-xs font-medium text-muted-foreground p-2 w-20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white">
                <DropdownMenuLabel className="text-xs font-semibold">Contactgegevens</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.email}
                  onCheckedChange={(checked) => onColumnVisibilityChange('email', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.email && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.email ? "ml-5" : ""}>E-mail</span>
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.address}
                  onCheckedChange={(checked) => onColumnVisibilityChange('address', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.address && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.address ? "ml-5" : ""}>Adres</span>
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.phone}
                  onCheckedChange={(checked) => onColumnVisibilityChange('phone', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.phone && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.phone ? "ml-5" : ""}>Telefoon</span>
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.mobile}
                  onCheckedChange={(checked) => onColumnVisibilityChange('mobile', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.mobile && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.mobile ? "ml-5" : ""}>Mobiel</span>
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.postal_code}
                  onCheckedChange={(checked) => onColumnVisibilityChange('postal_code', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.postal_code && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.postal_code ? "ml-5" : ""}>Postcode</span>
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.city}
                  onCheckedChange={(checked) => onColumnVisibilityChange('city', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.city && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.city ? "ml-5" : ""}>Plaats</span>
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.country}
                  onCheckedChange={(checked) => onColumnVisibilityChange('country', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.country && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.country ? "ml-5" : ""}>Land</span>
                  </div>
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-semibold">Financiële gegevens</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.openstaand}
                  onCheckedChange={(checked) => onColumnVisibilityChange('openstaand', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.openstaand && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.openstaand ? "ml-5" : ""}>Openstaand</span>
                  </div>
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.omzet}
                  onCheckedChange={(checked) => onColumnVisibilityChange('omzet', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.omzet && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.omzet ? "ml-5" : ""}>Omzet</span>
                  </div>
                </DropdownMenuCheckboxItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-semibold">Status</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.actief}
                  onCheckedChange={(checked) => onColumnVisibilityChange('actief', checked)}
                  className="text-xs"
                >
                  <div className="flex items-center">
                    {columnVisibility.actief && <Check className="h-3 w-3 mr-2" />}
                    <span className={!columnVisibility.actief ? "ml-5" : ""}>Actief</span>
                  </div>
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableHead>
        </TableRow>
      </TableHeader>
    </>
  );
};
