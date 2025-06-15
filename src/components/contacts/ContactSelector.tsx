
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactDialog } from './ContactDialog';

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
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

  // Mock contacts data - replace with real data from your contacts hook
  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Jan Jansen',
      email: 'jan@example.com',
      address: 'Hoofdstraat 123',
      postal_code: '1234AB',
      city: 'Amsterdam',
      country: 'Nederland'
    },
    {
      id: '2',
      name: 'Marie Peters',
      email: 'marie@example.com',
      address: 'Kerkstraat 45',
      postal_code: '5678CD',
      city: 'Rotterdam',
      country: 'Nederland'
    }
  ];

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.postal_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleContactSelect = (contact: Contact) => {
    onContactSelect(contact);
    setSearchTerm(contact.name);
    setIsDropdownOpen(false);
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
    onContactCreated(contact);
    setIsNewContactOpen(false);
    handleContactSelect(contact);
  };

  const handleContactUpdated = (contact: Contact) => {
    onContactUpdated(contact);
    setIsEditContactOpen(false);
    onContactSelect(contact);
  };

  return (
    <>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1">
          <Label htmlFor="client_select" className="text-xs font-medium">Aan</Label>
          <div className="flex gap-2 mt-1 relative">
            <div className="flex-1 relative">
              <Input 
                placeholder="Selecteer contact - zoek op naam, contactnummer, plaats, adres, e-mailadres of postcode"
                className="flex-1 text-xs h-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
              
              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <div className="font-medium text-sm">{contact.name}</div>
                        <div className="text-xs text-gray-500">
                          {contact.email && <div>{contact.email}</div>}
                          {contact.address && contact.city && (
                            <div>{contact.address}, {contact.postal_code} {contact.city}</div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500">Geen contacten gevonden</div>
                  )}
                </div>
              )}
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleNewContact} 
              className="text-blue-500 text-xs px-2 h-8"
            >
              Nieuw
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleEditContact} 
              disabled={!selectedContact}
              className="text-blue-500 text-xs px-2 h-8"
            >
              Bewerken
            </Button>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

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
