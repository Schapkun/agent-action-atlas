import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Edit, RefreshCw, UserPlus } from 'lucide-react';

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
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

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
          .from('user_profiles')
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
        // For regular users, show only users in their organizations
        console.log('Fetching users for regular user...');
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Membership fetch error:', membershipError);
          throw membershipError;
        }

        if (!membershipData || membershipData.length === 0) {
          console.log('No memberships found');
          setUsers([]);
          setLoading(false);
          return;
        }

        const orgIds = membershipData.map(m => m.organization_id);
        
        // Get all users in these organizations
        const { data: orgUsersData, error: orgUsersError } = await supabase
          .from('organization_members')
          .select('user_id, user_profiles(id, email, full_name, created_at)')
          .in('organization_id', orgIds);

        if (orgUsersError) {
          console.error('Organization users fetch error:', orgUsersError);
          throw orgUsersError;
        }

        // Deduplicate users and format data
        const uniqueUsers = new Map();
        orgUsersData?.forEach(item => {
          const userProfile = (item as any).user_profiles;
          if (userProfile && !uniqueUsers.has(userProfile.id)) {
            uniqueUsers.set(userProfile.id, userProfile);
          }
        });

        setUsers(Array.from(uniqueUsers.values()));
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
        .from('user_profiles')
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
        .from('user_profiles')
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

  const inviteUser = async () => {
    if (!inviteEmail.trim() || !user?.id) return;

    try {
      // For now, just show a success message
      // In a real implementation, you would send an invitation email
      toast({
        title: "Uitnodiging verzonden",
        description: `Uitnodiging verzonden naar ${inviteEmail}`,
      });

      setInviteEmail('');
      setIsInviteDialogOpen(false);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet verzenden",
        variant: "destructive",
      });
    }
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
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Gebruiker Uitnodigen
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Gebruiker Uitnodigen</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="invite-email" className="text-sm">E-mailadres</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Voer e-mailadres in"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsInviteDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button size="sm" onClick={inviteUser}>
                  Uitnodigen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
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
            <Card key={userProfile.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">
                      {userProfile.full_name || 'Niet ingesteld'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Organisaties: {userProfile.organizations?.length 
                        ? userProfile.organizations.join(', ')
                        : user?.email === 'info@schapkun.com' ? 'Geen organisaties' : '-'
                      } • Aangemaakt: {new Date(userProfile.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {user?.email === 'info@schapkun.com' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(userProfile)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteUser(userProfile.id, userProfile.email)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Gebruiker Bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-user-email" className="text-sm">E-mailadres</Label>
                <Input
                  id="edit-user-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="edit-user-name" className="text-sm">Volledige Naam</Label>
                <Input
                  id="edit-user-name"
                  value={editingUser.full_name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  placeholder="Voer volledige naam in"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                  Annuleren
                </Button>
                <Button size="sm" onClick={updateUser}>
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
