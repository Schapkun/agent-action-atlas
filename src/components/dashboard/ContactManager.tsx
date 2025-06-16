
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactTableFilters } from './contacts/ContactTableFilters';
import { ContactTable } from './contacts/ContactTable';
import { useContactManager } from './contacts/useContactManager';

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

export const ContactManager = () => {
  const [labelFilter, setLabelFilter] = useState<Array<{ id: string; name: string; color: string; }>>([]);
  
  const {
    searchTerm,
    userRole,
    contacts,
    loading,
    selectedContacts,
    columnVisibility,
    filteredContacts,
    isAllSelected,
    isIndeterminate,
    selectedOrganization,
    selectedWorkspace,
    setSearchTerm,
    setContacts,
    setSelectedContacts,
    setColumnVisibility,
    toast,
    fetchContacts
  } = useContactManager();

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const canInviteUsers = userRole !== 'lid';

  // Apply label filter on top of existing filtered contacts
  const finalFilteredContacts = labelFilter.length > 0 
    ? filteredContacts.filter(contact => 
        contact.labels?.some(label => 
          labelFilter.some(filterLabel => filterLabel.id === label.id)
        )
      )
    : filteredContacts;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(finalFilteredContacts.map(contact => contact.id)));
    } else {
      setSelectedContacts(new Set());
    }
  };

  const handleSelectContact = (contactId: string, checked: boolean) => {
    const newSelected = new Set(selectedContacts);
    if (checked) {
      newSelected.add(contactId);
    } else {
      newSelected.delete(contactId);
    }
    setSelectedContacts(newSelected);
  };

  const toggleContactStatus = async (contactId: string, currentStatus: boolean) => {
    try {
      setContacts(prev => prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, is_active: !currentStatus }
          : contact
      ));

      toast({
        title: currentStatus ? "Contact gedeactiveerd" : "Contact geactiveerd",
        description: "Status is bijgewerkt"
      });
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast({
        title: "Fout",
        description: "Kon contactstatus niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.size === 0) return;

    try {
      setContacts(prev => prev.filter(contact => !selectedContacts.has(contact.id)));
      setSelectedContacts(new Set());
      
      toast({
        title: "Contacten verwijderd",
        description: `${selectedContacts.size} contact(en) verwijderd`
      });
    } catch (error) {
      console.error('Error deleting contacts:', error);
      toast({
        title: "Fout",
        description: "Kon contacten niet verwijderen",
        variant: "destructive"
      });
    }
  };

  const handleBulkArchive = async () => {
    if (selectedContacts.size === 0) return;

    try {
      setContacts(prev => prev.map(contact => 
        selectedContacts.has(contact.id)
          ? { ...contact, is_active: false }
          : contact
      ));
      setSelectedContacts(new Set());
      
      toast({
        title: "Contacten gearchiveerd",
        description: `${selectedContacts.size} contact(en) gearchiveerd`
      });
    } catch (error) {
      console.error('Error archiving contacts:', error);
      toast({
        title: "Fout",
        description: "Kon contacten niet archiveren",
        variant: "destructive"
      });
    }
  };

  const handleColumnVisibilityChange = (column: keyof typeof columnVisibility, checked: boolean) => {
    setColumnVisibility(prev => ({ ...prev, [column]: checked }));
  };

  const handleContactsUpdated = () => {
    fetchContacts();
  };

  const handleFilterByLabels = (contact: Contact) => {
    if (contact.labels && contact.labels.length > 0) {
      setLabelFilter(contact.labels);
      toast({
        title: "Filter toegepast",
        description: `Contacten gefilterd op ${contact.labels.length} label(s)`
      });
    }
  };

  const handleRemoveLabelFilter = () => {
    setLabelFilter([]);
  };

  console.log('🔵 ContactManager: Rendering with data:', {
    selectedOrganization: selectedOrganization?.name,
    selectedWorkspace: selectedWorkspace?.name,
    contactsCount: contacts.length,
    filteredContactsCount: finalFilteredContacts.length,
    loading
  });

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Contacten</CardTitle>
          </div>

          {(selectedOrganization || selectedWorkspace) && (
            <ContactTableFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              canInviteUsers={canInviteUsers}
              contextInfo={getContextInfo()}
              labelFilter={labelFilter}
              onRemoveLabelFilter={handleRemoveLabelFilter}
            />
          )}
        </CardHeader>

        <CardContent className="p-0">
          <ContactTable
            contacts={contacts}
            filteredContacts={finalFilteredContacts}
            selectedContacts={selectedContacts}
            columnVisibility={columnVisibility}
            loading={loading}
            hasOrganizationSelected={!!(selectedOrganization || selectedWorkspace)}
            canInviteUsers={canInviteUsers}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
            onSelectAll={handleSelectAll}
            onSelectContact={handleSelectContact}
            onToggleStatus={toggleContactStatus}
            onColumnVisibilityChange={handleColumnVisibilityChange}
            onBulkArchive={handleBulkArchive}
            onBulkDelete={handleBulkDelete}
            onContactsUpdated={handleContactsUpdated}
            onFilterByLabels={handleFilterByLabels}
          />
        </CardContent>
      </Card>
    </div>
  );
};
