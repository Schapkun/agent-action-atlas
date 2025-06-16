
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

export const useContactManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
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

  console.log('🔵 useContactManager: Hook initialized with:', {
    selectedOrganization: selectedOrganization?.name,
    selectedWorkspace: selectedWorkspace?.name,
    userId: user?.id
  });

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
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

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
        payment_terms: 30,
        is_active: true
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
    toast
  };
};
