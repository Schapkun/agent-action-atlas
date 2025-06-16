
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactDialog } from '@/components/contacts/ContactDialog';
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
}

export const ContactManager = () => {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  
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
    toast
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

  const handleNewContact = () => {
    console.log('🔵 ContactManager: Opening contact dialog from Contacten menu');
    setIsContactDialogOpen(true);
  };

  const handleContactSaved = (contact: Contact) => {
    console.log('🔵 ContactManager: Contact saved from Contacten menu:', contact);
    
    setContacts(prev => [contact, ...prev]);
    setIsContactDialogOpen(false);
    
    toast({
      title: "Contact toegevoegd",
      description: `Contact "${contact.name}" is succesvol toegevoegd.`
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(new Set(filteredContacts.map(contact => contact.id)));
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

  console.log('🔵 ContactManager: Rendering with data:', {
    selectedOrganization: selectedOrganization?.name,
    selectedWorkspace: selectedWorkspace?.name,
    contactsCount: contacts.length,
    filteredContactsCount: filteredContacts.length,
    loading
  });

  return (
    <>
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
                onNewContact={handleNewContact}
                canInviteUsers={canInviteUsers}
                contextInfo={getContextInfo()}
              />
            )}
          </CardHeader>

          <CardContent className="p-0">
            <ContactTable
              contacts={contacts}
              filteredContacts={filteredContacts}
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
              onNewContact={handleNewContact}
            />
          </CardContent>
        </Card>
      </div>

      <ContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        onSave={handleContactSaved}
        mode="create"
      />
    </>
  );
};
