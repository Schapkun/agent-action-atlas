import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { generateSlug } from '../utils/slugGenerator';
import type { Organization } from '../types/organization';

export const useOrganizationOperations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

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
        // If account owner, show ALL organizations and workspaces
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .order('name');

        if (orgsError) throw orgsError;

        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('*')
          .order('name');

        if (workspacesError) throw workspacesError;

        const organizationsWithWorkspaces = orgsData?.map(org => ({
          ...org,
          workspaces: workspacesData?.filter(ws => ws.organization_id === org.id) || []
        })) || [];

        console.log('Setting organizations with fresh data:', organizationsWithWorkspaces);
        setOrganizations(organizationsWithWorkspaces);
      } else {
        // For regular users, only show organizations they are members of
        console.log('Fetching organizations for regular user...');
        
        // Get user's organization memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        console.log('Organization membership data:', membershipData);

        if (membershipError) {
          console.error('Membership fetch error:', membershipError);
          throw membershipError;
        }

        if (!membershipData || membershipData.length === 0) {
          console.log('No organization memberships found');
          setOrganizations([]);
          setLoading(false);
          return;
        }

        // Get organizations user is member of
        const orgIds = membershipData.map(m => m.organization_id);
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', orgIds)
          .order('name');

        if (orgsError) throw orgsError;

        // Get workspaces for those organizations
        const { data: workspacesData, error: workspacesError } = await supabase
          .from('workspaces')
          .select('*')
          .in('organization_id', orgIds)
          .order('name');

        if (workspacesError) throw workspacesError;

        const organizationsWithWorkspaces = orgsData?.map(org => ({
          ...org,
          workspaces: workspacesData?.filter(ws => ws.organization_id === org.id) || []
        })) || [];

        console.log('Organizations with workspaces for regular user:', organizationsWithWorkspaces);
        setOrganizations(organizationsWithWorkspaces);
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
    if (!name) return;

    try {
      const slug = generateSlug(name);
      
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: name,
          slug: slug
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Organisatie succesvol aangemaakt",
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

  const updateOrganization = async (orgId: string, name: string) => {
    if (!name) return;

    try {
      const slug = generateSlug(name);
      
      const { error } = await supabase
        .from('organizations')
        .update({
          name: name,
          slug: slug
        })
        .eq('id', orgId);

      if (error) throw error;

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

  const deleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Weet je zeker dat je organisatie "${orgName}" wilt verwijderen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Organisatie "${orgName}" verwijderd`,
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

  const createWorkspace = async (organizationId: string, name: string) => {
    if (!name) return;

    try {
      const slug = generateSlug(name);
      
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: name,
          slug: slug,
          organization_id: organizationId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Werkruimte succesvol aangemaakt",
      });

      fetchOrganizations();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const updateWorkspace = async (workspaceId: string, name: string) => {
    if (!name) return;

    try {
      const slug = generateSlug(name);
      
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: name,
          slug: slug
        })
        .eq('id', workspaceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Werkruimte succesvol bijgewerkt",
      });

      fetchOrganizations();
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!confirm(`Weet je zeker dat je werkruimte "${workspaceName}" wilt verwijderen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Werkruimte "${workspaceName}" verwijderd`,
      });

      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet verwijderen",
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
    deleteOrganization,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  };
};
