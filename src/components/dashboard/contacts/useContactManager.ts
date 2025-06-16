
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

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;

      try {
        if (user.email === 'info@schapkun.com') {
          setUserRole('owner');
          return;
        }

        const { data: memberships } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        if (memberships && memberships.length > 0) {
          setUserRole(memberships[0].role);
        } else {
          setUserRole('lid');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('lid');
      }
    };

    fetchUserRole();
  }, [user]);

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
        is_active: true
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

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.postal_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
