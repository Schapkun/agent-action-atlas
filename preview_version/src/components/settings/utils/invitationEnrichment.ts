
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
    const details = log.details as any;
    if (details?.invitation_id) {
      invitationIds.push(details.invitation_id);
    }
    if (details?.invitation_ids && Array.isArray(details.invitation_ids)) {
      invitationIds.push(...details.invitation_ids);
    }
  });

  console.log('Looking up invitation IDs:', invitationIds);

  // First try to fetch from user_invitations table (for active invitations)
  const { data: invitations, error } = await supabase
    .from('user_invitations')
    .select('id, email, organization_id, workspace_id')
    .in('id', invitationIds);

  if (error) {
    console.error('Error fetching invitation details:', error);
  }

  console.log('Found invitation details from user_invitations:', invitations);

  // Create a map for quick lookup
  const invitationMap = new Map();
  invitations?.forEach(inv => {
    invitationMap.set(inv.id, inv);
  });

  // If we couldn't find some invitations, try to get them from history logs of invitation creation
  const missingIds = invitationIds.filter(id => !invitationMap.has(id));
  
  if (missingIds.length > 0) {
    console.log('Looking for missing invitation emails in history logs for IDs:', missingIds);
    
    // Look for invitation creation logs that might contain the email
    const { data: creationLogs } = await supabase
      .from('history_logs')
      .select('details')
      .or(`details->>invitation_id.in.(${missingIds.join(',')}),details->>email.is.not.null`)
      .ilike('action', '%uitgenodigd%');

    if (creationLogs) {
      creationLogs.forEach(log => {
        const details = log.details as any;
        if (details?.invitation_id && details?.email) {
          invitationMap.set(details.invitation_id, {
            id: details.invitation_id,
            email: details.email,
            organization_id: null,
            workspace_id: null
          });
          console.log(`Found email from creation log for ${details.invitation_id}: ${details.email}`);
        }
      });
    }
  }

  // Enrich the logs with email addresses
  return logs.map(log => {
    if (!log.action.toLowerCase().includes('uitnodiging geannuleerd')) {
      return log;
    }

    const details = log.details as any;
    
    // Check if we already have email in the original details
    let emailAddress = details?.email || details?.invited_email || details?.user_email;
    let orgId = log.organization_id;
    let workspaceId = log.workspace_id;

    // Only try database lookup if we don't already have an email
    if (!emailAddress) {
      if (details?.invitation_id) {
        const invitation = invitationMap.get(details.invitation_id);
        if (invitation) {
          emailAddress = invitation.email;
          orgId = orgId || invitation.organization_id;
          workspaceId = workspaceId || invitation.workspace_id;
          console.log(`Enriched log ${log.id} with email: ${emailAddress}`);
        } else {
          console.log(`No invitation found for ID: ${details.invitation_id}`);
        }
      } else if (details?.invitation_ids && Array.isArray(details.invitation_ids)) {
        // For multiple invitations, try to get emails for all of them
        const emails = details.invitation_ids
          .map(id => invitationMap.get(id)?.email)
          .filter(email => email);
        
        if (emails.length > 0) {
          emailAddress = emails.length === 1 ? emails[0] : `${emails.length} uitnodigingen`;
          console.log(`Enriched log ${log.id} with multiple emails: ${emailAddress}`);
        } else {
          console.log(`No invitations found for IDs: ${details.invitation_ids}`);
        }
      }
    } else {
      console.log(`Using email from original log details: ${emailAddress}`);
    }

    // Only add invited_email if we actually found a valid email address
    const enrichedDetails = { ...details };
    if (emailAddress && typeof emailAddress === 'string' && emailAddress.includes('@')) {
      enrichedDetails.invited_email = emailAddress;
      console.log(`Successfully enriched log ${log.id} with email: ${emailAddress}`);
    } else if (emailAddress && typeof emailAddress === 'string' && emailAddress.includes('uitnodigingen')) {
      // Handle multiple invitations case
      enrichedDetails.invited_email = emailAddress;
      console.log(`Successfully enriched log ${log.id} with multiple invitations info: ${emailAddress}`);
    } else {
      console.log(`No valid email found for log ${log.id}, not adding invited_email field`);
    }

    return {
      ...log,
      organization_id: orgId,
      workspace_id: workspaceId,
      details: enrichedDetails
    };
  });
};
