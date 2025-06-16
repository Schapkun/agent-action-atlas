
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Check, Edit, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  mobile?: string;
  type?: string;
  payment_terms?: number;
  is_active?: boolean;
}

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

interface ContactTableRowProps {
  contact: Contact;
  index: number;
  isSelected: boolean;
  columnVisibility: ColumnVisibility;
  onSelectContact: (contactId: string, checked: boolean) => void;
  onToggleStatus: (contactId: string, currentStatus: boolean) => void;
  onEditContact?: (contact: Contact) => void;
  onViewInvoices?: (contact: Contact) => void;
  onViewQuotes?: (contact: Contact) => void;
  onCreateInvoice?: (contact: Contact) => void;
  onCreateQuote?: (contact: Contact) => void;
  onSendEmail?: (contact: Contact) => void;
  onExportVCard?: (contact: Contact) => void;
  onDeleteContact?: (contact: Contact) => void;
}

export const ContactTableRow = ({
  contact,
  index,
  isSelected,
  columnVisibility,
  onSelectContact,
  onToggleStatus,
  onEditContact,
  onViewInvoices,
  onViewQuotes,
  onCreateInvoice,
  onCreateQuote,
  onSendEmail,
  onExportVCard,
  onDeleteContact
}: ContactTableRowProps) => {
  const formatAddress = (contact: Contact) => {
    const parts = [];
    if (contact.address) parts.push(contact.address);
    if (contact.postal_code) parts.push(contact.postal_code);
    if (contact.city) parts.push(contact.city);
    return parts.join(', ') || '-';
  };

  return (
    <TableRow className="text-xs hover:bg-gray-50 border-b group">
      <TableCell className="p-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelectContact(contact.id, checked as boolean)}
          className="h-4 w-4"
        />
      </TableCell>
      <TableCell className="p-3 text-xs text-blue-600 font-medium">
        {4000 + index + 1}
      </TableCell>
      <TableCell className="p-3">
        <div className="text-xs font-medium text-gray-900">{contact.name}</div>
        {contact.email && (
          <div className="text-xs text-muted-foreground">{contact.email}</div>
        )}
      </TableCell>
      {columnVisibility.email && (
        <TableCell className="p-3 text-xs text-muted-foreground">
          {contact.email || '-'}
        </TableCell>
      )}
      {columnVisibility.address && (
        <TableCell className="p-3 text-xs text-muted-foreground">
          {formatAddress(contact)}
        </TableCell>
      )}
      {columnVisibility.phone && (
        <TableCell className="p-3 text-xs text-muted-foreground">
          {contact.phone || '-'}
        </TableCell>
      )}
      {columnVisibility.mobile && (
        <TableCell className="p-3 text-xs text-muted-foreground">
          {contact.mobile || '-'}
        </TableCell>
      )}
      {columnVisibility.postal_code && (
        <TableCell className="p-3 text-xs text-muted-foreground">
          {contact.postal_code || '-'}
        </TableCell>
      )}
      {columnVisibility.city && (
        <TableCell className="p-3 text-xs text-muted-foreground">
          {contact.city || '-'}
        </TableCell>
      )}
      {columnVisibility.country && (
        <TableCell className="p-3 text-xs text-muted-foreground">
          {contact.country || '-'}
        </TableCell>
      )}
      {columnVisibility.openstaand && (
        <TableCell className="p-3 text-xs text-right font-mono">
          €0,00
        </TableCell>
      )}
      {columnVisibility.omzet && (
        <TableCell className="p-3 text-xs text-right font-mono">
          €0,00
        </TableCell>
      )}
      {columnVisibility.actief && (
        <TableCell className="p-3">
          <div className="flex items-center justify-center">
            <button
              onClick={() => onToggleStatus(contact.id, contact.is_active ?? true)}
              className="transition-colors hover:opacity-80 focus:outline-none"
            >
              <div className={`h-5 w-5 rounded-sm flex items-center justify-center border ${
                contact.is_active !== false 
                  ? 'bg-green-500 border-green-500' 
                  : 'bg-white border-gray-300'
              }`}>
                {contact.is_active !== false && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
            </button>
          </div>
        </TableCell>
      )}
      <TableCell className="p-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() => onEditContact?.(contact)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem onClick={() => onViewInvoices?.(contact)}>
                📄 Facturen bekijken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewQuotes?.(contact)}>
                🔄 Periodieken bekijken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onViewQuotes?.(contact)}>
                ✅ Offertes bekijken
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onCreateInvoice?.(contact)}>
                🔄 Factuur maken
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCreateQuote?.(contact)}>
                🔄 Offerte maken
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onExportVCard?.(contact)}>
                💾 Kopieer
              </DropdownMenuItem>
              <DropdownMenuItem>
                🏷️ Labels
              </DropdownMenuItem>
              <DropdownMenuItem>
                🔍 Filter op deze labels
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSendEmail?.(contact)}>
                📧 E-mail versturen
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExportVCard?.(contact)}>
                📇 vCard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleStatus(contact.id, contact.is_active ?? true)}>
                ⚪ Markeer als niet actief
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDeleteContact?.(contact)}
                className="text-red-600"
              >
                🗑️ Verwijder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};
