import { useState, useEffect } from 'react';
import { ContactSearch } from './ContactSearch';
import { ContactDropdown } from './ContactDropdown';
import { useContactData } from './useContactData';
import { Contact } from '@/types/contacts';

interface ContactSelectorProps {
  selectedContact?: Contact | null;
  onContactSelect: (contact: Contact | null) => void;
}

export const ContactSelector = ({ 
  selectedContact, 
  onContactSelect
}: ContactSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { contacts, loading, refreshContacts } = useContactData();

  // Update search term when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      setSearchTerm(selectedContact.name);
    } else {
      setSearchTerm('');
    }
  }, [selectedContact]);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.postal_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.contact_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactSelect = (contact: Contact) => {
    console.log('📋 ContactSelector - selecting contact (NO SUBMIT):', contact.name);
    
    onContactSelect(contact);
    setSearchTerm(contact.name);
    setIsDropdownOpen(false);
  };

  const handleContactClear = () => {
    console.log('📋 ContactSelector - clearing contact (NO SUBMIT)');
    onContactSelect(null);
    setSearchTerm('');
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsDropdownOpen(true);
    
    if (!value.trim()) {
      onContactSelect(null);
    }
  };

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
    refreshContacts();
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const handleContactsUpdated = () => {
    refreshContacts();
  };

  return (
    <div className="relative">
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
    </div>
  );
};
