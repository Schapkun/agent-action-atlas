
import { supabase } from '@/integrations/supabase/client';
import { HistoryLog } from '../types/HistoryLog';

export const enrichInvitationData = async (logs: any[]): Promise<HistoryLog[]> => {
  // Find all logs with invitation cancellations that have invitation_id or invitation_ids
  const invitationCancellations = logs.filter(log => 
    log.action.toLowerCase().includes('uitnodiging geannuleerd') && 
    (log.details?.invitation_id || log.details?.invitation_ids)
  );

  if (invitationCancellations.length === 0) {
    console.log('No invitation cancellations found that need enrichment');
    return logs;
  }

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

  // Create a map for quick lookup
  const invitationMap = new Map();
  invitations?.forEach(inv => {
    invitationMap.set(inv.id, inv);
  });

  // Enrich the logs with email addresses
  return logs.map(log => {
    if (!log.action.toLowerCase().includes('uitnodiging geannuleerd')) {
      return log;
    }

    let emailAddress = null;
    let orgId = log.organization_id;
    let workspaceId = log.workspace_id;

    // Try to get email from the invitation lookup first
    if (log.details?.invitation_id) {
      const invitation = invitationMap.get(log.details.invitation_id);
      if (invitation) {
        emailAddress = invitation.email;
        orgId = orgId || invitation.organization_id;
        workspaceId = workspaceId || invitation.workspace_id;
        console.log(`Enriched log ${log.id} with email: ${emailAddress}`);
      } else {
        console.log(`No invitation found for ID: ${log.details.invitation_id}`);
      }
    } else if (log.details?.invitation_ids && Array.isArray(log.details.invitation_ids)) {
      // For multiple invitations, get the first email (or could be combined)
      const firstInvitation = log.details.invitation_ids
        .map(id => invitationMap.get(id))
        .find(inv => inv !== undefined);
      
      if (firstInvitation) {
        emailAddress = firstInvitation.email;
        orgId = orgId || firstInvitation.organization_id;
        workspaceId = workspaceId || firstInvitation.workspace_id;
        console.log(`Enriched log ${log.id} with email from multiple invitations: ${emailAddress}`);
      } else {
        console.log(`No invitations found for IDs: ${log.details.invitation_ids}`);
      }
    }

    // If we couldn't get email from invitations table, try to extract from details
    if (!emailAddress) {
      // Check if there's already an email stored in the log details
      if (log.details?.email) {
        emailAddress = log.details.email;
        console.log(`Using email from log details: ${emailAddress}`);
      } else if (log.details?.invited_email) {
        emailAddress = log.details.invited_email;
        console.log(`Using invited_email from log details: ${emailAddress}`);
      } else if (log.details?.user_email) {
        emailAddress = log.details.user_email;
        console.log(`Using user_email from log details: ${emailAddress}`);
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
