
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactDialog } from './ContactDialog';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // PUNT 2: Echte contacten ophalen uit de database
  const fetchContacts = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📋 PUNT 2: Contacten ophalen uit database voor organisatie:', selectedOrganization.id);
      
      let query = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('name');

      // Ook filteren op workspace als die geselecteerd is
      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('📋 PUNT 2: Fout bij ophalen contacten:', error);
        return;
      }

      console.log('📋 PUNT 2: Contacten opgehaald:', data?.length || 0);
      
      const formattedContacts: Contact[] = data?.map(client => ({
        id: client.id,
        name: client.name,
        email: client.email || undefined,
        address: client.address || undefined,
        postal_code: client.postal_code || undefined,
        city: client.city || undefined,
        country: client.country || 'Nederland',
        payment_terms: 30 // Default payment terms
      })) || [];

      setContacts(formattedContacts);
    } catch (error) {
      console.error('📋 PUNT 2: Onverwachte fout bij ophalen contacten:', error);
    } finally {
      setLoading(false);
    }
  };

  // Contacten ophalen bij mount en bij wijziging van organisatie/werkruimte
  useEffect(() => {
    fetchContacts();
  }, [selectedOrganization, selectedWorkspace]);

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
    onContactCreated(contact);
    setIsNewContactOpen(false);
    handleContactSelect(contact);
    // Herlaad de contactenlijst
    fetchContacts();
  };

  const handleContactUpdated = (contact: Contact) => {
    onContactUpdated(contact);
    setIsEditContactOpen(false);
    onContactSelect(contact);
    // Herlaad de contactenlijst
    fetchContacts();
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
                className="flex-1 text-xs h-8 pr-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
              
              {/* Clear button inside input field */}
              {selectedContact && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleContactClear}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-red-100"
                >
                  <X className="h-3 w-3 text-red-500" />
                </Button>
              )}
              
              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="p-2 text-sm text-gray-500">Contacten laden...</div>
                  ) : filteredContacts.length > 0 ? (
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
                    <div className="p-2 text-sm text-gray-500">
                      {contacts.length === 0 ? 'Geen contacten gevonden in deze organisatie' : 'Geen contacten gevonden'}
                    </div>
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
