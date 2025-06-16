
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
}

interface ColumnVisibility {
  email: boolean;
  openstaand: boolean;
  omzet: boolean;
  actief: boolean;
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
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onNewContact: () => void;
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
  onBulkArchive,
  onBulkDelete,
  onNewContact
}: ContactTableProps) => {
  console.log('🔵 ContactTable: Rendering with props:', {
    hasOrganizationSelected,
    loading,
    contactsLength: contacts.length,
    filteredContactsLength: filteredContacts.length
  });

  const showEmptyState = !hasOrganizationSelected || loading || filteredContacts.length === 0;

  console.log('🔵 ContactTable: Show empty state?', showEmptyState);

  if (showEmptyState) {
    return (
      <ContactEmptyState
        hasOrganizationSelected={hasOrganizationSelected}
        loading={loading}
        hasContacts={contacts.length > 0}
        hasFilteredContacts={filteredContacts.length > 0}
        canInviteUsers={canInviteUsers}
        onNewContact={onNewContact}
      />
    );
  }

  console.log('🔵 ContactTable: Rendering actual table with contacts:', filteredContacts.length);

  return (
    <Table>
      <ContactTableHeader
        isAllSelected={isAllSelected}
        isIndeterminate={isIndeterminate}
        selectedContactsCount={selectedContacts.size}
        columnVisibility={columnVisibility}
        onSelectAll={onSelectAll}
        onColumnVisibilityChange={onColumnVisibilityChange}
        onBulkArchive={onBulkArchive}
        onBulkDelete={onBulkDelete}
      />
      <TableBody>
        {filteredContacts.map((contact, index) => (
          <ContactTableRow
            key={contact.id}
            contact={contact}
            index={index}
            isSelected={selectedContacts.has(contact.id)}
            columnVisibility={columnVisibility}
            onSelectContact={onSelectContact}
            onToggleStatus={onToggleStatus}
          />
        ))}
      </TableBody>
    </Table>
  );
};
