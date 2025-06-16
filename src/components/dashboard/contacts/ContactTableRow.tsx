
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { Check } from 'lucide-react';

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
}

export const ContactTableRow = ({
  contact,
  index,
  isSelected,
  columnVisibility,
  onSelectContact,
  onToggleStatus
}: ContactTableRowProps) => {
  return (
    <TableRow className="text-xs hover:bg-gray-50 border-b">
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
    </TableRow>
  );
};
