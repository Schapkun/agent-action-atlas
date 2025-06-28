
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';
import { MyAccount } from '@/components/account/MyAccount';
import { UserFilters } from './UserFilters';
import { UserList } from './UserList';
import { UserManagement } from './UserManagement';
import { InviteUserDialog } from './InviteUserDialog';

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

export const UserProfileSettings = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMyAccount, setShowMyAccount] = useState(false);
  const [viewingUserProfile, setViewingUserProfile] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const userManagement = UserManagement({
    onUsersUpdate: (newUsers) => {
      setUsers(newUsers);
      setLoading(false);
    },
    onUserRoleUpdate: setUserRole
  });

  const handleShowMyAccount = (userProfile: UserProfile) => {
    setViewingUserProfile(userProfile);
    setShowMyAccount(true);
  };

  const handleInviteUser = async (email: string) => {
    // Refresh the users list after invitation
    await userManagement.fetchUsers();
  };

  const handleResendInvitation = async (userProfile: UserProfile) => {
    if (!userProfile.isPending || !userProfile.invitationId) {
      toast({
        title: "Error",
        description: "Kan alleen uitnodigingen opnieuw sturen voor pending gebruikers",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Resending invitation for:', userProfile.email);

      // Get the invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('id', userProfile.invitationId)
        .single();

      if (invitationError || !invitation) {
        throw new Error('Uitnodiging niet gevonden');
      }

      // Get organization details for the email
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', invitation.organization_id)
        .single();

      const { data: inviterData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user?.id)
        .single();

      // Send invitation email using the edge function
      console.log('Calling send-invitation-email edge function for resend...');
      
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: invitation.email,
          organization_name: orgData?.name || 'Onbekende Organisatie',
          role: invitation.role === 'owner' ? 'eigenaar' : invitation.role === 'admin' ? 'admin' : 'gebruiker',
          invited_by_name: inviterData?.full_name || inviterData?.email || 'Onbekend',
          signup_url: window.location.origin + '/register'
        }
      });

      if (emailError) {
        console.error('Error resending invitation email:', emailError);
        toast({
          title: "Error",
          description: "Kon uitnodiging niet opnieuw sturen. Probeer opnieuw.",
          variant: "destructive",
        });
      } else {
        console.log('Invitation email resent successfully:', emailResponse);
        toast({
          title: "Uitnodiging opnieuw verzonden",
          description: `Uitnodiging succesvol opnieuw verzonden naar ${userProfile.email}`,
        });

        // Log the resend action
        await supabase
          .from('history_logs')
          .insert({
            user_id: user?.id,
            organization_id: invitation.organization_id,
            workspace_id: invitation.workspace_id,
            action: 'Uitnodiging opnieuw verzonden',
            details: {
              email: userProfile.email,
              role: invitation.role,
              invitation_id: invitation.id
            }
          });
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet opnieuw sturen. Probeer opnieuw.",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(userProfile => {
    const matchesSearch = userProfile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userProfile.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRoleForFilter = userProfile.role || 'member';
    const matchesFilter = filterRole === 'all' || 
      (filterRole === 'eigenaar' && (userRoleForFilter === 'eigenaar' || userRoleForFilter === 'owner')) ||
      (filterRole === 'admin' && userRoleForFilter === 'admin') ||
      (filterRole === 'gebruiker' && userRoleForFilter === 'member');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gebruikersprofielen</h2>
          <Button onClick={userManagement.fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Opnieuw proberen
          </Button>
        </div>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-red-600 mb-3 text-sm">{error}</p>
            <Button onClick={userManagement.fetchUsers} size="sm">
              Opnieuw laden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <UserFilters
        users={users}
        onUsersUpdate={setUsers}
        onUserRoleUpdate={setUserRole}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterRole={filterRole}
        setFilterRole={setFilterRole}
        onInviteUser={() => setIsInviteDialogOpen(true)}
        userRole={userRole || 'member'}
      />

      <UserList
        users={filteredUsers}
        currentUserEmail={user?.email}
        onEdit={handleShowMyAccount}
        onDelete={userManagement.deleteUser}
        onShowMyAccount={handleShowMyAccount}
        onResendInvitation={handleResendInvitation}
      />

      <InviteUserDialog
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInvite={handleInviteUser}
      />

      <Dialog open={showMyAccount} onOpenChange={(open) => {
        setShowMyAccount(open);
        if (!open) {
          setViewingUserProfile(null);
        }
      }}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
          <div className="flex-1 overflow-hidden p-6">
            {viewingUserProfile && (
              <MyAccount 
                viewingUserId={viewingUserProfile.id}
                isEditingOtherUser={user?.email !== viewingUserProfile.email}
                onClose={() => setShowMyAccount(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
