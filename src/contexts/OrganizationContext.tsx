
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
  setCurrentWorkspace: (workspace: Workspace | null) => void;
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
      console.log('refreshOrganizations: No user found');
      setOrganizations([]);
      setCurrentOrganization(null);
      return;
    }

    console.log('refreshOrganizations: Starting for user:', user.id);

    try {
      // Use the RLS policies to get organizations
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*');

      console.log('Organizations query result:', { orgData, orgError });

      if (orgError) {
        console.error('Error fetching organizations:', orgError);
        // If RLS blocks access, user has no organizations
        if (orgError.message.includes('policy') || orgError.code === '42P17') {
          console.log('RLS policy error - user has no access to organizations');
          setOrganizations([]);
          setCurrentOrganization(null);
          return;
        }
        throw orgError;
      }

      const orgs = orgData || [];
      console.log('Final organizations:', orgs);
      
      setOrganizations(orgs);

      // Set first organization as current if none selected
      if (orgs.length > 0 && !currentOrganization) {
        console.log('Setting current organization to:', orgs[0]);
        setCurrentOrganization(orgs[0]);
      }
    } catch (error: any) {
      console.error('Error in refreshOrganizations:', error);
      // Don't show error toast for RLS issues - this is expected for new users
      if (!error.message.includes('policy') && error.code !== '42P17') {
        toast({
          title: "Error",
          description: "Kon organisaties niet laden: " + error.message,
          variant: "destructive",
        });
      }
    }
  };

  const refreshWorkspaces = async () => {
    if (!user || !currentOrganization) {
      console.log('refreshWorkspaces: Missing user or current organization');
      setWorkspaces([]);
      return;
    }

    console.log('refreshWorkspaces: Starting for organization:', currentOrganization.id);

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      console.log('Workspaces query result:', { data, error });

      if (error) {
        console.error('Error fetching workspaces:', error);
        // If it's a policy error, there might be no workspaces yet
        if (error.message.includes('policy') || error.code === '42P17') {
          console.log('Policy error - no workspaces found');
          setWorkspaces([]);
          return;
        }
        throw error;
      }

      setWorkspaces(data || []);
    } catch (error: any) {
      console.error('Error fetching workspaces:', error);
      // Don't show error toast for RLS issues
      if (!error.message.includes('policy') && error.code !== '42P17') {
        toast({
          title: "Error",
          description: "Kon werkruimtes niet laden: " + error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleSetCurrentWorkspace = (workspace: Workspace | null) => {
    console.log('Setting current workspace to:', workspace?.name || 'All workspaces');
    setCurrentWorkspace(workspace);
  };

  useEffect(() => {
    console.log('OrganizationContext useEffect: user changed:', user?.id);
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
    console.log('OrganizationContext useEffect: currentOrganization changed:', currentOrganization?.id);
    if (currentOrganization) {
      setCurrentWorkspace(null);
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
    setCurrentWorkspace: handleSetCurrentWorkspace,
    refreshOrganizations,
    refreshWorkspaces,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
