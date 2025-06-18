
import { TableCell, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ContactActions } from '@/components/contacts/ContactActions';
import { Eye, Edit } from 'lucide-react';

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
  labels?: Array<{ id: string; name: string; color: string; }>;
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
  labels: boolean;
}

interface ContactTableRowProps {
  contact: Contact;
  isSelected: boolean;
  columnVisibility: ColumnVisibility;
  onSelect: (contactId: string, checked: boolean) => void;
  onToggleStatus: (contactId: string, currentStatus: boolean) => void;
  onContactsUpdated: () => void;
  onFilterByLabels: (contact: Contact) => void;
  onEditContact?: (contact: Contact) => void;
}

export const ContactTableRow = ({
  contact,
  isSelected,
  columnVisibility,
  onSelect,
  onToggleStatus,
  onContactsUpdated,
  onFilterByLabels,
  onEditContact
}: ContactTableRowProps) => {
  const getContactNumber = () => {
    return contact.id.slice(-6).toUpperCase();
  };

  const handleEdit = () => {
    if (onEditContact) {
      onEditContact(contact);
    }
  };

  return (
    <TableRow className="border-b hover:bg-gray-50">
      <TableCell className="w-8 p-2">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(contact.id, checked as boolean)}
          className="h-4 w-4"
        />
      </TableCell>
      
      <TableCell className="p-2 text-xs w-16">
        {getContactNumber()}
      </TableCell>
      
      <TableCell className="p-2 text-xs font-medium">
        <div className="truncate max-w-[150px]" title={contact.name}>
          {contact.name}
        </div>
      </TableCell>

      {columnVisibility.email && (
        <TableCell className="p-2 text-xs text-gray-600">
          <div className="truncate max-w-[120px]" title={contact.email}>
            {contact.email || '-'}
          </div>
        </TableCell>
      )}

      {columnVisibility.address && (
        <TableCell className="p-2 text-xs text-gray-600">
          <div className="truncate max-w-[120px]" title={contact.address}>
            {contact.address || '-'}
          </div>
        </TableCell>
      )}

      {columnVisibility.phone && (
        <TableCell className="p-2 text-xs text-gray-600">
          {contact.phone || '-'}
        </TableCell>
      )}

      {columnVisibility.mobile && (
        <TableCell className="p-2 text-xs text-gray-600">
          {contact.mobile || '-'}
        </TableCell>
      )}

      {columnVisibility.postal_code && (
        <TableCell className="p-2 text-xs text-gray-600">
          {contact.postal_code || '-'}
        </TableCell>
      )}

      {columnVisibility.city && (
        <TableCell className="p-2 text-xs text-gray-600">
          <div className="truncate max-w-[100px]" title={contact.city}>
            {contact.city || '-'}
          </div>
        </TableCell>
      )}

      {columnVisibility.country && (
        <TableCell className="p-2 text-xs text-gray-600">
          {contact.country || '-'}
        </TableCell>
      )}

      {columnVisibility.labels && (
        <TableCell className="p-2">
          <div className="flex flex-wrap gap-1 max-w-[120px]">
            {contact.labels && contact.labels.length > 0 ? (
              contact.labels.slice(0, 2).map((label, index) => (
                <Badge
                  key={label.id}
                  variant="secondary"
                  className="text-xs px-1 py-0 h-5 cursor-pointer"
                  style={{
                    backgroundColor: label.color + '20',
                    color: label.color,
                    border: `1px solid ${label.color}40`
                  }}
                  onClick={() => onFilterByLabels(contact)}
                  title={`Filter op: ${label.name}`}
                >
                  {label.name}
                </Badge>
              ))
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
            {contact.labels && contact.labels.length > 2 && (
              <Badge
                variant="secondary"
                className="text-xs px-1 py-0 h-5 cursor-pointer"
                onClick={() => onFilterByLabels(contact)}
                title="Bekijk alle labels"
              >
                +{contact.labels.length - 2}
              </Badge>
            )}
          </div>
        </TableCell>
      )}

      {columnVisibility.openstaand && (
        <TableCell className="p-2 text-xs text-right text-gray-600">
          € 0,00
        </TableCell>
      )}

      {columnVisibility.omzet && (
        <TableCell className="p-2 text-xs text-right text-gray-600">
          € 0,00
        </TableCell>
      )}

      {columnVisibility.actief && (
        <TableCell className="p-2 text-center">
          <Switch
            checked={contact.is_active !== false}
            onCheckedChange={() => onToggleStatus(contact.id, contact.is_active !== false)}
            className="h-4 w-8"
          />
        </TableCell>
      )}

      <TableCell className="p-2 w-20">
        <div className="flex items-center gap-1">
          {onEditContact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-6 w-6 p-0"
              title="Contact bewerken"
            >
              <Edit className="h-3 w-3" />
            </Button>
          )}
          <ContactActions
            contact={contact}
            onContactsUpdated={onContactsUpdated}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};
