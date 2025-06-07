
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface HistoryLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_id: string;
  organization_id?: string;
  workspace_id?: string;
  user_name?: string;
  user_email?: string;
  organization_name?: string;
  workspace_name?: string;
  user_role?: string;
}

export const useHistoryLogs = () => {
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  useEffect(() => {
    if (user && userRole) {
      fetchHistoryLogs();
    }
  }, [user, userRole]);

  const fetchUserRole = async () => {
    if (!user?.id) return;

    try {
      // Check if user is account owner
      if (user.email === 'info@schapkun.com') {
        setUserRole('owner');
        return;
      }

      // Get user's role from their organization memberships
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .limit(1);

      if (memberships && memberships.length > 0) {
        setUserRole(memberships[0].role);
      } else {
        setUserRole('member');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('member');
    }
  };

  const enrichInvitationData = async (logs: any[]) => {
    // Find all logs with invitation cancellations that have invitation_id or invitation_ids
    const invitationCancellations = logs.filter(log => 
      log.action.toLowerCase().includes('uitnodiging geannuleerd') && 
      (log.details?.invitation_id || log.details?.invitation_ids)
    );

    if (invitationCancellations.length === 0) return logs;

    // Extract all invitation IDs
    const invitationIds: string[] = [];
    invitationCancellations.forEach(log => {
      if (log.details.invitation_id) {
        invitationIds.push(log.details.invitation_id);
      }
      if (log.details.invitation_ids && Array.isArray(log.details.invitation_ids)) {
        invitationIds.push(...log.details.invitation_ids);
      }
    });

    console.log('Looking up invitation IDs:', invitationIds);

    // Fetch invitation details from user_invitations table
    const { data: invitations, error } = await supabase
      .from('user_invitations')
      .select('id, email, organization_id, workspace_id')
      .in('id', invitationIds);

    if (error) {
      console.error('Error fetching invitation details:', error);
      return logs;
    }

    console.log('Found invitation details:', invitations);

    // Enrich the logs with email addresses
    return logs.map(log => {
      if (!log.action.toLowerCase().includes('uitnodiging geannuleerd')) {
        return log;
      }

      let emailAddress = null;
      let orgId = log.organization_id;
      let workspaceId = log.workspace_id;

      if (log.details?.invitation_id) {
        const invitation = invitations?.find(inv => inv.id === log.details.invitation_id);
        if (invitation) {
          emailAddress = invitation.email;
          orgId = orgId || invitation.organization_id;
          workspaceId = workspaceId || invitation.workspace_id;
        }
      } else if (log.details?.invitation_ids && Array.isArray(log.details.invitation_ids)) {
        // For multiple invitations, get the first email (or could be combined)
        const firstInvitation = invitations?.find(inv => 
          log.details.invitation_ids.includes(inv.id)
        );
        if (firstInvitation) {
          emailAddress = firstInvitation.email;
          orgId = orgId || firstInvitation.organization_id;
          workspaceId = workspaceId || firstInvitation.workspace_id;
        }
      }

      return {
        ...log,
        organization_id: orgId,
        workspace_id: workspaceId,
        details: {
          ...log.details,
          invited_email: emailAddress
        }
      };
    });
  };

  const fetchHistoryLogs = async () => {
    if (!user?.id || !userRole) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching history logs for user:', user.id, 'with role:', userRole);

      let logsQuery = supabase
        .from('history_logs')
        .select('id, action, details, created_at, user_id, organization_id, workspace_id');

      // Filter based on user role
      if (userRole === 'owner' || user.email === 'info@schapkun.com') {
        // Owner can see all history logs from all users
        logsQuery = logsQuery.order('created_at', { ascending: false });
      } else if (userRole === 'admin') {
        // Admin can see history from all users except the owner
        // First get all user IDs except the owner
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id, email')
          .neq('email', 'info@schapkun.com');

        if (allUsers && allUsers.length > 0) {
          const userIds = allUsers.map(u => u.id);
          logsQuery = logsQuery.in('user_id', userIds);
        } else {
          // If no users found, just show current user's logs
          logsQuery = logsQuery.eq('user_id', user.id);
        }
        logsQuery = logsQuery.order('created_at', { ascending: false });
      } else {
        // Regular users can only see their own history
        logsQuery = logsQuery.eq('user_id', user.id).order('created_at', { ascending: false });
      }

      const { data: logsData, error: logsError } = await logsQuery;

      if (logsError) {
        console.error('History logs error:', logsError);
        throw logsError;
      }

      console.log('History logs data:', logsData);

      if (!logsData || logsData.length === 0) {
        setHistoryLogs([]);
        setLoading(false);
        return;
      }

      // Enrich invitation cancellation data with email addresses
      const enrichedLogs = await enrichInvitationData(logsData);

      // Get unique user IDs from the logs to fetch their profiles
      const userIds = [...new Set(enrichedLogs.map(log => log.user_id).filter(Boolean))];
      let usersData: any[] = [];
      if (userIds.length > 0) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        if (!error) usersData = data || [];
      }

      // Get organizations for the logs
      const orgIds = [...new Set(enrichedLogs.map(log => log.organization_id).filter(Boolean))];
      let orgsData: any[] = [];
      if (orgIds.length > 0) {
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds);
        if (!error) orgsData = data || [];
      }

      // Get workspaces for the logs
      const workspaceIds = [...new Set(enrichedLogs.map(log => log.workspace_id).filter(Boolean))];
      let workspacesData: any[] = [];
      if (workspaceIds.length > 0) {
        const { data, error } = await supabase
          .from('workspaces')
          .select('id, name')
          .in('id', workspaceIds);
        if (!error) workspacesData = data || [];
      }

      // Format the logs
      const formattedLogs = enrichedLogs.map(log => {
        const userProfile = usersData.find(u => u.id === log.user_id);
        const organization = orgsData.find(o => o.id === log.organization_id);
        const workspace = workspacesData.find(w => w.id === log.workspace_id);

        return {
          id: log.id,
          action: log.action,
          details: log.details,
          created_at: log.created_at,
          user_id: log.user_id,
          organization_id: log.organization_id,
          workspace_id: log.workspace_id,
          user_name: userProfile?.full_name || 'Onbekende gebruiker',
          user_email: userProfile?.email || '',
          organization_name: organization?.name,
          workspace_name: workspace?.name
        };
      });

      setHistoryLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching history logs:', error);
      toast({
        title: "Error",
        description: "Kon geschiedenis niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    historyLogs,
    loading,
    userRole
  };
};
