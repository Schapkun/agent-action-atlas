
import { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { ContactTableHeader } from './ContactTableHeader';
import { ContactTableRow } from './ContactTableRow';
import { ContactEmptyState } from './ContactEmptyState';
import { ContactInvoicesDialog } from './ContactInvoicesDialog';
import { ContactQuotesDialog } from './ContactQuotesDialog';
import { ContactEmailDialog } from './ContactEmailDialog';
import { ContactLabelsDialog } from './ContactLabelsDialog';
import { useNavigate } from 'react-router-dom';

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
  onBulkArchive: () => void;
  onBulkDelete: () => void;
  onContactsUpdated?: () => void;
  onFilterByLabels?: (contact: Contact) => void;
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
  onContactsUpdated,
  onFilterByLabels
}: ContactTableProps) => {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [invoicesDialogOpen, setInvoicesDialogOpen] = useState(false);
  const [quotesDialogOpen, setQuotesDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [labelsDialogOpen, setLabelsDialogOpen] = useState(false);
  const navigate = useNavigate();

  console.log('🔵 ContactTable: Rendering with props:', {
    hasOrganizationSelected,
    loading,
    contactsLength: contacts.length,
    filteredContactsLength: filteredContacts.length
  });

  const showEmptyState = !hasOrganizationSelected || loading || filteredContacts.length === 0;

  if (showEmptyState) {
    return (
      <ContactEmptyState
        hasOrganizationSelected={hasOrganizationSelected}
        loading={loading}
        hasContacts={contacts.length > 0}
        hasFilteredContacts={filteredContacts.length > 0}
        canInviteUsers={canInviteUsers}
      />
    );
  }

  const handleViewInvoices = (contact: Contact) => {
    console.log('🔵 ContactTable: View invoices for:', contact.name);
    setSelectedContact(contact);
    setInvoicesDialogOpen(true);
  };

  const handleViewQuotes = (contact: Contact) => {
    console.log('🔵 ContactTable: View quotes for:', contact.name);
    setSelectedContact(contact);
    setQuotesDialogOpen(true);
  };

  const handleCreateInvoice = (contact: Contact) => {
    console.log('🔵 ContactTable: Create invoice for:', contact.name);
    navigate('/facturen/nieuw', { 
      state: { 
        preSelectedContact: {
          name: contact.name,
          email: contact.email,
          address: contact.address,
          postal_code: contact.postal_code,
          city: contact.city,
          country: contact.country
        }
      }
    });
  };

  const handleCreateQuote = (contact: Contact) => {
    console.log('🔵 ContactTable: Create quote for:', contact.name);
    navigate('/offertes/nieuw', { 
      state: { 
        preSelectedContact: {
          name: contact.name,
          email: contact.email,
          address: contact.address,
          postal_code: contact.postal_code,
          city: contact.city,
          country: contact.country
        }
      }
    });
  };

  const handleSendEmail = (contact: Contact) => {
    console.log('🔵 ContactTable: Send email to:', contact.name);
    setSelectedContact(contact);
    setEmailDialogOpen(true);
  };

  const handleDeleteContact = (contact: Contact) => {
    console.log('🔵 ContactTable: Delete contact:', contact.name);
    // TODO: Implement delete confirmation and action
  };

  const handleManageLabels = (contact: Contact) => {
    console.log('🔵 ContactTable: Manage labels for:', contact.name);
    setSelectedContact(contact);
    setLabelsDialogOpen(true);
  };

  return (
    <>
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
              onViewInvoices={handleViewInvoices}
              onViewQuotes={handleViewQuotes}
              onCreateInvoice={handleCreateInvoice}
              onCreateQuote={handleCreateQuote}
              onSendEmail={handleSendEmail}
              onDeleteContact={handleDeleteContact}
              onManageLabels={handleManageLabels}
              onFilterByLabels={onFilterByLabels}
            />
          ))}
        </TableBody>
      </Table>

      {/* Dialogs */}
      <ContactInvoicesDialog
        isOpen={invoicesDialogOpen}
        onClose={() => setInvoicesDialogOpen(false)}
        contact={selectedContact}
      />

      <ContactQuotesDialog
        isOpen={quotesDialogOpen}
        onClose={() => setQuotesDialogOpen(false)}
        contact={selectedContact}
      />

      <ContactEmailDialog
        isOpen={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        contact={selectedContact}
      />

      <ContactLabelsDialog
        isOpen={labelsDialogOpen}
        onClose={() => setLabelsDialogOpen(false)}
        contact={selectedContact}
        onLabelsUpdated={() => {
          onContactsUpdated?.();
          setLabelsDialogOpen(false);
        }}
      />
    </>
  );
};
