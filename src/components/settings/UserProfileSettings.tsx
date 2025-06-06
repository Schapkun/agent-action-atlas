import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Edit, UserPlus } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  role?: string;
  organization_id?: string;
  organization_name?: string;
}

interface Organization {
  id: string;
  name: string;
}

export const UserProfileSettings = () => {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'member', organization_id: '' });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfiles();
    fetchOrganizations();
  }, []);

  const fetchUserProfiles = async () => {
    try {
      // Get organization members with organization info
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select(`
          role,
          organization_id,
          user_id,
          organizations!fk_organization_members_organization (
            name
          )
        `);

      if (membersError) throw membersError;

      // Get user profiles for the members
      const userIds = membersData?.map(m => m.user_id) || [];
      
      if (userIds.length === 0) {
        setUserProfiles([]);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, avatar_url, created_at')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const profiles = profilesData?.map(profile => {
        const memberData = membersData?.find(m => m.user_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name || '',
          email: profile.email || '',
          avatar_url: profile.avatar_url,
          created_at: profile.created_at || '',
          role: memberData?.role,
          organization_id: memberData?.organization_id,
          organization_name: memberData?.organizations?.name
        };
      }) || [];

      setUserProfiles(profiles);
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

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organizations!fk_organization_members_organization (
            id,
            name
          )
        `)
        .eq('user_id', user?.id)
        .in('role', ['admin', 'owner']);

      if (error) throw error;
      
      const orgs = data?.map(item => item.organizations).filter(Boolean) || [];
      setOrganizations(orgs as Organization[]);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const inviteUser = async () => {
    if (!newInvite.email.trim() || !newInvite.organization_id) return;

    try {
      const { error } = await supabase
        .from('user_invitations')
        .insert({
          email: newInvite.email,
          role: newInvite.role as 'owner' | 'admin' | 'member',
          organization_id: newInvite.organization_id,
          invited_by: user?.id
        });

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: newInvite.organization_id,
          action: 'Gebruiker uitgenodigd',
          details: { invited_email: newInvite.email, role: newInvite.role }
        });

      toast({
        title: "Succes",
        description: "Uitnodiging succesvol verzonden",
      });

      setNewInvite({ email: '', role: 'member', organization_id: '' });
      setIsInviteDialogOpen(false);
      fetchUserProfiles();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet verzenden",
        variant: "destructive",
      });
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

  if (loading) {
    return <div>Gebruikersprofielen laden...</div>;
  }

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
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Rol</Label>
                <Select
                  value={newInvite.role}
                  onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}
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
                <Label htmlFor="invite-org">Organisatie</Label>
                <Select
                  value={newInvite.organization_id}
                  onValueChange={(value) => setNewInvite({ ...newInvite, organization_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer organisatie" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={inviteUser}>
                  Uitnodigen
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {userProfiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{profile.full_name || 'Geen naam'}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {profile.email} • Rol: {profile.role} • Organisatie: {profile.organization_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aangemaakt: {new Date(profile.created_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProfile(profile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
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
