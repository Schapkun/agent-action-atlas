
import { useState, useEffect } from 'react';
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
  contact_number?: string;
}

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
    console.log('📋 ContactSelector - selecting existing contact:', contact.name);
    onContactSelect(contact);
    setSearchTerm(contact.name);
    setIsDropdownOpen(false);
  };

  const handleContactClear = () => {
    onContactSelect(null);
    setSearchTerm('');
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsDropdownOpen(true);
    
    // Als het zoekveld leeg wordt, clear de selectie
    if (!value.trim()) {
      onContactSelect(null);
    }
  };

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
    // Refresh contacten als dropdown wordt geopend
    refreshContacts();
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <div className="flex gap-2 relative">
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
          />
        </div>
      </div>
    </div>
  );
};
