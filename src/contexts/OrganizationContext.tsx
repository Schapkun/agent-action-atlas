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

  const createDefaultOrganization = async () => {
    if (!user) {
      console.log('createDefaultOrganization: No user found');
      return null;
    }

    try {
      console.log('Creating default organization for user:', user.id);
      
      // Get user name from profile or email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      console.log('Profile query result:', { profile, profileError });

      const userName = profile?.full_name || profile?.email?.split('@')[0] || user.email?.split('@')[0] || 'Gebruiker';
      const orgName = `${userName}'s Organisatie`;
      const orgSlug = orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      console.log('Creating org with name:', orgName, 'slug:', orgSlug);

      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          slug: orgSlug
        })
        .select()
        .single();

      console.log('Organization creation result:', { org, orgError });

      if (orgError) throw orgError;

      // Add user as organization owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner'
        });

      console.log('Organization member creation result:', { memberError });

      if (memberError) throw memberError;

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

      console.log('Workspace creation result:', { workspace, workspaceError });

      if (workspaceError) throw workspaceError;

      // Add user as workspace admin
      const { error: workspaceMemberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'admin'
        });

      console.log('Workspace member creation result:', { workspaceMemberError });

      if (workspaceMemberError) throw workspaceMemberError;

      console.log('Default organization created successfully:', org);
      
      toast({
        title: "Welkom!",
        description: `Je eerste organisatie "${orgName}" is aangemaakt.`,
      });

      return org;
    } catch (error: any) {
      console.error('Error creating default organization:', error);
      toast({
        title: "Error",
        description: "Kon standaard organisatie niet aanmaken: " + error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  const refreshOrganizations = async () => {
    if (!user) {
      console.log('refreshOrganizations: No user found');
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    console.log('refreshOrganizations: Starting for user:', user.id);

    try {
      // Query organizations through organization_members to get only user's orgs
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          organizations!organization_members_organization_id_fkey(*)
        `)
        .eq('user_id', user.id);

      console.log('Organization members query result:', { memberData, memberError });

      if (memberError) {
        console.error('Error fetching organization members:', memberError);
        // If no organizations found, create a default one
        console.log('No organizations found, creating default...');
        const defaultOrg = await createDefaultOrganization();
        if (defaultOrg) {
          setOrganizations([defaultOrg]);
          setCurrentOrganization(defaultOrg);
        }
        setLoading(false);
        return;
      }

      // Extract organizations from the join result
      const orgs = memberData?.map(member => member.organizations).filter(Boolean) || [];
      console.log('Found organizations:', orgs);
      
      // If no organizations found, create a default one
      if (orgs.length === 0) {
        console.log('No organizations found, creating default...');
        const defaultOrg = await createDefaultOrganization();
        if (defaultOrg) {
          setOrganizations([defaultOrg]);
          setCurrentOrganization(defaultOrg);
        }
        setLoading(false);
        return;
      }

      setOrganizations(orgs);

      // Set first organization as current if none selected
      if (orgs.length > 0 && !currentOrganization) {
        console.log('Setting current organization to:', orgs[0]);
        setCurrentOrganization(orgs[0]);
      }
    } catch (error: any) {
      console.error('Error in refreshOrganizations:', error);
      // Try to create default organization on error too
      console.log('Error occurred, trying to create default organization...');
      const defaultOrg = await createDefaultOrganization();
      if (defaultOrg) {
        setOrganizations([defaultOrg]);
        setCurrentOrganization(defaultOrg);
      } else {
        setOrganizations([]);
        setCurrentOrganization(null);
      }
      toast({
        title: "Error",
        description: "Kon organisaties niet laden: " + error.message,
        variant: "destructive",
      });
    }
    
    setLoading(false);
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
        setWorkspaces([]);
        return;
      }

      setWorkspaces(data || []);
    } catch (error: any) {
      console.error('Error fetching workspaces:', error);
      setWorkspaces([]);
      toast({
        title: "Error",
        description: "Kon werkruimtes niet laden: " + error.message,
        variant: "destructive",
      });
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
      setLoading(false);
    }
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
