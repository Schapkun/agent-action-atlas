
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  workspaces: Workspace[];
  selectedOrganization: Organization | null;
  selectedWorkspace: Workspace | null;
  setSelectedOrganization: (org: Organization | null) => void;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  isLoadingOrganizations: boolean;
  getFilteredWorkspaces: () => Workspace[];
  refreshData: () => Promise<void>;
  isReady: boolean; // Add ready state
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    console.error('useOrganization must be used within an OrganizationProvider');
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    console.log('OrganizationProvider - Auth user changed:', user?.id);
    if (user) {
      fetchOrganizationsAndWorkspaces();
    } else {
      // Reset state when user logs out
      setOrganizations([]);
      setWorkspaces([]);
      setSelectedOrganization(null);
      setSelectedWorkspace(null);
      setIsLoadingOrganizations(false);
      setIsReady(true);
    }
  }, [user]);

  const fetchOrganizationsAndWorkspaces = async () => {
    if (!user?.id) {
      setIsReady(true);
      return;
    }

    try {
      setIsLoadingOrganizations(true);
      console.log('OrganizationProvider - Fetching data for user:', user.id);
      
      const isAccountOwner = user.email === 'info@schapkun.com';
      
      if (isAccountOwner) {
        // Fetch all organizations and workspaces for account owner
        const [orgResponse, workspaceResponse] = await Promise.all([
          supabase.from('organizations').select('id, name, slug').order('created_at', { ascending: true }),
          supabase.from('workspaces').select('id, name, slug, organization_id').order('created_at', { ascending: true })
        ]);

        if (orgResponse.error) throw orgResponse.error;
        if (workspaceResponse.error) throw workspaceResponse.error;

        setOrganizations(orgResponse.data || []);
        setWorkspaces(workspaceResponse.data || []);
      } else {
        // For regular users, first get organization memberships
        const orgMembership = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        if (orgMembership.error) throw orgMembership.error;

        if (orgMembership.data && orgMembership.data.length > 0) {
          // Get organizations user is member of
          const orgIds = orgMembership.data.map(m => m.organization_id);
          const { data: orgData, error: orgError } = await supabase
            .from('organizations')
            .select('id, name, slug')
            .in('id', orgIds)
            .order('created_at', { ascending: true });

          if (orgError) throw orgError;
          setOrganizations(orgData || []);

          // Get workspaces for those organizations
          const { data: workspaceData, error: workspaceError } = await supabase
            .from('workspaces')
            .select('id, name, slug, organization_id')
            .in('organization_id', orgIds)
            .order('created_at', { ascending: true });

          if (workspaceError) throw workspaceError;
          setWorkspaces(workspaceData || []);
        } else {
          // User is not member of any organization, check workspace membership
          const workspaceMembership = await supabase
            .from('workspace_members')
            .select('workspace_id')
            .eq('user_id', user.id);

          if (workspaceMembership.error) throw workspaceMembership.error;

          if (workspaceMembership.data && workspaceMembership.data.length > 0) {
            const workspaceIds = workspaceMembership.data.map(m => m.workspace_id);
            const { data: workspaceData, error: workspaceError } = await supabase
              .from('workspaces')
              .select('id, name, slug, organization_id')
              .in('id', workspaceIds)
              .order('created_at', { ascending: true });

            if (workspaceError) throw workspaceError;
            setWorkspaces(workspaceData || []);

            // Get unique organization IDs from workspaces
            const orgIds = [...new Set(workspaceData?.map(w => w.organization_id) || [])];
            
            if (orgIds.length > 0) {
              const { data: orgData, error: orgError } = await supabase
                .from('organizations')
                .select('id, name, slug')
                .in('id', orgIds)
                .order('created_at', { ascending: true });

              if (orgError) throw orgError;
              setOrganizations(orgData || []);
            }
          } else {
            // User has no memberships at all
            setOrganizations([]);
            setWorkspaces([]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching organizations and workspaces:', error);
      setOrganizations([]);
      setWorkspaces([]);
    } finally {
      setIsLoadingOrganizations(false);
      setIsReady(true);
    }
  };

  const refreshData = async () => {
    await fetchOrganizationsAndWorkspaces();
  };

  const getFilteredWorkspaces = () => {
    if (selectedOrganization) {
      return workspaces.filter(w => w.organization_id === selectedOrganization.id);
    }
    return workspaces;
  };

  const handleSetSelectedOrganization = (org: Organization | null) => {
    setSelectedOrganization(org);
    // Clear workspace selection when organization changes
    setSelectedWorkspace(null);
  };

  const value: OrganizationContextType = {
    organizations,
    workspaces,
    selectedOrganization,
    selectedWorkspace,
    setSelectedOrganization: handleSetSelectedOrganization,
    setSelectedWorkspace,
    isLoadingOrganizations,
    getFilteredWorkspaces,
    refreshData,
    isReady,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
