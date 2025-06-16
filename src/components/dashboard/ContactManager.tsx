import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, UserPlus, Users, Trash2, Archive, Mail, Settings, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface ColumnVisibility {
  email: boolean;
  openstaand: boolean;
  omzet: boolean;
  actief: boolean;
}

export const ContactManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    email: true,
    openstaand: true,
    omzet: true,
    actief: true
  });
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
        payment_terms: 30,
        is_active: true // Default to active since we don't have this field yet
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
      // For now, just update local state since we don't have the is_active field in the database yet
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
      // For demo purposes, just remove from local state
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

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.postal_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAllSelected = filteredContacts.length > 0 && selectedContacts.size === filteredContacts.length;
  const isIndeterminate = selectedContacts.size > 0 && selectedContacts.size < filteredContacts.length;

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {/* Contact List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Contacten</CardTitle>
              <div className="flex items-center gap-2">
                {selectedContacts.size > 0 && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleBulkArchive}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archiveren ({selectedContacts.size})
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Verwijderen ({selectedContacts.size})
                    </Button>
                  </>
                )}
                
                {/* Column visibility settings */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.email}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, email: checked }))
                      }
                    >
                      E-mail
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.openstaand}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, openstaand: checked }))
                      }
                    >
                      Openstaand
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.omzet}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, omzet: checked }))
                      }
                    >
                      Omzet
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.actief}
                      onCheckedChange={(checked) => 
                        setColumnVisibility(prev => ({ ...prev, actief: checked }))
                      }
                    >
                      Actief
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {canInviteUsers && (
                  <Button variant="outline" size="sm" onClick={handleNewContact}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nieuw
                  </Button>
                )}
              </div>
            </div>

            {!selectedOrganization && !selectedWorkspace && (
              <div className="text-sm text-muted-foreground">
                Selecteer een organisatie of werkruimte om contacten te bekijken
              </div>
            )}

            {(selectedOrganization || selectedWorkspace) && (
              <>
                <div className="text-sm text-muted-foreground">
                  {getContextInfo()}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Zoeken in deze tabel"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {!selectedOrganization && !selectedWorkspace ? (
              <div className="text-center py-8 text-muted-foreground px-6">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecteer een organisatie of werkruimte om contacten te bekijken</p>
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-muted-foreground px-6">
                <p>Contacten laden...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground px-6">
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
              <Table>
                <TableHeader>
                  <TableRow className="text-xs border-b bg-gray-50">
                    <TableHead className="w-8 p-3">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className={`h-4 w-4 ${isIndeterminate ? 'data-[state=checked]:bg-blue-500' : ''}`}
                        data-state={isIndeterminate ? 'indeterminate' : isAllSelected ? 'checked' : 'unchecked'}
                      />
                    </TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground p-3 w-20">Klantnr</TableHead>
                    <TableHead className="text-xs font-medium text-muted-foreground p-3">Klant</TableHead>
                    {columnVisibility.email && (
                      <TableHead className="text-xs font-medium text-muted-foreground p-3">E-mail</TableHead>
                    )}
                    {columnVisibility.openstaand && (
                      <TableHead className="text-xs font-medium text-muted-foreground p-3 text-right w-24">Openstaand</TableHead>
                    )}
                    {columnVisibility.omzet && (
                      <TableHead className="text-xs font-medium text-muted-foreground p-3 text-right w-24">Omzet</TableHead>
                    )}
                    {columnVisibility.actief && (
                      <TableHead className="text-xs font-medium text-muted-foreground p-3 text-center w-16">Actief</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.map((contact, index) => (
                    <TableRow key={contact.id} className="text-xs hover:bg-gray-50 border-b">
                      <TableCell className="p-3">
                        <Checkbox
                          checked={selectedContacts.has(contact.id)}
                          onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="p-3 text-xs text-blue-600 font-medium">
                        {4000 + index + 1}
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="text-xs font-medium text-gray-900">{contact.name}</div>
                        {contact.email && (
                          <div className="text-xs text-muted-foreground">{contact.email}</div>
                        )}
                      </TableCell>
                      {columnVisibility.email && (
                        <TableCell className="p-3 text-xs text-muted-foreground">
                          {contact.email || '-'}
                        </TableCell>
                      )}
                      {columnVisibility.openstaand && (
                        <TableCell className="p-3 text-xs text-right font-mono">
                          €0,00
                        </TableCell>
                      )}
                      {columnVisibility.omzet && (
                        <TableCell className="p-3 text-xs text-right font-mono">
                          €0,00
                        </TableCell>
                      )}
                      {columnVisibility.actief && (
                        <TableCell className="p-3">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => toggleContactStatus(contact.id, contact.is_active ?? true)}
                              className="transition-colors hover:opacity-80 focus:outline-none"
                            >
                              <div className={`h-5 w-5 rounded-sm flex items-center justify-center border ${
                                contact.is_active !== false 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'bg-white border-gray-300'
                              }`}>
                                {contact.is_active !== false && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </div>
                            </button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
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
