
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
      return;
    }

    console.log('refreshOrganizations: Starting for user:', user.id);

    try {
      // First try to get all organizations where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

      console.log('Member data query result:', { memberData, memberError });

      if (memberError) {
        console.error('Error fetching member data:', memberError);
        throw memberError;
      }

      if (!memberData || memberData.length === 0) {
        console.log('No organization memberships found');
        setOrganizations([]);
        setCurrentOrganization(null);
        return;
      }

      const orgIds = memberData.map(m => m.organization_id);
      console.log('Organization IDs user is member of:', orgIds);

      // Now fetch the organization details
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      console.log('Organizations query result:', { orgData, orgError });

      if (orgError) {
        console.error('Error fetching organizations:', orgError);
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
      toast({
        title: "Error",
        description: "Kon organisaties niet laden: " + error.message,
        variant: "destructive",
      });
    }
  };

  const refreshWorkspaces = async () => {
    if (!user || !currentOrganization) {
      console.log('refreshWorkspaces: Missing user or current organization');
      return;
    }

    console.log('refreshWorkspaces: Starting for organization:', currentOrganization.id);

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      console.log('Workspaces query result:', { data, error });

      if (error) throw error;

      setWorkspaces(data || []);
      
      // Don't automatically set workspace - let user choose
      // This allows showing all data when no workspace is selected
    } catch (error: any) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: "Kon werkruimtes niet laden: " + error.message,
        variant: "destructive",
      });
    }
  };

  // Handle workspace selection with null option for "all workspaces"
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
      // Reset workspace selection when organization changes
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
