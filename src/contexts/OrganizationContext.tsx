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
  createFirstOrganization: (name: string) => Promise<boolean>;
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

  const createFirstOrganization = async (name: string): Promise<boolean> => {
    if (!user || !name.trim()) {
      console.log('Cannot create organization: no user or name');
      return false;
    }

    console.log('Creating first organization:', name);
    
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: name.trim(),
          slug: slug
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw orgError;
      }

      console.log('Organization created:', org);

      // Add user as organization owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) {
        console.error('Organization member creation error:', memberError);
        throw memberError;
      }

      console.log('User added as organization owner');

      // Create default workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          organization_id: org.id,
          name: 'Hoofd Werkruimte',
          slug: 'main'
        })
        .select()
        .single();

      if (workspaceError) {
        console.error('Workspace creation error:', workspaceError);
        throw workspaceError;
      }

      console.log('Default workspace created:', workspace);

      // Add user as workspace admin
      const { error: workspaceMemberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'admin'
        });

      if (workspaceMemberError) {
        console.error('Workspace member creation error:', workspaceMemberError);
        throw workspaceMemberError;
      }

      console.log('User added as workspace admin');

      // Update state
      setOrganizations([org]);
      setCurrentOrganization(org);
      setWorkspaces([workspace]);
      setCurrentWorkspace(workspace);

      toast({
        title: "Organisatie aangemaakt!",
        description: `Je organisatie "${name}" is succesvol aangemaakt.`,
      });

      return true;
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet aanmaken. Probeer het opnieuw.",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshOrganizations = async () => {
    if (!user) {
      console.log('No user found, skipping organization refresh');
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    console.log('Fetching organizations for user:', user.id);
    setLoading(true);

    try {
      // Simple direct query to avoid RLS issues
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          organizations!organization_members_organization_id_fkey(*)
        `)
        .eq('user_id', user.id);

      if (memberError) {
        console.error('Error fetching organization members:', memberError);
        setOrganizations([]);
        setCurrentOrganization(null);
        setLoading(false);
        return;
      }

      console.log('Organization members data:', memberData);

      // Extract organizations from the join result
      const orgs = memberData?.map(member => member.organizations).filter(Boolean) || [];
      console.log('Found organizations:', orgs);
      
      setOrganizations(orgs);
      
      if (orgs.length > 0 && !currentOrganization) {
        setCurrentOrganization(orgs[0]);
      } else if (orgs.length === 0) {
        setCurrentOrganization(null);
      }
    } catch (error: any) {
      console.error('Unexpected error in refreshOrganizations:', error);
      setOrganizations([]);
      setCurrentOrganization(null);
    }
    
    setLoading(false);
  };

  const refreshWorkspaces = async () => {
    if (!user || !currentOrganization) {
      setWorkspaces([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('organization_id', currentOrganization.id);

      if (error) {
        console.error('Error fetching workspaces:', error);
        setWorkspaces([]);
        return;
      }

      setWorkspaces(data || []);
    } catch (error: any) {
      console.error('Error fetching workspaces:', error);
      setWorkspaces([]);
    }
  };

  const handleSetCurrentWorkspace = (workspace: Workspace | null) => {
    setCurrentWorkspace(workspace);
  };

  useEffect(() => {
    console.log('User changed, refreshing organizations');
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
    createFirstOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};
