
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Organization {
  id: string;
  name: string;
  slug: string;
  workspaces?: Workspace[];
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  sender_email?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  hasOrgAccess?: boolean;
  workspaceAccess?: { [workspaceId: string]: boolean };
}

export const useManageOrgWorkspaceDialog = (item: Organization | null) => {
  const [name, setName] = useState(item?.name || '');
  const [orgEmail, setOrgEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const { toast } = useToast();
  const { refreshData } = useOrganization();

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      // Reset data fetched flag when item changes
      setDataFetched(false);
    } else {
      setName('');
      setDataFetched(false);
    }
  }, [item]);

  const fetchData = useCallback(async () => {
    if (!item || dataFetched || loading) return;

    try {
      setLoading(true);
      
      // Get organization email from organization_settings
      const { data: orgSettings, error: orgSettingsError } = await supabase
        .from('organization_settings')
        .select('company_email')
        .eq('organization_id', item.id)
        .maybeSingle();

      if (orgSettingsError) {
        console.error('Error fetching org settings:', orgSettingsError);
      } else {
        setOrgEmail(orgSettings?.company_email || '');
      }
      
      // Get all users from profiles
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (usersError) throw usersError;

      // Get current organization members
      const { data: orgMembers, error: orgMembersError } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', item.id);
      
      if (orgMembersError) throw orgMembersError;
      const orgMemberIds = orgMembers?.map(m => m.user_id) || [];

      // Get workspaces for this organization
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('id, name, slug, organization_id, sender_email')
        .eq('organization_id', item.id)
        .order('name');
      
      if (workspacesError) throw workspacesError;
      setWorkspaces(workspacesData || []);

      // Get workspace members for all workspaces
      const workspaceIds = workspacesData?.map(w => w.id) || [];
      let workspaceMembers: { [workspaceId: string]: string[] } = {};
      
      if (workspaceIds.length > 0) {
        const { data: wsMembers, error: wsMembersError } = await supabase
          .from('workspace_members')
          .select('user_id, workspace_id')
          .in('workspace_id', workspaceIds);
        
        if (wsMembersError) throw wsMembersError;
        
        workspaceMembers = (wsMembers || []).reduce((acc, member) => {
          if (!acc[member.workspace_id]) {
            acc[member.workspace_id] = [];
          }
          acc[member.workspace_id].push(member.user_id);
          return acc;
        }, {} as { [workspaceId: string]: string[] });
      }

      // Combine users with access info
      const usersWithAccess = allUsers?.map(user => ({
        ...user,
        hasOrgAccess: orgMemberIds.includes(user.id),
        workspaceAccess: workspaceIds.reduce((acc, wsId) => {
          acc[wsId] = workspaceMembers[wsId]?.includes(user.id) || false;
          return acc;
        }, {} as { [workspaceId: string]: boolean })
      })) || [];

      setUsers(usersWithAccess);
      setDataFetched(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Kon gegevens niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [item, dataFetched, loading, toast]);

  const handleOrgEmailChange = async (email: string) => {
    setOrgEmail(email);
    
    if (!item) return;
    
    try {
      // Save organization email to organization_settings
      const { error } = await supabase
        .from('organization_settings')
        .upsert({
          organization_id: item.id,
          company_email: email.trim() || null
        }, {
          onConflict: 'organization_id'
        });

      if (error) {
        console.error('Error saving organization email:', error);
        toast({
          title: "Fout",
          description: "Kon organisatie email niet opslaan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving organization email:', error);
    }
  };

  const handleWorkspaceEmailChange = async (workspaceId: string, email: string) => {
    // Update local state
    setWorkspaces(prev => prev.map(ws => 
      ws.id === workspaceId ? { ...ws, sender_email: email } : ws
    ));
    
    try {
      // Save workspace email to workspaces table
      const { error } = await supabase
        .from('workspaces')
        .update({
          sender_email: email.trim() || null
        })
        .eq('id', workspaceId);

      if (error) {
        console.error('Error saving workspace email:', error);
        toast({
          title: "Fout",
          description: "Kon werkruimte email niet opslaan",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving workspace email:', error);
    }
  };

  const handleOrgUserToggle = async (userId: string, hasAccess: boolean) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newWorkspaceAccess = { ...user.workspaceAccess };
        if (!hasAccess) {
          Object.keys(newWorkspaceAccess).forEach(wsId => {
            newWorkspaceAccess[wsId] = false;
          });
        }
        return { 
          ...user, 
          hasOrgAccess: hasAccess,
          workspaceAccess: newWorkspaceAccess
        };
      }
      return user;
    }));
  };

  const handleWorkspaceUserToggle = (workspaceId: string, userId: string, hasAccess: boolean) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          workspaceAccess: {
            ...user.workspaceAccess,
            [workspaceId]: hasAccess
          }
        };
      }
      return user;
    }));
  };

  return {
    name,
    setName,
    orgEmail,
    users,
    setUsers,
    workspaces,
    setWorkspaces,
    saving,
    setSaving,
    loading,
    fetchData,
    handleOrgEmailChange,
    handleWorkspaceEmailChange,
    handleOrgUserToggle,
    handleWorkspaceUserToggle,
    toast,
    refreshData
  };
};
