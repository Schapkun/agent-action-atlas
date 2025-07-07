import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
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
  contact_number?: string;
  contact_person?: string;
  vat_number?: string;
  website?: string;
  payment_terms?: number;
  payment_method?: string;
  iban?: string;
  notes?: string;
  default_discount?: number;
  discount_type?: string;
  products_display?: string;
  invoice_reference?: string;
  hide_notes_on_invoice?: boolean;
  billing_address?: string;
  shipping_address?: string;
  shipping_instructions?: string;
  shipping_method?: string;
  reminder_email?: string;
  type?: string;
  is_active?: boolean;
  labels?: Array<{ id: string; name: string; color: string; }>;
}

interface ColumnVisibility {
  email: boolean;
  address: boolean;
  phone: boolean;
  mobile: boolean;
  postal_code: boolean;
  city: boolean;
  country: boolean;
  openstaand: boolean;
  omzet: boolean;
  actief: boolean;
  labels: boolean;
}

const COLUMN_VISIBILITY_STORAGE_KEY = 'contactTableColumnVisibility';

const getDefaultColumnVisibility = (): ColumnVisibility => ({
  email: true,
  address: false,
  phone: false,
  mobile: false,
  postal_code: false,
  city: false,
  country: false,
  openstaand: true,
  omzet: true,
  actief: true,
  labels: false
});

const loadColumnVisibility = (): ColumnVisibility => {
  try {
    const stored = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...getDefaultColumnVisibility(), ...parsed };
    }
  } catch (error) {
    console.error('Error loading column visibility:', error);
  }
  return getDefaultColumnVisibility();
};

const saveColumnVisibility = (visibility: ColumnVisibility) => {
  try {
    localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(visibility));
  } catch (error) {
    console.error('Error saving column visibility:', error);
  }
};

// GEFIXTE functie voor hiërarchische contactnummer display
const formatContactNumberForDisplay = (contactNumber: string, selectedOrganization: any, selectedWorkspace: any): string => {
  if (!contactNumber) return '';
  
  const parts = contactNumber.split('-');
  
  // Als er een workspace geselecteerd is, toon alleen het contact nummer (laatste deel)
  if (selectedWorkspace && parts.length === 3) {
    return parts[2]; // "001"
  }
  
  // Als alleen organisatie geselecteerd is, toon workspace-contact formaat
  if (selectedOrganization && !selectedWorkspace && parts.length === 3) {
    return `${parts[1]}-${parts[2]}`; // "001-001"
  }
  
  // Voor organisatie-level contacten (formaat 001-001)
  if (parts.length === 2) {
    if (selectedWorkspace) {
      // Als workspace geselecteerd maar contact is org-level, toon niets
      return '';
    }
    return parts[1]; // "001"
  }
  
  // Anders toon het volledige nummer
  return contactNumber;
};

export const useContactManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(loadColumnVisibility);
  const [labelFilter, setLabelFilter] = useState<Array<{ id: string; name: string; color: string; }>>([]);

  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  console.log('🔵 useContactManager: Hook initialized with:', {
    selectedOrganization: selectedOrganization?.name,
    selectedWorkspace: selectedWorkspace?.name,
    userId: user?.id
  });

  // Save column visibility to localStorage whenever it changes
  useEffect(() => {
    saveColumnVisibility(columnVisibility);
  }, [columnVisibility]);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;

      try {
        console.log('🔵 useContactManager: Fetching user role for:', user.email);
        
        if (user.email === 'info@schapkun.com') {
          setUserRole('owner');
          console.log('🔵 useContactManager: Set role to owner for special email');
          return;
        }

        const { data: memberships } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        if (memberships && memberships.length > 0) {
          setUserRole(memberships[0].role);
          console.log('🔵 useContactManager: Set role from DB:', memberships[0].role);
        } else {
          setUserRole('lid');
          console.log('🔵 useContactManager: Set default role: lid');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('lid');
      }
    };

    fetchUserRole();
  }, [user]);

  const fetchContacts = async () => {
    if (!selectedOrganization) {
      console.log('🔵 useContactManager: No organization selected, skipping fetch');
      setContacts([]);
      return;
    }

    console.log('🔵 useContactManager: Starting to fetch contacts for:', {
      organization: selectedOrganization.name,
      workspace: selectedWorkspace?.name
    });

    setLoading(true);
    try {
      let query = supabase
        .from('clients')
        .select(`
          *,
          contact_label_assignments(
            contact_labels(
              id,
              name,
              color
            )
          )
        `)
        .eq('organization_id', selectedOrganization.id)
        .order('contact_number', { ascending: true });

      // GEFIXTE workspace filtering logica - optioneel filteren
      if (selectedWorkspace) {
        // Als workspace geselecteerd, toon alleen contacten van die workspace
        query = query.eq('workspace_id', selectedWorkspace.id);
        console.log('🔵 useContactManager: Adding workspace filter:', selectedWorkspace.id);
      }
      // Als geen workspace geselecteerd, haal alle contacten van de organisatie op

      const { data, error } = await query;

      if (error) {
        console.error('🔵 useContactManager: Database error:', error);
        throw error;
      }

      console.log('🔵 useContactManager: Raw data from database:', data);
      console.log('🔵 useContactManager: Found', data?.length || 0, 'contacts');

      const mappedContacts: Contact[] = (data || []).map(client => {
        const displayNumber = formatContactNumberForDisplay(client.contact_number, selectedOrganization, selectedWorkspace);
        
        return {
          id: client.id,
          name: client.name,
          email: client.email || undefined,
          address: client.address || undefined,
          postal_code: client.postal_code || undefined,
          city: client.city || undefined,
          country: client.country || undefined,
          phone: client.phone || undefined,
          mobile: client.mobile || undefined,
          contact_number: displayNumber,
          contact_person: client.contact_person || undefined,
          vat_number: client.vat_number || undefined,
          website: client.website || undefined,
          payment_terms: client.payment_terms || 30,
          payment_method: client.payment_method || 'bankoverschrijving',
          iban: client.iban || undefined,
          notes: client.notes || undefined,
          default_discount: client.default_discount || 0,
          discount_type: client.discount_type || 'percentage',
          products_display: client.products_display || 'incl_btw',
          invoice_reference: client.invoice_reference || undefined,
          hide_notes_on_invoice: client.hide_notes_on_invoice || false,
          billing_address: client.billing_address || undefined,
          shipping_address: client.shipping_address || undefined,
          shipping_instructions: client.shipping_instructions || undefined,
          shipping_method: client.shipping_method || 'E-mail',
          reminder_email: client.reminder_email || undefined,
          is_active: client.is_active !== false,
          type: client.type || 'prive',
          department: client.department || undefined,
          salutation: client.salutation || 'Geachte heer/mevrouw',
          contact_name_on_invoice: client.contact_name_on_invoice || false,
          address_line_2: client.address_line_2 || undefined,
          labels: client.contact_label_assignments?.map((assignment: any) => assignment.contact_labels).filter(Boolean) || []
        };
      });

      console.log('🔵 useContactManager: Mapped contacts with all fields:', mappedContacts);
      console.log('🔵 useContactManager: Contact numbers found:', mappedContacts.map(c => c.contact_number));
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
    console.log('🔵 useContactManager: Organization/workspace changed, fetching contacts');
    if (selectedOrganization) {
      fetchContacts();
    }
  }, [selectedOrganization, selectedWorkspace]);

  const bulkDeleteContacts = async (contactIds: Set<string>) => {
    if (contactIds.size === 0) return;

    try {
      console.log('🗑️ Bulk deleting contacts:', Array.from(contactIds));
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .in('id', Array.from(contactIds));

      if (error) throw error;

      // De database trigger zorgt automatisch voor hernummering
      // We hoeven alleen de lokale state bij te werken en contacten opnieuw op te halen
      await fetchContacts(); // Herlaad alle contacten om de nieuwe nummers te krijgen
      
      toast({
        title: "Contacten verwijderd",
        description: `${contactIds.size} contact(en) succesvol verwijderd en hernummerd`
      });
    } catch (error) {
      console.error('Error bulk deleting contacts:', error);
      toast({
        title: "Fout",
        description: "Kon contacten niet verwijderen",
        variant: "destructive"
      });
      throw error;
    }
  };

  const removeLabelFilter = () => {
    setLabelFilter([]);
  };

  const refreshContacts = () => {
    console.log('🔄 useContactManager: Refreshing contacts');
    fetchContacts();
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.postal_code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLabelFilter = labelFilter.length === 0 || 
      (contact.labels && contact.labels.some(label => 
        labelFilter.some(filterLabel => filterLabel.id === label.id)
      ));

    return matchesSearch && matchesLabelFilter;
  });

  console.log('🔵 useContactManager: Filtered contacts:', {
    total: contacts.length,
    filtered: filteredContacts.length,
    searchTerm,
    labelFilter: labelFilter.length
  });

  const isAllSelected = filteredContacts.length > 0 && selectedContacts.size === filteredContacts.length;
  const isIndeterminate = selectedContacts.size > 0 && selectedContacts.size < filteredContacts.length;

  return {
    // State
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
    labelFilter,
    
    // Actions
    setSearchTerm,
    setContacts,
    setSelectedContacts,
    setColumnVisibility,
    toast,
    fetchContacts,
    bulkDeleteContacts,
    removeLabelFilter,
    refreshContacts
  };
};

// Export the Contact type for use in other components
export type { Contact, ColumnVisibility };
