
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Workspace, Organization } from '../types/workspace';

export const useWorkspaceOperations = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchWorkspaces = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching workspaces for user:', user.id);
      
      // Check if user is the account owner (Michael Schapkun)
      const isAccountOwner = user.email === 'info@schapkun.com';
      
      if (isAccountOwner) {
        // If account owner, show ALL workspaces
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id, name, slug, organization_id, created_at')
          .order('created_at', { ascending: false });

        if (workspaceError) {
          console.error('Workspaces fetch error:', workspaceError);
          throw workspaceError;
        }

        console.log('All workspace data (account owner):', workspaceData);

        // Get organization names
        const orgIds = [...new Set(workspaceData?.map(w => w.organization_id) || [])];
        let orgNames: { [key: string]: string } = {};
        
        if (orgIds.length > 0) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .in('id', orgIds);

          if (!orgError && orgData) {
            orgNames = orgData.reduce((acc, org) => {
              acc[org.id] = org.name;
              return acc;
            }, {} as { [key: string]: string });
          }
        }

        // Combine data with owner role for account owner
        const workspacesWithRoles = workspaceData?.map(workspace => {
          return {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            organization_id: workspace.organization_id,
            created_at: workspace.created_at,
            organization_name: orgNames[workspace.organization_id] || 'Onbekend',
            user_role: 'owner' // Account owner has owner role on everything
          };
        }) || [];

        setWorkspaces(workspacesWithRoles);
      } else {
        // For regular users, only show workspaces they are members of
        const { data: membershipData, error: membershipError } = await supabase
          .from('workspace_members')
          .select('role, workspace_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Workspace membership error:', membershipError);
          throw membershipError;
        }

        console.log('Workspace membership data:', membershipData);

        if (!membershipData || membershipData.length === 0) {
          console.log('No workspace memberships found');
          setWorkspaces([]);
          setLoading(false);
          return;
        }

        // Get workspace details
        const workspaceIds = membershipData.map(m => m.workspace_id);
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id, name, slug, organization_id, created_at')
          .in('id', workspaceIds);

        if (workspaceError) {
          console.error('Workspaces fetch error:', workspaceError);
          throw workspaceError;
        }

        console.log('Workspace data:', workspaceData);

        // Get organization names for user's workspaces only
        const orgIds = [...new Set(workspaceData?.map(w => w.organization_id) || [])];
        let orgNames: { [key: string]: string } = {};
        
        if (orgIds.length > 0) {
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name')
            .in('id', orgIds);

          if (!orgError && orgData) {
            orgNames = orgData.reduce((acc, org) => {
              acc[org.id] = org.name;
              return acc;
            }, {} as { [key: string]: string });
          }
        }

        // Combine data
        const workspacesWithRoles = workspaceData?.map(workspace => {
          const membership = membershipData.find(m => m.workspace_id === workspace.id);
          return {
            id: workspace.id,
            name: workspace.name,
            slug: workspace.slug,
            organization_id: workspace.organization_id,
            created_at: workspace.created_at,
            organization_name: orgNames[workspace.organization_id] || 'Onbekend',
            user_role: membership?.role
          };
        }) || [];

        setWorkspaces(workspacesWithRoles);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: "Kon werkruimtes niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    if (!user?.id) return;

    try {
      // Check if user is the account owner (Michael Schapkun)
      const isAccountOwner = user.email === 'info@schapkun.com';
      
      if (isAccountOwner) {
        // If account owner, show ALL organizations
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name', { ascending: true });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          return;
        }

        setOrganizations(orgData || []);
      } else {
        // For regular users, get organizations through membership only
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Organization membership error:', membershipError);
          return;
        }

        if (!membershipData || membershipData.length === 0) {
          setOrganizations([]);
          return;
        }

        const orgIds = membershipData.map(m => m.organization_id);
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds)
          .order('name', { ascending: true });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          return;
        }

        setOrganizations(orgData || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const createWorkspace = async (name: string, organizationId: string) => {
    if (!name.trim() || !organizationId) return;

    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: name,
          slug: slug,
          organization_id: organizationId
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceData.id,
          user_id: user?.id,
          role: 'admin'
        });

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: organizationId,
          workspace_id: workspaceData.id,
          action: 'Werkruimte aangemaakt',
          details: { workspace_name: name }
        });

      toast({
        title: "Succes",
        description: "Werkruimte succesvol aangemaakt",
      });

      fetchWorkspaces();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const updateWorkspace = async (workspace: Workspace) => {
    if (!workspace.name.trim()) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: workspace.name,
          slug: workspace.name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', workspace.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: workspace.organization_id,
          workspace_id: workspace.id,
          action: 'Werkruimte bijgewerkt',
          details: { workspace_name: workspace.name }
        });

      toast({
        title: "Succes",
        description: "Werkruimte succesvol bijgewerkt",
      });

      fetchWorkspaces();
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
    if (!confirm(`Weet je zeker dat je werkruimte "${workspaceName}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Werkruimte succesvol verwijderd",
      });

      fetchWorkspaces();
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
    workspaces,
    organizations,
    loading,
    fetchWorkspaces,
    fetchOrganizations,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  };
};
