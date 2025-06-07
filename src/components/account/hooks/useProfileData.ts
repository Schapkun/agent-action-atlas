
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, OrganizationMembership, WorkspaceMembership } from '../types/UserProfile';

export const useProfileData = (targetUserId?: string) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceMembership[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for user:', targetUserId);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      console.log('Profile data:', profileData);
      setProfile(profileData);

      // Fetch organization memberships
      const { data: orgMemberships, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          role,
          created_at,
          organizations(id, name)
        `)
        .eq('user_id', targetUserId);

      console.log('Organization memberships raw data:', orgMemberships);

      if (orgError) {
        console.error('Error fetching organization memberships:', orgError);
      }

      // Fetch workspace memberships
      const { data: workspaceMemberships, error: workspaceError } = await supabase
        .from('workspace_members')
        .select(`
          role,
          created_at,
          workspaces(
            id, 
            name,
            organizations(name)
          )
        `)
        .eq('user_id', targetUserId);

      console.log('Workspace memberships raw data:', workspaceMemberships);

      if (workspaceError) {
        console.error('Error fetching workspace memberships:', workspaceError);
      }

      // Process organization memberships
      const processedOrgs = (orgMemberships || []).map(membership => ({
        id: (membership as any).organizations?.id || '',
        name: (membership as any).organizations?.name || 'Onbekende Organisatie',
        role: membership.role,
        created_at: membership.created_at
      })).filter(org => org.id);

      // Process workspace memberships
      const processedWorkspaces = (workspaceMemberships || []).map(membership => ({
        id: (membership as any).workspaces?.id || '',
        name: (membership as any).workspaces?.name || 'Onbekende Werkruimte',
        organization_name: (membership as any).workspaces?.organizations?.name || 'Onbekende Organisatie',
        role: membership.role,
        created_at: membership.created_at
      })).filter(workspace => workspace.id);

      console.log('Processed organization memberships:', processedOrgs);
      console.log('Processed workspace memberships:', processedWorkspaces);

      setOrganizations(processedOrgs);
      setWorkspaces(processedWorkspaces);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Kon gebruikersgegevens niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId]);

  return {
    profile,
    setProfile,
    organizations,
    workspaces,
    loading,
    fetchProfile
  };
};
