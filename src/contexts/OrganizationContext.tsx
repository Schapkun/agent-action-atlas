
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface Workspace {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  setCurrentOrganization: (org: Organization) => void;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refreshOrganizations: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshOrganizations = async () => {
    if (!user) {
      console.log('No user found, skipping organization refresh');
      return;
    }

    console.log('Refreshing organizations for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_members!inner(user_id)
        `)
        .eq('organization_members.user_id', user.id);

      console.log('Organizations query result:', { data, error });

      if (error) throw error;

      const orgs = data.map(item => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      console.log('Mapped organizations:', orgs);
      setOrganizations(orgs);

      // Set first organization as current if none selected
      if (orgs.length > 0 && !currentOrganization) {
        console.log('Setting current organization to:', orgs[0]);
        setCurrentOrganization(orgs[0]);
      }
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Kon organisaties niet laden.",
        variant: "destructive",
      });
    }
  };

  const refreshWorkspaces = async () => {
    if (!user || !currentOrganization) {
      console.log('No user or current organization, skipping workspace refresh');
      return;
    }

    console.log('Refreshing workspaces for organization:', currentOrganization.id);

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      console.log('Workspaces query result:', { data, error });

      if (error) throw error;

      setWorkspaces(data || []);

      // Set first workspace as current if none selected
      if (data && data.length > 0 && !currentWorkspace) {
        console.log('Setting current workspace to:', data[0]);
        setCurrentWorkspace(data[0]);
      }
    } catch (error: any) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: "Kon werkruimtes niet laden.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log('OrganizationContext useEffect triggered, user:', user?.id);
    if (user) {
      refreshOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    console.log('Current organization changed:', currentOrganization?.id);
    if (currentOrganization) {
      refreshWorkspaces();
    } else {
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }
  }, [currentOrganization]);

  const value: OrganizationContextType = {
    organizations,
    currentOrganization,
    workspaces,
    currentWorkspace,
    loading,
    setCurrentOrganization,
    setCurrentWorkspace,
    refreshOrganizations,
    refreshWorkspaces,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
