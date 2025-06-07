import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Edit, UserPlus, Building2, Users, ChevronDown, ChevronRight, Mail, Clock, X, Check } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  role?: string;
  organization_id?: string;
  organization_name?: string;
  organizations?: {
    id: string;
    name: string;
    workspaces: {
      id: string;
      name: string;
      role: string;
    }[];
  }[];
}

interface InvitedUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  organization_id: string;
  organization_name: string;
  workspace_id?: string;
  workspace_name?: string;
  invited_by_name?: string;
}

interface Organization {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
  organization_id: string;
}

export const UserProfileSettings = () => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [newInvite, setNewInvite] = useState({ 
    email: '', 
    role: 'member', 
    organization_ids: [] as string[], 
    workspace_ids: [] as string[] 
  });
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [isInviting, setIsInviting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserProfiles();
      fetchInvitedUsers();
      fetchOrganizations();
      fetchWorkspaces();
    }
  }, [user]);

  const toggleUserExpanded = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const fetchUserProfiles = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching user profiles');

      const isAccountOwner = user.email === 'info@schapkun.com';

      if (isAccountOwner) {
        // Account owner sees ALL users and their memberships
        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, avatar_url, created_at')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Profiles error:', profilesError);
          throw profilesError;
        }

        // Get all workspace memberships for all users
        const { data: workspaceMemberships, error: workspaceError } = await supabase
          .from('workspace_members')
          .select(`
            user_id,
            role,
            workspace_id,
            workspaces!workspace_members_workspace_id_fkey (
              id,
              name,
              organization_id,
              organizations!workspaces_organization_id_fkey (
                id,
                name
              )
            )
          `);

        if (workspaceError) {
          console.error('Workspace memberships error:', workspaceError);
          throw workspaceError;
        }

        // Process the profiles and group workspaces by organization
        const profilesWithMemberships = profilesData?.map(profile => {
          const userWorkspaces = workspaceMemberships
            ?.filter(wm => wm.user_id === profile.id)
            ?.map(wm => ({
              id: wm.workspace_id,
              name: wm.workspaces?.name || 'Onbekend',
              role: wm.role,
              organization_id: wm.workspaces?.organization_id,
              organization_name: wm.workspaces?.organizations?.name || 'Onbekend'
            })) || [];

          // Group workspaces by organization
          const organizationsMap = new Map();
          userWorkspaces.forEach(workspace => {
            const orgId = workspace.organization_id;
            const orgName = workspace.organization_name;
            
            if (!organizationsMap.has(orgId)) {
              organizationsMap.set(orgId, {
                id: orgId,
                name: orgName,
                workspaces: []
              });
            }
            
            organizationsMap.get(orgId).workspaces.push({
              id: workspace.id,
              name: workspace.name,
              role: workspace.role
            });
          });

          const organizations = Array.from(organizationsMap.values());

          return {
            id: profile.id,
            full_name: profile.full_name || 'Geen naam',
            email: profile.email || '',
            avatar_url: profile.avatar_url,
            created_at: profile.created_at || '',
            organizations: organizations
          };
        }) || [];

        setUserProfiles(profilesWithMemberships);
      } else {
        // Regular users see only users from their organizations
        const { data: membershipData, error: membershipError } = await supabase
          .from('workspace_members')
          .select('role, workspace_id, user_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Membership error:', membershipError);
          throw membershipError;
        }

        if (!membershipData || membershipData.length === 0) {
          setUserProfiles([]);
          setLoading(false);
          return;
        }

        // Get workspaces and organizations
        const workspaceIds = membershipData.map(m => m.workspace_id);
        const { data: workspaceData, error: workspaceDataError } = await supabase
          .from('workspaces')
          .select('id, name, organization_id')
          .in('id', workspaceIds);

        if (workspaceDataError) throw workspaceDataError;

        const orgIds = [...new Set(workspaceData?.map(w => w.organization_id) || [])];
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds);

        if (orgError) throw orgError;

        // Get all workspace members from user's organizations
        const { data: allWorkspaceMembers, error: allMembersError } = await supabase
          .from('workspace_members')
          .select('user_id, role, workspace_id')
          .in('workspace_id', workspaceIds);

        if (allMembersError) throw allMembersError;

        // Get unique user IDs
        const userIds = [...new Set(allWorkspaceMembers?.map(m => m.user_id) || [])];
        
        if (userIds.length === 0) {
          setUserProfiles([]);
          setLoading(false);
          return;
        }

        const { data: profilesData, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, full_name, email, avatar_url, created_at')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Process profiles with membership info grouped by organization
        const profilesWithMemberships = profilesData?.map(profile => {
          const userWorkspaces = allWorkspaceMembers
            ?.filter(wm => wm.user_id === profile.id)
            ?.map(wm => {
              const workspace = workspaceData?.find(w => w.id === wm.workspace_id);
              const organization = orgData?.find(o => o.id === workspace?.organization_id);
              return {
                id: wm.workspace_id,
                name: workspace?.name || 'Onbekend',
                role: wm.role,
                organization_id: workspace?.organization_id,
                organization_name: organization?.name || 'Onbekend'
              };
            }) || [];

          // Group workspaces by organization
          const organizationsMap = new Map();
          userWorkspaces.forEach(workspace => {
            const orgId = workspace.organization_id;
            const orgName = workspace.organization_name;
            
            if (!organizationsMap.has(orgId)) {
              organizationsMap.set(orgId, {
                id: orgId,
                name: orgName,
                workspaces: []
              });
            }
            
            organizationsMap.get(orgId).workspaces.push({
              id: workspace.id,
              name: workspace.name,
              role: workspace.role
            });
          });

          const organizations = Array.from(organizationsMap.values());

          return {
            id: profile.id,
            full_name: profile.full_name || 'Geen naam',
            email: profile.email || '',
            avatar_url: profile.avatar_url,
            created_at: profile.created_at || '',
            organizations: organizations
          };
        }) || [];

        setUserProfiles(profilesWithMemberships);
      }
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      toast({
        title: "Error",
        description: "Kon gebruikersprofielen niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitedUsers = async () => {
    if (!user?.id) return;

    try {
      console.log('Fetching invited users for user:', user.email);

      const isAccountOwner = user.email === 'info@schapkun.com';

      if (isAccountOwner) {
        console.log('User is account owner, fetching all invitations');
        
        // Account owner sees all invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('user_invitations')
          .select('id, email, role, created_at, expires_at, organization_id, workspace_id, invited_by')
          .is('accepted_at', null)
          .order('created_at', { ascending: false });

        if (invitationsError) {
          console.error('Invitations error:', invitationsError);
          setInvitedUsers([]);
          return;
        }

        console.log('Found invitations:', invitationsData?.length || 0);

        if (!invitationsData || invitationsData.length === 0) {
          setInvitedUsers([]);
          return;
        }

        // Get organization names separately
        const orgIds = [...new Set(invitationsData.map(inv => inv.organization_id).filter(Boolean))];
        let organizationsData: any[] = [];
        
        if (orgIds.length > 0) {
          const { data: orgsData, error: orgsError } = await supabase
            .from('organizations')
            .select('id, name')
            .in('id', orgIds);

          if (!orgsError && orgsData) {
            organizationsData = orgsData;
          }
        }

        // Get workspace names separately
        const workspaceIds = [...new Set(invitationsData.map(inv => inv.workspace_id).filter(Boolean))];
        let workspacesData: any[] = [];
        
        if (workspaceIds.length > 0) {
          const { data: wsData, error: wsError } = await supabase
            .from('workspaces')
            .select('id, name')
            .in('id', workspaceIds);

          if (!wsError && wsData) {
            workspacesData = wsData;
          }
        }

        // Get invited_by user names from user_profiles (not auth.users)
        const invitedByIds = [...new Set(invitationsData.map(inv => inv.invited_by).filter(Boolean))];
        let invitedByProfiles: any[] = [];
        
        if (invitedByIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', invitedByIds);

          if (!profilesError && profilesData) {
            invitedByProfiles = profilesData;
          }
        }

        const processedInvitations = invitationsData.map(invitation => {
          const organization = organizationsData.find(o => o.id === invitation.organization_id);
          const workspace = workspacesData.find(w => w.id === invitation.workspace_id);
          const inviterProfile = invitedByProfiles.find(p => p.id === invitation.invited_by);
          
          return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            created_at: invitation.created_at,
            expires_at: invitation.expires_at,
            organization_id: invitation.organization_id,
            organization_name: organization?.name || 'Onbekend',
            workspace_id: invitation.workspace_id,
            workspace_name: workspace?.name,
            invited_by_name: inviterProfile?.full_name || 'Onbekend'
          };
        });

        setInvitedUsers(processedInvitations);
      } else {
        console.log('Regular user, fetching organization-based invitations');
        
        // Regular users see invitations from their organizations - this should now work with the RLS policy
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('user_invitations')
          .select('id, email, role, created_at, expires_at, organization_id, workspace_id, invited_by')
          .is('accepted_at', null)
          .order('created_at', { ascending: false });

        if (invitationsError) {
          console.error('Invitations error:', invitationsError);
          setInvitedUsers([]);
          return;
        }

        if (!invitationsData || invitationsData.length === 0) {
          setInvitedUsers([]);
          return;
        }

        // Get organization names
        const orgIds = [...new Set(invitationsData.map(inv => inv.organization_id).filter(Boolean))];
        const { data: orgsData } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds);

        // Get workspace names
        const workspaceIds = [...new Set(invitationsData.map(inv => inv.workspace_id).filter(Boolean))];
        const { data: workspacesData } = await supabase
          .from('workspaces')
          .select('id, name')
          .in('id', workspaceIds);

        // Get invited_by user names from user_profiles
        const invitedByIds = [...new Set(invitationsData.map(inv => inv.invited_by).filter(Boolean))];
        let invitedByProfiles: any[] = [];
        
        if (invitedByIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('user_profiles')
            .select('id, full_name')
            .in('id', invitedByIds);

          if (!profilesError && profilesData) {
            invitedByProfiles = profilesData;
          }
        }

        const processedInvitations = invitationsData.map(invitation => {
          const organization = orgsData?.find(o => o.id === invitation.organization_id);
          const workspace = workspacesData?.find(w => w.id === invitation.workspace_id);
          const inviterProfile = invitedByProfiles.find(p => p.id === invitation.invited_by);
          
          return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            created_at: invitation.created_at,
            expires_at: invitation.expires_at,
            organization_id: invitation.organization_id,
            organization_name: organization?.name || 'Onbekend',
            workspace_id: invitation.workspace_id,
            workspace_name: workspace?.name,
            invited_by_name: inviterProfile?.full_name || 'Onbekend'
          };
        });

        setInvitedUsers(processedInvitations);
      }
    } catch (error) {
      console.error('Unexpected error fetching invited users:', error);
      setInvitedUsers([]);
      
      toast({
        title: "Waarschuwing",
        description: "Uitgenodigde gebruikers konden niet worden geladen. Andere functies werken nog wel.",
        variant: "destructive",
      });
    }
  };

  const fetchOrganizations = async () => {
    if (!user?.id) return;

    try {
      // Check if user is the account owner (Michael Schapkun)
      const isAccountOwner = user.email === 'info@schapkun.com';
      
      if (isAccountOwner) {
        // If account owner, show ALL organizations
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .order('name', { ascending: true });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          return;
        }

        setOrganizations(orgData || []);
      } else {
        // For regular users, get organizations through membership
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Organization membership error:', membershipError);
          return;
        }

        if (!membershipData || membershipData.length === 0) {
          setOrganizations([]);
          return;
        }

        const orgIds = membershipData.map(m => m.organization_id);
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds)
          .order('name', { ascending: true });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          return;
        }

        setOrganizations(orgData || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchWorkspaces = async () => {
    if (!user?.id) return;

    try {
      const isAccountOwner = user.email === 'info@schapkun.com';
      
      if (isAccountOwner) {
        // If account owner, show ALL workspaces
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id, name, organization_id')
          .order('name', { ascending: true });

        if (workspaceError) {
          console.error('Workspaces fetch error:', workspaceError);
          return;
        }

        setWorkspaces(workspaceData || []);
      } else {
        // For regular users, get workspaces through membership
        const { data: membershipData, error: membershipError } = await supabase
          .from('workspace_members')
          .select('workspace_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Workspace membership error:', membershipError);
          return;
        }

        if (!membershipData || membershipData.length === 0) {
          setWorkspaces([]);
          return;
        }

        const workspaceIds = membershipData.map(m => m.workspace_id);
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id, name, organization_id')
          .in('id', workspaceIds)
          .order('name', { ascending: true });

        if (workspaceError) {
          console.error('Workspaces fetch error:', workspaceError);
          return;
        }

        setWorkspaces(workspaceData || []);
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const inviteUser = async () => {
    if (!newInvite.email.trim() || newInvite.organization_ids.length === 0 || isInviting) return;

    setIsInviting(true);
    try {
      console.log('Starting invitation process for:', newInvite.email);
      
      // Create invitations for each selected organization
      for (const orgId of newInvite.organization_ids) {
        const { data: invitationData, error: inviteError } = await supabase
          .from('user_invitations')
          .insert({
            email: newInvite.email,
            role: newInvite.role as 'owner' | 'admin' | 'member',
            organization_id: orgId,
            invited_by: user?.id
          })
          .select()
          .single();

        if (inviteError) throw inviteError;

        console.log('Invitation created in database:', invitationData);
      }

      // Get organization names for the email
      const selectedOrgs = organizations.filter(org => newInvite.organization_ids.includes(org.id));
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const signupUrl = `${window.location.origin}/register?email=${encodeURIComponent(newInvite.email)}`;
      
      console.log('Sending invitation email to:', newInvite.email);
      
      try {
        const { error: emailError } = await supabase.functions.invoke('send-invitation-email', {
          body: {
            email: newInvite.email,
            organization_name: selectedOrgs.map(org => org.name).join(', '),
            role: newInvite.role,
            invited_by_name: userProfile?.full_name || 'Onbekend',
            signup_url: signupUrl
          }
        });

        if (emailError) {
          console.error('Email error:', emailError);
          toast({
            title: "Uitnodiging aangemaakt",
            description: "Uitnodiging is opgeslagen, maar email kon niet worden verzonden",
            variant: "destructive",
          });
        } else {
          console.log('Email sent successfully');
          toast({
            title: "Succes",
            description: "Uitnodiging succesvol verzonden en email verstuurd",
          });
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "Uitnodiging aangemaakt", 
          description: "Uitnodiging is opgeslagen, maar email kon niet worden verzonden",
          variant: "destructive",
        });
      }

      // Log the invitation
      for (const orgId of newInvite.organization_ids) {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user?.id,
            organization_id: orgId,
            action: 'Gebruiker uitgenodigd',
            details: { invited_email: newInvite.email, role: newInvite.role }
          });
      }

      setNewInvite({ email: '', role: 'member', organization_ids: [], workspace_ids: [] });
      setIsInviteDialogOpen(false);
      fetchInvitedUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet verzenden",
        variant: "destructive",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const updateUserProfile = async () => {
    if (!editingProfile) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: editingProfile.full_name,
          email: editingProfile.email
        })
        .eq('id', editingProfile.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: editingProfile.organization_id,
          action: 'Gebruikersprofiel bijgewerkt',
          details: { profile_id: editingProfile.id, profile_name: editingProfile.full_name }
        });

      toast({
        title: "Succes",
        description: "Gebruikersprofiel succesvol bijgewerkt",
      });

      setEditingProfile(null);
      fetchUserProfiles();
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: "Error",
        description: "Kon gebruikersprofiel niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', invitationId);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          action: 'Uitnodiging geannuleerd',
          details: { invitation_id: invitationId }
        });

      toast({
        title: "Succes",
        description: "Uitnodiging succesvol geannuleerd",
      });

      fetchInvitedUsers();
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet annuleren",
        variant: "destructive",
      });
    }
  };

  const getSelectedOrganizationNames = () => {
    const selected = organizations.filter(org => newInvite.organization_ids.includes(org.id));
    if (selected.length === 0) return "Selecteer organisaties";
    if (selected.length === 1) return selected[0].name;
    return `${selected.length} organisaties geselecteerd`;
  };

  const getSelectedWorkspaceNames = () => {
    const selected = workspaces.filter(ws => newInvite.workspace_ids.includes(ws.id));
    if (selected.length === 0) return "Selecteer werkruimtes";
    if (selected.length === 1) return selected[0].name;
    return `${selected.length} werkruimtes geselecteerd`;
  };

  const toggleOrganizationSelection = (orgId: string) => {
    setNewInvite(prev => ({
      ...prev,
      organization_ids: prev.organization_ids.includes(orgId)
        ? prev.organization_ids.filter(id => id !== orgId)
        : [...prev.organization_ids, orgId]
    }));
  };

  const toggleWorkspaceSelection = (workspaceId: string) => {
    setNewInvite(prev => ({
      ...prev,
      workspace_ids: prev.workspace_ids.includes(workspaceId)
        ? prev.workspace_ids.filter(id => id !== workspaceId)
        : [...prev.workspace_ids, workspaceId]
    }));
  };

  if (loading) {
    return <div>Gebruikersprofielen laden...</div>;
  }

  // Combine and sort users (profiles + invitations)
  const allUsers = [
    ...userProfiles.map(profile => ({ ...profile, type: 'user' as const })),
    ...invitedUsers.map(invite => ({ 
      ...invite, 
      type: 'invited' as const,
      full_name: invite.email,
      id: `invited-${invite.id}`
    }))
  ].sort((a, b) => {
    // Sort by type first (users before invited), then by name/email
    if (a.type !== b.type) {
      return a.type === 'user' ? -1 : 1;
    }
    return (a.full_name || a.email).localeCompare(b.full_name || b.email);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gebruikersprofielen</h2>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Gebruiker Uitnodigen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Gebruiker Uitnodigen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">E-mailadres</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={newInvite.email}
                  onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                  placeholder="Voer e-mailadres in"
                  disabled={isInviting}
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Rol</Label>
                <Select
                  value={newInvite.role}
                  onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}
                  disabled={isInviting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Lid</SelectItem>
                    <SelectItem value="admin">Beheerder</SelectItem>
                    <SelectItem value="owner">Eigenaar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Organisaties</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between" disabled={isInviting}>
                      {getSelectedOrganizationNames()}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
                    <div className="p-2 space-y-2">
                      {organizations.map((org) => (
                        <div key={org.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`org-${org.id}`}
                            checked={newInvite.organization_ids.includes(org.id)}
                            onCheckedChange={() => toggleOrganizationSelection(org.id)}
                          />
                          <Label htmlFor={`org-${org.id}`} className="text-sm font-normal cursor-pointer">
                            {org.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <Label>Werkruimtes (optioneel)</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between" disabled={isInviting}>
                      {getSelectedWorkspaceNames()}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full min-w-[var(--radix-dropdown-menu-trigger-width)]">
                    <div className="p-2 space-y-2">
                      {workspaces.map((workspace) => (
                        <div key={workspace.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`ws-${workspace.id}`}
                            checked={newInvite.workspace_ids.includes(workspace.id)}
                            onCheckedChange={() => toggleWorkspaceSelection(workspace.id)}
                          />
                          <Label htmlFor={`ws-${workspace.id}`} className="text-sm font-normal cursor-pointer">
                            {workspace.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsInviteDialogOpen(false)}
                  disabled={isInviting}
                >
                  Annuleren
                </Button>
                <Button 
                  onClick={inviteUser}
                  disabled={isInviting || !newInvite.email.trim() || newInvite.organization_ids.length === 0}
                >
                  {isInviting ? 'Bezig...' : 'Uitnodigen'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {allUsers.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Geen gebruikersprofielen gevonden.
            </CardContent>
          </Card>
        ) : (
          allUsers.map((profile) => (
            <Card key={profile.id} className={`border-l-4 ${profile.type === 'invited' ? 'border-l-yellow-400' : 'border-l-primary/20'}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl flex items-center gap-2">
                        {profile.type === 'invited' ? (
                          <>
                            <Mail className="h-4 w-4 text-yellow-600" />
                            {profile.email}
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Uitgenodigd</span>
                          </>
                        ) : (
                          <>
                            {profile.full_name}
                            {profile.id === user?.id && (
                              <span className="text-xs text-muted-foreground">(jij)</span>
                            )}
                          </>
                        )}
                      </CardTitle>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {profile.type === 'invited' ? (
                        <span className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Uitgenodigd op {new Date(profile.created_at).toLocaleDateString('nl-NL')}
                          {profile.expires_at && (
                            <span className="text-xs">
                              • Verloopt op {new Date(profile.expires_at).toLocaleDateString('nl-NL')}
                            </span>
                          )}
                        </span>
                      ) : (
                        profile.email
                      )}
                    </p>
                    
                    {profile.type === 'user' && profile.organizations && profile.organizations.length > 0 && (
                      <Collapsible 
                        open={expandedUsers.has(profile.id)} 
                        onOpenChange={() => toggleUserExpanded(profile.id)}
                      >
                        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:underline">
                          {expandedUsers.has(profile.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          {profile.organizations.length} organisatie{profile.organizations.length !== 1 ? 's' : ''}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-4 mt-4">
                          {profile.organizations.map((organization, orgIndex) => (
                            <div key={orgIndex} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-base">{organization.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({organization.workspaces.length} werkruimte{organization.workspaces.length !== 1 ? 's' : ''})
                                </span>
                              </div>
                              
                              {organization.workspaces.length > 0 && (
                                <div className="ml-6">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="text-xs">Werkruimte</TableHead>
                                        <TableHead className="text-xs">Rol</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {organization.workspaces.map((workspace) => (
                                        <TableRow key={workspace.id}>
                                          <TableCell className="py-2">
                                            <div className="flex items-center gap-2">
                                              <Users className="h-3 w-3 text-muted-foreground" />
                                              <span className="text-sm">{workspace.name}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="py-2">
                                            <span className="text-xs bg-muted px-2 py-1 rounded">
                                              {workspace.role}
                                            </span>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {profile.type === 'invited' && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="font-medium">Organisatie:</span> {profile.organization_name}
                        </p>
                        {profile.workspace_name && (
                          <p className="text-sm">
                            <span className="font-medium">Werkruimte:</span> {profile.workspace_name}
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="font-medium">Rol:</span> {profile.role}
                        </p>
                        {profile.invited_by_name && (
                          <p className="text-sm">
                            <span className="font-medium">Uitgenodigd door:</span> {profile.invited_by_name}
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-4">
                      {profile.type === 'invited' ? 'Uitgenodigd' : 'Aangemaakt'}: {new Date(profile.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {profile.type === 'user' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingProfile(profile)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {profile.type === 'invited' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteInvitation(profile.id.replace('invited-', ''))}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {editingProfile && (
        <Dialog open={!!editingProfile} onOpenChange={() => setEditingProfile(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gebruikersprofiel Bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Volledige Naam</Label>
                <Input
                  id="edit-name"
                  value={editingProfile.full_name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">E-mailadres</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingProfile.email}
                  onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingProfile(null)}>
                  Annuleren
                </Button>
                <Button onClick={updateUserProfile}>
                  Opslaan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
