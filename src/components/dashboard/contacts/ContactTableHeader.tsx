import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Settings, Archive, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
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
  const handleColumnToggle = (column: keyof ColumnVisibility, checked: boolean) => {
    // Prevent event propagation to keep dropdown open
    onColumnVisibilityChange(column, checked);
  };

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
        <TableRow className="h-8 border-b bg-gray-50/50">
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
              <DropdownMenuContent align="end" className="w-56 bg-white" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuLabel className="text-xs font-semibold">Contactgegevens</DropdownMenuLabel>
                
                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('email', !columnVisibility.email);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.email}
                      onCheckedChange={(checked) => handleColumnToggle('email', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>E-mail</span>
                  </div>
                </div>

                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('address', !columnVisibility.address);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.address}
                      onCheckedChange={(checked) => handleColumnToggle('address', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Adres</span>
                  </div>
                </div>

                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('phone', !columnVisibility.phone);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.phone}
                      onCheckedChange={(checked) => handleColumnToggle('phone', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Telefoon</span>
                  </div>
                </div>

                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('mobile', !columnVisibility.mobile);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.mobile}
                      onCheckedChange={(checked) => handleColumnToggle('mobile', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Mobiel</span>
                  </div>
                </div>

                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('postal_code', !columnVisibility.postal_code);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.postal_code}
                      onCheckedChange={(checked) => handleColumnToggle('postal_code', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Postcode</span>
                  </div>
                </div>

                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('city', !columnVisibility.city);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.city}
                      onCheckedChange={(checked) => handleColumnToggle('city', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Plaats</span>
                  </div>
                </div>

                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('country', !columnVisibility.country);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.country}
                      onCheckedChange={(checked) => handleColumnToggle('country', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Land</span>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-semibold">Financiële gegevens</DropdownMenuLabel>
                
                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('openstaand', !columnVisibility.openstaand);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.openstaand}
                      onCheckedChange={(checked) => handleColumnToggle('openstaand', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Openstaand</span>
                  </div>
                </div>

                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('omzet', !columnVisibility.omzet);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.omzet}
                      onCheckedChange={(checked) => handleColumnToggle('omzet', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Omzet</span>
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-semibold">Status</DropdownMenuLabel>
                
                <div className="px-2 py-1.5">
                  <div 
                    className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-gray-50 rounded px-1 py-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleColumnToggle('actief', !columnVisibility.actief);
                    }}
                  >
                    <Checkbox
                      checked={columnVisibility.actief}
                      onCheckedChange={(checked) => handleColumnToggle('actief', checked as boolean)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span>Actief</span>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableHead>
        </TableRow>
      </TableHeader>
    </>
  );
};
