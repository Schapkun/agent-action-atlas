
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
  type?: string;
  payment_terms?: number;
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

export const useContactManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>(loadColumnVisibility);

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

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
        console.log('🔵 useContactManager: Adding workspace filter:', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('🔵 useContactManager: Database error:', error);
        throw error;
      }

      console.log('🔵 useContactManager: Raw data from database:', data);

      const mappedContacts: Contact[] = (data || []).map(client => ({
        id: client.id,
        name: client.name,
        email: client.email || undefined,
        address: client.address || undefined,
        postal_code: client.postal_code || undefined,
        city: client.city || undefined,
        country: client.country || undefined,
        phone: client.phone || undefined,
        mobile: undefined,
        contact_number: client.contact_number || undefined,
        payment_terms: 30,
        is_active: true,
        labels: client.contact_label_assignments?.map((assignment: any) => assignment.contact_labels).filter(Boolean) || []
      }));

      console.log('🔵 useContactManager: Mapped contacts:', mappedContacts);
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

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.postal_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log('🔵 useContactManager: Filtered contacts:', {
    total: contacts.length,
    filtered: filteredContacts.length,
    searchTerm
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
    
    // Actions
    setSearchTerm,
    setContacts,
    setSelectedContacts,
    setColumnVisibility,
    toast,
    fetchContacts
  };
};
