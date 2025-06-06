
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
      console.log('No user found - clearing organizations');
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    console.log('Fetching organizations for user:', user.id);
    setLoading(true);

    try {
      // First get user's organization memberships
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error('Error fetching memberships:', membershipError);
        throw membershipError;
      }

      if (!memberships || memberships.length === 0) {
        console.log('No organization memberships found');
        setOrganizations([]);
        setCurrentOrganization(null);
        setLoading(false);
        return;
      }

      const orgIds = memberships.map(m => m.organization_id);
      console.log('Found organization IDs:', orgIds);

      // Then get the organizations
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds)
        .order('created_at', { ascending: true });

      if (orgsError) {
        console.error('Error fetching organizations:', orgsError);
        throw orgsError;
      }

      const orgs = orgsData || [];
      console.log('Fetched organizations:', orgs);
      
      setOrganizations(orgs);

      // Set first organization as current if none selected
      if (orgs.length > 0 && !currentOrganization) {
        console.log('Setting current organization to:', orgs[0]);
        setCurrentOrganization(orgs[0]);
      } else if (orgs.length === 0) {
        setCurrentOrganization(null);
      }
    } catch (error: any) {
      console.error('Error in refreshOrganizations:', error);
      toast({
        title: "Error",
        description: "Kon organisaties niet laden: " + error.message,
        variant: "destructive",
      });
      setOrganizations([]);
      setCurrentOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspaces = async () => {
    if (!user || !currentOrganization) {
      console.log('Missing user or current organization - clearing workspaces');
      setWorkspaces([]);
      setCurrentWorkspace(null);
      return;
    }

    console.log('Fetching workspaces for organization:', currentOrganization.id);

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching workspaces:', error);
        throw error;
      }

      const workspaceData = data || [];
      console.log('Fetched workspaces:', workspaceData);
      setWorkspaces(workspaceData);
      
      // Reset current workspace when switching organizations
      setCurrentWorkspace(null);
    } catch (error: any) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: "Kon werkruimtes niet laden: " + error.message,
        variant: "destructive",
      });
      setWorkspaces([]);
      setCurrentWorkspace(null);
    }
  };

  const handleSetCurrentWorkspace = (workspace: Workspace | null) => {
    console.log('Setting current workspace to:', workspace?.name || 'All workspaces');
    setCurrentWorkspace(workspace);
  };

  useEffect(() => {
    console.log('User changed:', user?.id);
    if (user) {
      refreshOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
    }
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
