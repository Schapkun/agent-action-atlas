
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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

interface Member {
  user_id: string;
  email: string;
  account_name?: string;
  role: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  workspaces: Workspace[];
  selectedOrganization: Organization | null;
  selectedWorkspace: Workspace | null;
  selectedMember: Member | null;
  setSelectedOrganization: (org: Organization | null) => void;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  setSelectedMember: (member: Member | null) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

interface OrganizationProviderProps {
  children: ReactNode;
}

export const OrganizationProvider = ({ children }: OrganizationProviderProps) => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch organizations
      const { data: orgData, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          organizations!inner (
            id,
            name,
            slug
          )
        `)
        .eq('user_id', user.id);

      if (orgError) throw orgError;

      const orgs = orgData?.map(item => item.organizations).filter(Boolean) || [];
      setOrganizations(orgs);

      // Fetch workspaces
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          workspaces!inner (
            id,
            name,
            slug,
            organization_id
          )
        `)
        .eq('user_id', user.id);

      if (workspaceError) throw workspaceError;

      const workspacesList = workspaceData?.map(item => item.workspaces).filter(Boolean) || [];
      setWorkspaces(workspacesList);

      // Auto-select first organization if none selected
      if (!selectedOrganization && orgs.length > 0) {
        setSelectedOrganization(orgs[0]);
      }

    } catch (error) {
      console.error('Error fetching organization data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Reset selected member when organization or workspace changes
  useEffect(() => {
    setSelectedMember(null);
  }, [selectedOrganization, selectedWorkspace]);

  const value: OrganizationContextType = {
    organizations,
    workspaces,
    selectedOrganization,
    selectedWorkspace,
    selectedMember,
    setSelectedOrganization,
    setSelectedWorkspace,
    setSelectedMember,
    loading,
    refetch: fetchData,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
