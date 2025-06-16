
import { useState } from 'react';
import { Label } from '@/components/ui/label';
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
}

export const ContactSelector = ({ 
  selectedContact, 
  onContactSelect
}: ContactSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { contacts, loading } = useContactData();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.postal_code?.toLowerCase().includes(searchTerm.toLowerCase())
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
  };

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  return (
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
          />
        </div>
      </div>
    </div>
  );
};
