
import { Table, TableBody } from '@/components/ui/table';
import { ContactTableHeader } from './ContactTableHeader';
import { ContactTableRow } from './ContactTableRow';
import { ContactEmptyState } from './ContactEmptyState';

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

interface ContactTableProps {
  contacts: Contact[];
  filteredContacts: Contact[];
  selectedContacts: Set<string>;
  columnVisibility: ColumnVisibility;
  loading: boolean;
  hasOrganizationSelected: boolean;
  canInviteUsers: boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectContact: (contactId: string, checked: boolean) => void;
  onToggleStatus: (contactId: string, currentStatus: boolean) => void;
  onColumnVisibilityChange: (column: keyof ColumnVisibility, checked: boolean) => void;
  onBulkDelete: () => void;
  onContactsUpdated: () => void;
  onFilterByLabels: (contact: Contact) => void;
  onEditContact?: (contact: Contact) => void;
}

export const ContactTable = ({
  contacts,
  filteredContacts,
  selectedContacts,
  columnVisibility,
  loading,
  hasOrganizationSelected,
  canInviteUsers,
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onSelectContact,
  onToggleStatus,
  onColumnVisibilityChange,
  onBulkDelete,
  onContactsUpdated,
  onFilterByLabels,
  onEditContact
}: ContactTableProps) => {
  console.log('🔵 ContactTable: Rendering with data:', {
    totalContacts: contacts.length,
    filteredContacts: filteredContacts.length,
    selectedCount: selectedContacts.size,
    hasOrganizationSelected,
    loading
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Contacten laden...
      </div>
    );
  }

  if (!hasOrganizationSelected) {
    return (
      <div className="p-8 text-center text-gray-500">
        Selecteer een organisatie of werkruimte om contacten te bekijken
      </div>
    );
  }

  if (filteredContacts.length === 0) {
    return (
      <ContactEmptyState
        canInviteUsers={canInviteUsers}
        onContactsUpdated={onContactsUpdated}
      />
    );
  }

  return (
    <Table>
      <ContactTableHeader
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        selectedContactsCount={selectedContacts.size}
        columnVisibility={columnVisibility}
        onSelectAll={onSelectAll}
        onColumnVisibilityChange={onColumnVisibilityChange}
        onBulkDelete={onBulkDelete}
      />
      <TableBody>
        {filteredContacts.map((contact) => (
          <ContactTableRow
            key={contact.id}
            contact={contact}
            isSelected={selectedContacts.has(contact.id)}
            columnVisibility={columnVisibility}
            onSelect={onSelectContact}
            onToggleStatus={onToggleStatus}
            onContactsUpdated={onContactsUpdated}
            onFilterByLabels={onFilterByLabels}
            onEditContact={onEditContact}
          />
        ))}
      </TableBody>
    </Table>
  );
};
