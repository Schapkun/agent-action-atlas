
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Edit, Save, X, Shield, AlertCircle } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_role?: string;
}

export const ProfileManagement = () => {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');
  const [editingProfile, setEditingProfile] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchUserRole = async () => {
    if (!user || !currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      setCurrentUserRole(data.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchProfiles = async () => {
    if (!currentOrganization || !user) return;

    try {
      // Get organization members with their roles
      const { data: members, error: membersError } = await supabase
        .from('organization_members')
        .select('user_id, role')
        .eq('organization_id', currentOrganization.id);

      if (membersError) {
        console.error('Error fetching members:', membersError);
        return;
      }

      // Get profiles for these users
      const userIds = members?.map(m => m.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      // Combine profile data with roles
      const combinedProfiles = profilesData?.map(profile => {
        const member = members?.find(m => m.user_id === profile.id);
        return {
          ...profile,
          role: member?.role || 'member',
          organization_role: member?.role
        };
      }) || [];

      setProfiles(combinedProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const startEdit = (profile: UserProfile) => {
    setEditingProfile(profile.id);
    setEditName(profile.full_name);
    setEditEmail(profile.email);
  };

  const cancelEdit = () => {
    setEditingProfile(null);
    setEditName('');
    setEditEmail('');
  };

  const saveProfile = async (profileId: string) => {
    if (!editName.trim() || !editEmail.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: editName,
          email: editEmail
        })
        .eq('id', profileId);

      if (error) throw error;

      toast({
        title: "Profiel bijgewerkt",
        description: "Het gebruikersprofiel is succesvol bijgewerkt.",
      });

      cancelEdit();
      fetchProfiles();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Kon profiel niet bijwerken: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (profileId: string, newRole: string) => {
    if (!currentOrganization) return;

    // Check permissions
    if (currentUserRole === 'member') {
      toast({
        title: "Geen toegang",
        description: "Je hebt geen rechten om rollen te wijzigen.",
        variant: "destructive",
      });
      return;
    }

    const targetProfile = profiles.find(p => p.id === profileId);
    if (targetProfile?.role === 'owner' && currentUserRole !== 'owner') {
      toast({
        title: "Geen toegang",
        description: "Alleen eigenaren kunnen andere eigenaren wijzigen.",
        variant: "destructive",
      });
      return;
    }

    if (newRole === 'owner' && currentUserRole !== 'owner') {
      toast({
        title: "Geen toegang",
        description: "Alleen eigenaren kunnen andere gebruikers tot eigenaar maken.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', profileId);

      if (error) throw error;

      toast({
        title: "Rol bijgewerkt",
        description: "De gebruikersrol is succesvol bijgewerkt.",
      });

      fetchProfiles();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Kon rol niet bijwerken: " + error.message,
        variant: "destructive",
      });
    }
  };

  const deleteProfile = async (profileId: string) => {
    if (!currentOrganization) return;

    // Check permissions
    if (currentUserRole === 'member') {
      toast({
        title: "Geen toegang",
        description: "Je hebt geen rechten om gebruikers te verwijderen.",
        variant: "destructive",
      });
      return;
    }

    const targetProfile = profiles.find(p => p.id === profileId);
    if (targetProfile?.role === 'owner' && currentUserRole !== 'owner') {
      toast({
        title: "Geen toegang",
        description: "Alleen eigenaren kunnen andere eigenaren verwijderen.",
        variant: "destructive",
      });
      return;
    }

    if (profileId === user?.id) {
      toast({
        title: "Actie niet toegestaan",
        description: "Je kunt jezelf niet verwijderen.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', currentOrganization.id)
        .eq('user_id', profileId);

      if (error) throw error;

      toast({
        title: "Gebruiker verwijderd",
        description: "De gebruiker is succesvol verwijderd uit de organisatie.",
      });

      fetchProfiles();
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet verwijderen: " + error.message,
        variant: "destructive",
      });
    }
  };

  const canEdit = (profile: UserProfile) => {
    if (profile.id === user?.id) return true; // Can always edit own profile
    if (currentUserRole === 'member') return false;
    if (profile.role === 'owner' && currentUserRole !== 'owner') return false;
    return true;
  };

  const canDelete = (profile: UserProfile) => {
    if (profile.id === user?.id) return false; // Cannot delete yourself
    if (currentUserRole === 'member') return false;
    if (profile.role === 'owner' && currentUserRole !== 'owner') return false;
    return true;
  };

  const canChangeRole = (profile: UserProfile) => {
    if (profile.id === user?.id) return false; // Cannot change own role
    if (currentUserRole === 'member') return false;
    if (profile.role === 'owner' && currentUserRole !== 'owner') return false;
    return true;
  };

  useEffect(() => {
    if (currentOrganization && user) {
      fetchUserRole();
      fetchProfiles();
    }
  }, [currentOrganization, user]);

  // Only show for admin and owner
  if (currentUserRole === 'member') {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center p-6">
            <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">
              Je hebt geen toegang tot gebruikersprofielen. Alleen admins en eigenaren kunnen deze sectie bekijken.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center p-6">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Selecteer eerst een organisatie om gebruikersprofielen te beheren</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Gebruikersprofielen
          </CardTitle>
          <CardDescription>
            Beheer gebruikersprofielen en rechten binnen {currentOrganization?.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {profiles.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2" />
                <p>Nog geen gebruikersprofielen gevonden</p>
              </div>
            ) : (
              profiles.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      {editingProfile === profile.id ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="Volledige naam"
                              className="flex-1"
                            />
                            <Input
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="Email adres"
                              type="email"
                              className="flex-1"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => saveProfile(profile.id)}
                              disabled={loading || !editName.trim() || !editEmail.trim()}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={cancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium">{profile.full_name}</div>
                          <div className="text-sm text-muted-foreground">{profile.email}</div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={profile.role === 'owner' ? 'default' : profile.role === 'admin' ? 'secondary' : 'outline'}>
                        {profile.role === 'owner' ? 'Eigenaar' : profile.role === 'admin' ? 'Admin' : 'Lid'}
                      </Badge>
                      {profile.id === user?.id && (
                        <Badge variant="outline">Jij</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {canChangeRole(profile) && (
                      <Select 
                        value={profile.role} 
                        onValueChange={(role) => updateUserRole(profile.id, role)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Lid</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {currentUserRole === 'owner' && (
                            <SelectItem value="owner">Eigenaar</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    {canEdit(profile) && editingProfile !== profile.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(profile)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {canDelete(profile) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteProfile(profile.id)}
                      >
                        Verwijderen
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
