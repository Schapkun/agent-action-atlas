
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { useToast } from '@/hooks/use-toast';

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
}

export const ContactManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;

      try {
        // Check if user is account owner
        if (user.email === 'info@schapkun.com') {
          setUserRole('owner');
          return;
        }

        // Get user's role from their organization memberships
        const { data: memberships } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        if (memberships && memberships.length > 0) {
          setUserRole(memberships[0].role);
        } else {
          setUserRole('lid'); // Default role if no membership found
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('lid'); // Default to lid on error
      }
    };

    fetchUserRole();
  }, [user]);

  // Fetch contacts from database
  const fetchContacts = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      let query = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const mappedContacts: Contact[] = (data || []).map(client => ({
        id: client.id,
        name: client.name,
        email: client.email || undefined,
        address: client.address || undefined,
        postal_code: client.postal_code || undefined,
        city: client.city || undefined,
        country: client.country || undefined,
        phone: client.phone || undefined,
        payment_terms: 30 // Default payment terms
      }));

      setContacts(mappedContacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Fout",
        description: "Kon contacten niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedOrganization) {
      fetchContacts();
    }
  }, [selectedOrganization, selectedWorkspace]);

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  // Check if user can invite others (not 'lid' role)
  const canInviteUsers = userRole !== 'lid';

  const handleNewContact = () => {
    console.log('🔵 ContactManager: Opening contact dialog from Contacten menu');
    setIsContactDialogOpen(true);
  };

  const handleContactSaved = (contact: Contact) => {
    console.log('🔵 ContactManager: Contact saved from Contacten menu:', contact);
    
    // Add to local contacts list
    setContacts(prev => [contact, ...prev]);
    
    // Close dialog
    setIsContactDialogOpen(false);
    
    toast({
      title: "Contact toegevoegd",
      description: `Contact "${contact.name}" is succesvol toegevoegd.`
    });
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.postal_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {/* Contact List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Contacten</CardTitle>
              {canInviteUsers && (
                <Button variant="outline" size="sm" onClick={handleNewContact}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Nieuw Contact
                </Button>
              )}
            </div>

            {!selectedOrganization && !selectedWorkspace && (
              <div className="text-sm text-muted-foreground">
                Selecteer een organisatie of werkruimte om contacten te bekijken
              </div>
            )}

            {(selectedOrganization || selectedWorkspace) && (
              <>
                <div className="text-sm text-muted-foreground">
                  Data voor: {getContextInfo()}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoek contacten..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </>
            )}
          </CardHeader>

          <div className="px-6 pt-3 pb-6">
            {!selectedOrganization && !selectedWorkspace ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecteer een organisatie of werkruimte om contacten te bekijken</p>
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Contacten laden...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{contacts.length === 0 ? 'Geen contacten gevonden voor de geselecteerde context' : 'Geen contacten gevonden die voldoen aan de zoekcriteria'}</p>
                {canInviteUsers && contacts.length === 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNewContact}
                    className="mt-4"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Voeg je eerste contact toe
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContacts.map((contact) => (
                  <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                        {contact.email && (
                          <p className="text-sm text-gray-600 mt-1">{contact.email}</p>
                        )}
                        {(contact.address || contact.city) && (
                          <p className="text-sm text-gray-600 mt-1">
                            {contact.address && `${contact.address}, `}
                            {contact.postal_code && `${contact.postal_code} `}
                            {contact.city}
                          </p>
                        )}
                        {contact.phone && (
                          <p className="text-sm text-gray-600 mt-1">Tel: {contact.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Contact Dialog - Same dialog used in invoice creation */}
      <ContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        onSave={handleContactSaved}
        mode="create"
      />
    </>
  );
};
