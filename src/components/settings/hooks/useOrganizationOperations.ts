
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAutoOwnerMembership } from './useAutoOwnerMembership';
import type { Organization } from '../types/organization';

export const useOrganizationOperations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const { addOwnersToNewOrganization } = useAutoOwnerMembership();

  const fetchOrganizations = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching organizations for user:', user.id);
      
      // Check if user is the account owner (Michael Schapkun)
      const isAccountOwner = user.email === 'info@schapkun.com';
      
      if (isAccountOwner) {
        // If account owner, show ALL organizations
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, slug, created_at')
          .order('created_at', { ascending: false });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          throw orgError;
        }

        console.log('All organization data (account owner):', orgData);

        // For account owner, they have owner role on everything
        const organizationsWithRoles = orgData?.map(org => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          created_at: org.created_at,
          user_role: 'owner' as const
        })) || [];

        setOrganizations(organizationsWithRoles);
      } else {
        // For regular users, only show organizations they are members of
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('role, organization_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Organization membership error:', membershipError);
          throw membershipError;
        }

        console.log('Organization membership data:', membershipData);

        if (!membershipData || membershipData.length === 0) {
          console.log('No organization memberships found');
          setOrganizations([]);
          setLoading(false);
          return;
        }

        // Get organization details
        const orgIds = membershipData.map(m => m.organization_id);
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, slug, created_at')
          .in('id', orgIds);

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          throw orgError;
        }

        console.log('Organization data:', orgData);

        // Combine data
        const organizationsWithRoles = orgData?.map(org => {
          const membership = membershipData.find(m => m.organization_id === org.id);
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            created_at: org.created_at,
            user_role: membership?.role as 'owner' | 'admin' | 'member'
          };
        }) || [];

        setOrganizations(organizationsWithRoles);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Kon organisaties niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (name: string) => {
    if (!name.trim()) return;

    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: name,
          slug: slug
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add current user as admin/owner
      await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user?.id,
          role: 'admin'
        });

      // Automatically add all owners to the new organization
      await addOwnersToNewOrganization(orgData.id);

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: orgData.id,
          action: 'Organisatie aangemaakt',
          details: { organization_name: name }
        });

      toast({
        title: "Succes",
        description: "Organisatie succesvol aangemaakt en alle eigenaren zijn toegevoegd",
      });

      fetchOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const updateOrganization = async (organization: Organization) => {
    if (!organization.name.trim()) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: organization.name,
          slug: organization.name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', organization.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: organization.id,
          action: 'Organisatie bijgewerkt',
          details: { organization_name: organization.name }
        });

      toast({
        title: "Succes",
        description: "Organisatie succesvol bijgewerkt",
      });

      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteOrganization = async (organizationId: string, organizationName: string) => {
    if (!confirm(`Weet je zeker dat je organisatie "${organizationName}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', organizationId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Organisatie succesvol verwijderd",
      });

      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet verwijderen",
        variant: "destructive",
      });
    }
  };

  return {
    organizations,
    loading,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization
  };
};
