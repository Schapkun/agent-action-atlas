import { supabase } from '@/integrations/supabase/client';
import { enrichInvitationData } from './invitationEnrichment';
import { HistoryLog } from '../types/HistoryLog';

export const fetchHistoryLogsData = async (
  userId: string, 
  userRole: string
): Promise<HistoryLog[]> => {
  console.log('Fetching history logs for user:', userId, 'with role:', userRole);

  let logsQuery = supabase
    .from('history_logs')
    .select('id, action, details, created_at, user_id, organization_id, workspace_id');

  // Filter based on user role
  if (userRole === 'owner' || userRole === 'admin') {
    // Owner and admin can see all history logs
    if (userRole === 'admin') {
      // Admin cannot see owner's logs
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id, email')
        .neq('email', 'info@schapkun.com');

      if (allUsers && allUsers.length > 0) {
        const userIds = allUsers.map(u => u.id);
        logsQuery = logsQuery.in('user_id', userIds);
      } else {
        // If no users found, just show current user's logs
        logsQuery = logsQuery.eq('user_id', userId);
      }
    }
    logsQuery = logsQuery.order('created_at', { ascending: false });
  } else {
    // Regular users can only see their own history
    logsQuery = logsQuery.eq('user_id', userId).order('created_at', { ascending: false });
  }

  const { data: logsData, error: logsError } = await logsQuery;

  if (logsError) {
    console.error('History logs error:', logsError);
    throw logsError;
  }

  console.log('History logs data:', logsData);

  if (!logsData || logsData.length === 0) {
    return [];
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

  return formattedLogs;
};
