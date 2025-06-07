
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  organizations?: string[];
  workspaces?: string[];
  isPending?: boolean;
  invitationId?: string;
  role?: string;
  avatar_url?: string | null;
  updated_at?: string;
  member_since?: string;
}

export const useUserDataFetcher = () => {
  const fetchUsersForAccountOwner = async () => {
    console.log('Fetching ALL users for account owner...');
    const { data: usersData, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (usersError) {
      console.error('Users fetch error:', usersError);
      throw usersError;
    }

    console.log('All users data (account owner):', usersData);
    
    // Get all organizations and workspaces for reference
    const [allOrgsResponse, allWorkspacesResponse] = await Promise.all([
      supabase.from('organizations').select('id, name'),
      supabase.from('workspaces').select('id, name')
    ]);

    const allOrgs = allOrgsResponse.data || [];
    const allWorkspaces = allWorkspacesResponse.data || [];
    
    // For each user, get their organization memberships, roles, and workspaces
    const usersWithOrgs = await Promise.all(
      (usersData || []).map(async (userProfile) => {
        // Special case for the account owner - they have access to ALL organizations and workspaces
        if (userProfile.email === 'info@schapkun.com') {
          return {
            ...userProfile,
            organizations: allOrgs.map(org => org.name),
            workspaces: allWorkspaces.map(workspace => workspace.name),
            isPending: false,
            role: 'eigenaar',
            member_since: userProfile.created_at
          };
        }

        // Get organization memberships for other users
        const { data: orgMemberships } = await supabase
          .from('organization_members')
          .select(`
            organization_id, 
            role, 
            created_at,
            organizations!organization_members_organization_id_fkey(name)
          `)
          .eq('user_id', userProfile.id);

        // Get workspace memberships  
        const { data: workspaceMemberships } = await supabase
          .from('workspace_members')
          .select(`
            workspace_id,
            role,
            created_at,
            workspaces!workspace_members_workspace_id_fkey(name)
          `)
          .eq('user_id', userProfile.id);

        const organizations = orgMemberships?.map(m => (m as any).organizations?.name).filter(Boolean) || [];
        const workspaces = workspaceMemberships?.map(m => (m as any).workspaces?.name).filter(Boolean) || [];
        
        // Get the highest role from organizations
        const roles = orgMemberships?.map(m => m.role) || [];
        let highestRole = 'member';
        if (roles.includes('owner')) highestRole = 'owner';
        else if (roles.includes('admin')) highestRole = 'admin';

        // Use the earliest membership date as "member since" date
        const membershipDates = [
          ...(orgMemberships?.map(m => m.created_at) || []),
          ...(workspaceMemberships?.map(m => m.created_at) || [])
        ];
        const earliestMembership = membershipDates.length > 0 
          ? Math.min(...membershipDates.map(d => new Date(d).getTime()))
          : new Date(userProfile.created_at).getTime();

        return {
          ...userProfile,
          organizations,
          workspaces,
          isPending: false,
          role: highestRole,
          member_since: new Date(earliestMembership).toISOString()
        };
      })
    );

    return usersWithOrgs;
  };

  const fetchPendingInvitations = async () => {
    const { data: pendingInvitations, error: invitationsError } = await supabase
      .from('user_invitations')
      .select(`
        id,
        email,
        created_at,
        role,
        organization_id,
        workspace_id,
        organizations(name),
        workspaces(name)
      `)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (invitationsError) {
      console.error('Invitations fetch error:', invitationsError);
      return [];
    }

    // Convert pending invitations to user profile format
    return (pendingInvitations || []).map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      full_name: `${invitation.email} (Uitnodiging pending)`,
      created_at: invitation.created_at,
      organizations: [(invitation as any).organizations?.name].filter(Boolean),
      workspaces: [(invitation as any).workspaces?.name].filter(Boolean),
      isPending: true,
      invitationId: invitation.id,
      role: invitation.role,
      avatar_url: null,
      updated_at: invitation.created_at,
      member_since: invitation.created_at
    }));
  };

  const fetchUsersForRegularUser = async (userId: string, userEmail: string) => {
    console.log('Fetching users for regular user...');
    
    // First, get current user's profile
    const { data: currentUserProfile, error: currentUserError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('Current user profile query result:', { currentUserProfile, currentUserError });

    if (currentUserError) {
      console.error('Current user profile fetch error:', currentUserError);
      if (currentUserError.code === 'PGRST116') {
        console.log('Creating missing profile for user:', userId);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            full_name: userEmail
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }
        
        console.log('Created new profile:', newProfile);
        return [{...newProfile, isPending: false, role: 'member', member_since: newProfile.created_at}];
      } else {
        throw currentUserError;
      }
    }

    // Get current user's role and membership info
    const { data: currentUserMemberships } = await supabase
      .from('organization_members')
      .select('role, created_at')
      .eq('user_id', userId);

    const currentUserRoles = currentUserMemberships?.map(m => m.role) || [];
    let currentUserRole = 'member';
    if (currentUserRoles.includes('owner')) currentUserRole = 'owner';
    else if (currentUserRoles.includes('admin')) currentUserRole = 'admin';

    const currentUserMemberSince = currentUserMemberships?.length > 0 
      ? currentUserMemberships[0].created_at 
      : currentUserProfile.created_at;

    let allUsers = [{
      ...currentUserProfile, 
      isPending: false, 
      role: currentUserRole,
      member_since: currentUserMemberSince,
      organizations: [],
      workspaces: []
    }];
    
    // Then get their organization memberships
    const { data: membershipData, error: membershipError } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userId);

    console.log('Organization memberships:', { membershipData, membershipError });

    if (membershipError) {
      console.error('Membership fetch error:', membershipError);
    } else if (membershipData && membershipData.length > 0) {
      // If user has organizations, get other users in those organizations
      const orgIds = membershipData.map(m => m.organization_id);
      console.log('Organization IDs:', orgIds);
      
      // Get all users in these organizations (excluding current user)
      const { data: orgUsersData, error: orgUsersError } = await supabase
        .from('organization_members')
        .select(`
          user_id, 
          role, 
          created_at,
          profiles(id, email, full_name, created_at, avatar_url, updated_at)
        `)
        .in('organization_id', orgIds)
        .neq('user_id', userId);

      console.log('Organization users data:', { orgUsersData, orgUsersError });

      if (!orgUsersError && orgUsersData) {
        // Add organization users with their roles and membership info
        for (const item of orgUsersData) {
          const userProfile = (item as any).profiles;
          if (userProfile) {
            // Get this user's organizations and workspaces
            const { data: userOrgMemberships } = await supabase
              .from('organization_members')
              .select(`
                organization_id, 
                role, 
                created_at,
                organizations!organization_members_organization_id_fkey(name)
              `)
              .eq('user_id', userProfile.id);

            const { data: userWorkspaceMemberships } = await supabase
              .from('workspace_members')
              .select(`
                workspace_id,
                role,
                created_at,
                workspaces!workspace_members_workspace_id_fkey(name)
              `)
              .eq('user_id', userProfile.id);

            const organizations = userOrgMemberships?.map(m => (m as any).organizations?.name).filter(Boolean) || [];
            const workspaces = userWorkspaceMemberships?.map(m => (m as any).workspaces?.name).filter(Boolean) || [];

            allUsers.push({
              ...userProfile, 
              isPending: false, 
              role: item.role,
              member_since: item.created_at,
              organizations,
              workspaces
            });
          }
        }
      }

      // Also fetch pending invitations for the organizations the user is part of
      const pendingUsers = await fetchPendingInvitationsForOrganizations(orgIds);
      allUsers = [...allUsers, ...pendingUsers];
    }

    // Update current user with their organization and workspace info
    if (allUsers.length > 0) {
      const { data: currentUserOrgMemberships } = await supabase
        .from('organization_members')
        .select(`
          organization_id, 
          role, 
          created_at,
          organizations!organization_members_organization_id_fkey(name)
        `)
        .eq('user_id', userId);

      const { data: currentUserWorkspaceMemberships } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          created_at,
          workspaces!workspace_members_workspace_id_fkey(name)
        `)
        .eq('user_id', userId);

      const currentUserOrganizations = currentUserOrgMemberships?.map(m => (m as any).organizations?.name).filter(Boolean) || [];
      const currentUserWorkspaces = currentUserWorkspaceMemberships?.map(m => (m as any).workspaces?.name).filter(Boolean) || [];

      allUsers[0].organizations = currentUserOrganizations;
      allUsers[0].workspaces = currentUserWorkspaces;
    }

    // Remove duplicates based on user ID/email and sort by creation date
    const uniqueUsers = allUsers
      .filter((user, index, arr) => 
        arr.findIndex(u => u.id === user.id || u.email === user.email) === index
      )
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    console.log('Final user list for regular user:', uniqueUsers);
    return uniqueUsers;
  };

  const fetchPendingInvitationsForOrganizations = async (orgIds: string[]) => {
    const { data: pendingInvitations, error: invitationsError } = await supabase
      .from('user_invitations')
      .select(`
        id,
        email,
        created_at,
        role,
        organization_id,
        workspace_id,
        organizations(name),
        workspaces(name)
      `)
      .in('organization_id', orgIds)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (invitationsError || !pendingInvitations) {
      return [];
    }

    // Convert pending invitations to user profile format
    return pendingInvitations.map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      full_name: `${invitation.email} (Uitnodiging pending)`,
      created_at: invitation.created_at,
      organizations: [(invitation as any).organizations?.name].filter(Boolean),
      workspaces: [(invitation as any).workspaces?.name].filter(Boolean),
      isPending: true,
      invitationId: invitation.id,
      role: invitation.role,
      avatar_url: null,
      updated_at: invitation.created_at,
      member_since: invitation.created_at
    }));
  };

  return {
    fetchUsersForAccountOwner,
    fetchPendingInvitations,
    fetchUsersForRegularUser
  };
};
