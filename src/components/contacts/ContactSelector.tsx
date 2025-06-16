
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { ContactDialog } from './ContactDialog';
import { ContactSearch } from './ContactSearch';
import { ContactDropdown } from './ContactDropdown';
import { ContactActions } from './ContactActions';
import { useContactData } from './useContactData';

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  payment_terms?: number;
}

interface ContactSelectorProps {
  selectedContact?: Contact | null;
  onContactSelect: (contact: Contact | null) => void;
  onContactCreated: (contact: Contact) => void;
  onContactUpdated: (contact: Contact) => void;
}

export const ContactSelector = ({ 
  selectedContact, 
  onContactSelect, 
  onContactCreated, 
  onContactUpdated 
}: ContactSelectorProps) => {
  const [isNewContactOpen, setIsNewContactOpen] = useState(false);
  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { contacts, loading, fetchContacts } = useContactData();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.postal_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactSelect = (contact: Contact) => {
    console.log('📋 PUNT 2: Contact geselecteerd:', contact.name);
    onContactSelect(contact);
    setSearchTerm(contact.name);
    setIsDropdownOpen(false);
  };

  const handleContactClear = () => {
    onContactSelect(null);
    setSearchTerm('');
  };

  const handleNewContact = () => {
    setIsNewContactOpen(true);
  };

  const handleEditContact = () => {
    if (!selectedContact) {
      return;
    }
    setIsEditContactOpen(true);
  };

  const handleContactCreated = (contact: Contact) => {
    console.log('📋 Contact created, now selecting for form:', contact.name);
    
    // Close dialog first
    setIsNewContactOpen(false);
    
    // Select the contact (this will update the form)
    handleContactSelect(contact);
    
    // Call parent callback for any additional handling
    onContactCreated(contact);
    
    // Reload the contacts list
    fetchContacts();
  };

  const handleContactUpdated = (contact: Contact) => {
    onContactUpdated(contact);
    setIsEditContactOpen(false);
    onContactSelect(contact);
    // Herlaad de contactenlijst
    fetchContacts();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsDropdownOpen(true);
  };

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <Label htmlFor="client_select" className="text-xs font-medium">Aan</Label>
          <div className="flex gap-2 mt-1 relative">
            <ContactSearch
              searchTerm={searchTerm}
              selectedContact={selectedContact}
              onSearchChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onClear={handleContactClear}
            />
            
            <ContactDropdown
              isOpen={isDropdownOpen}
              loading={loading}
              contacts={filteredContacts}
              onContactSelect={handleContactSelect}
              onClose={handleDropdownClose}
            />
            
            <ContactActions
              selectedContact={selectedContact}
              onNewContact={handleNewContact}
              onEditContact={handleEditContact}
            />
          </div>
        </div>
      </div>

      <ContactDialog
        isOpen={isNewContactOpen}
        onClose={() => setIsNewContactOpen(false)}
        onSave={handleContactCreated}
        mode="create"
      />

      <ContactDialog
        isOpen={isEditContactOpen}
        onClose={() => setIsEditContactOpen(false)}
        onSave={handleContactUpdated}
        contact={selectedContact}
        mode="edit"
      />
    </>
  );
};
