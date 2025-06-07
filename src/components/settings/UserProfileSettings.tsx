import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { UserProfileCard } from './UserProfileCard';
import { InviteUserDialog } from './InviteUserDialog';
import { EditUserDialog } from './EditUserDialog';
import { MyAccount } from '@/components/account/MyAccount';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  organizations?: string[];
  workspaces?: string[];
}

export const UserProfileSettings = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showMyAccount, setShowMyAccount] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchUserRole();
    }
  }, [user]);

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
        setUserRole('member'); // Default role if no membership found
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('member'); // Default to member on error
    }
  };

  const fetchUsers = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching users for user:', user.id);
      console.log('User email:', user.email);
      
      // Check if user is the account owner (Michael Schapkun)
      const isAccountOwner = user.email === 'info@schapkun.com';
      console.log('Is account owner:', isAccountOwner);
      
      if (isAccountOwner) {
        // If account owner, show ALL users in the entire system
        console.log('Fetching ALL users for account owner...');
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (usersError) {
          console.error('Users fetch error:', usersError);
          throw usersError;
        }

        console.log('All users data (account owner):', usersData);
        
        // For each user, get their organization memberships
        const usersWithOrgs = await Promise.all(
          (usersData || []).map(async (userProfile) => {
            const { data: orgMemberships } = await supabase
              .from('organization_members')
              .select('organization_id, organizations(name)')
              .eq('user_id', userProfile.id);

            const organizations = orgMemberships?.map(m => (m as any).organizations?.name).filter(Boolean) || [];

            return {
              ...userProfile,
              organizations
            };
          })
        );

        console.log('Users with organizations:', usersWithOrgs);
        setUsers(usersWithOrgs);
      } else {
        // For regular users, always include themselves first
        console.log('Fetching users for regular user...');
        console.log('Regular user ID:', user.id);
        console.log('Regular user email:', user.email);
        
        // First, get current user's profile
        const { data: currentUserProfile, error: currentUserError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Current user profile query result:', { currentUserProfile, currentUserError });

        if (currentUserError) {
          console.error('Current user profile fetch error:', currentUserError);
          // If we can't find the current user's profile, create it
          if (currentUserError.code === 'PGRST116') {
            console.log('Creating missing profile for user:', user.id);
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                full_name: user.email
              })
              .select()
              .single();
            
            if (createError) {
              console.error('Error creating profile:', createError);
              throw createError;
            }
            
            console.log('Created new profile:', newProfile);
            setUsers([newProfile]);
            return;
          } else {
            throw currentUserError;
          }
        }

        let allUsers = [currentUserProfile]; // Always include current user
        console.log('Starting with current user:', currentUserProfile);
        
        // Then get their organization memberships
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        console.log('Organization memberships:', { membershipData, membershipError });

        if (membershipError) {
          console.error('Membership fetch error:', membershipError);
          // Don't throw error here, just continue with current user only
          console.log('Continuing with current user only due to membership error');
        } else if (membershipData && membershipData.length > 0) {
          // If user has organizations, get other users in those organizations
          const orgIds = membershipData.map(m => m.organization_id);
          console.log('Organization IDs:', orgIds);
          
          // Get all users in these organizations (excluding current user)
          const { data: orgUsersData, error: orgUsersError } = await supabase
            .from('organization_members')
            .select('user_id, profiles(id, email, full_name, created_at)')
            .in('organization_id', orgIds)
            .neq('user_id', user.id); // Exclude current user to avoid duplicates

          console.log('Organization users data:', { orgUsersData, orgUsersError });

          if (orgUsersError) {
            console.error('Organization users fetch error:', orgUsersError);
            // Don't throw error here, just continue with current user only
            console.log('Continuing with current user only due to org users error');
          } else {
            // Add organization users
            orgUsersData?.forEach(item => {
              const userProfile = (item as any).profiles;
              if (userProfile) {
                allUsers.push(userProfile);
              }
            });
          }
        } else {
          console.log('No organization memberships found, showing only current user');
        }

        // Remove duplicates based on user ID
        const uniqueUsers = allUsers.filter((user, index, arr) => 
          arr.findIndex(u => u.id === user.id) === index
        );

        console.log('Final user list for regular user:', uniqueUsers);
        console.log('Number of users:', uniqueUsers.length);
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Kon gebruikers niet ophalen. Controleer je internetverbinding en probeer opnieuw.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async () => {
    if (!editingUser || !editingUser.email.trim() || !user?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          email: editingUser.email,
          full_name: editingUser.full_name
        })
        .eq('id', editingUser.id);

      if (error) throw error;

      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            action: 'Gebruiker bijgewerkt',
            details: { user_email: editingUser.email }
          });
      } catch (logError) {
        console.error('Failed to log user update:', logError);
      }

      toast({
        title: "Succes",
        description: "Gebruiker succesvol bijgewerkt",
      });

      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Weet je zeker dat je gebruiker "${userEmail}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Gebruiker succesvol verwijderd",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const inviteUser = async (inviteEmail: string) => {
    if (!inviteEmail.trim() || !user?.id) return;

    // For now, just show a success message
    // In a real implementation, you would send an invitation email
  };

  // Check if user can invite others (only admin, owner, and account owner)
  const canInviteUsers = userRole === 'admin' || userRole === 'owner' || user?.email === 'info@schapkun.com';

  const handleShowMyAccount = (userProfile: UserProfile) => {
    setShowMyAccount(true);
  };

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
          <Button onClick={fetchUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Opnieuw proberen
          </Button>
        </div>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-red-600 mb-3 text-sm">{error}</p>
            <Button onClick={fetchUsers} size="sm">
              Opnieuw laden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Gebruikersprofielen</h2>
        {canInviteUsers && (
          <InviteUserDialog
            isOpen={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
            onInvite={inviteUser}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 items-stretch">
        {users.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              {user?.email === 'info@schapkun.com' 
                ? 'Er zijn nog geen gebruikers geregistreerd.'
                : 'Er zijn nog geen gebruikers in je organisaties.'
              }
            </CardContent>
          </Card>
        ) : (
          users.map((userProfile) => (
            <UserProfileCard
              key={userProfile.id}
              userProfile={userProfile}
              currentUserEmail={user?.email}
              onEdit={setEditingUser}
              onDelete={deleteUser}
              onShowMyAccount={handleShowMyAccount}
            />
          ))
        )}
      </div>

      <EditUserDialog
        editingUser={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={updateUser}
        onUpdateUser={setEditingUser}
      />

      <Dialog open={showMyAccount} onOpenChange={setShowMyAccount}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <MyAccount />
        </DialogContent>
      </Dialog>
    </div>
  );
};
