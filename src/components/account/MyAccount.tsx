
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { User, Save, Crown, Shield, UserCheck } from 'lucide-react';

interface MyAccountProps {
  viewingUserId?: string;
  isEditingOtherUser?: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  user_role: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationMembership {
  id: string;
  name: string;
  role: string;
  created_at: string;
}

interface WorkspaceMembership {
  id: string;
  name: string;
  organization_name: string;
  role: string;
  created_at: string;
}

export const MyAccount = ({ viewingUserId, isEditingOtherUser = false }: MyAccountProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationMembership[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const targetUserId = viewingUserId || user?.id;
  const isViewingOwnProfile = !isEditingOtherUser && targetUserId === user?.id;

  // Helper function to translate user roles consistently
  const translateRole = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'Eigenaar';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Gebruiker';
      default:
        return 'Gebruiker';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-600" />;
    }
  };

  const fetchProfile = async () => {
    if (!targetUserId) return;

    try {
      console.log('Fetching profile for user:', targetUserId);
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }

      console.log('Profile data:', profileData);
      setProfile(profileData);

      // Fetch organization memberships - fix the relationship reference
      const { data: orgMemberships, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          role,
          created_at,
          organizations!organization_members_organization_id_fkey(id, name)
        `)
        .eq('user_id', targetUserId);

      console.log('Organization memberships raw data:', orgMemberships);

      if (orgError) {
        console.error('Error fetching organization memberships:', orgError);
      }

      // Fetch workspace memberships - fix the relationship reference
      const { data: workspaceMemberships, error: workspaceError } = await supabase
        .from('workspace_members')
        .select(`
          role,
          created_at,
          workspaces!workspace_members_workspace_id_fkey(id, name, organization_id),
          workspaces(organizations!workspaces_organization_id_fkey(name))
        `)
        .eq('user_id', targetUserId);

      console.log('Workspace memberships raw data:', workspaceMemberships);

      if (workspaceError) {
        console.error('Error fetching workspace memberships:', workspaceError);
      }

      // Process organization memberships
      const processedOrgs = (orgMemberships || []).map(membership => ({
        id: (membership as any).organizations?.id || '',
        name: (membership as any).organizations?.name || 'Onbekende Organisatie',
        role: membership.role,
        created_at: membership.created_at
      })).filter(org => org.id);

      // Process workspace memberships
      const processedWorkspaces = (workspaceMemberships || []).map(membership => ({
        id: (membership as any).workspaces?.id || '',
        name: (membership as any).workspaces?.name || 'Onbekende Werkruimte',
        organization_name: (membership as any).workspaces?.organizations?.name || 'Onbekende Organisatie',
        role: membership.role,
        created_at: membership.created_at
      })).filter(workspace => workspace.id);

      console.log('Processed organization memberships:', processedOrgs);
      console.log('Processed workspace memberships:', processedWorkspaces);

      setOrganizations(processedOrgs);
      setWorkspaces(processedWorkspaces);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Kon gebruikersgegevens niet laden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile || !targetUserId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          user_role: profile.user_role as 'owner' | 'admin' | 'member'
        })
        .eq('id', targetUserId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Profiel succesvol bijgewerkt",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Kon profiel niet bijwerken",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
    }
  }, [targetUserId]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Gebruiker niet gevonden</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-6 w-6" />
        <h1 className="text-2xl font-bold">
          {isViewingOwnProfile ? 'Mijn Account' : `Account van ${profile.full_name || profile.email}`}
        </h1>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Persoonlijke Informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback>
                {profile.full_name ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : profile.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full_name">Volledige Naam</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                    disabled={!isViewingOwnProfile}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="user_role">Gebruikersrol</Label>
                <Select
                  value={profile.user_role}
                  onValueChange={(value: 'owner' | 'admin' | 'member') => setProfile(prev => prev ? { ...prev, user_role: value } : null)}
                  disabled={!isViewingOwnProfile}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Eigenaar</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Gebruiker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {isViewingOwnProfile && (
              <Button onClick={handleSave} disabled={saving} className="shrink-0">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Opslaan...' : 'Profiel Opslaan'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Organizations & Workspaces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Mijn Organisaties & Werkruimtes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Organizations */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Organisaties ({organizations.length})
            </h3>
            {organizations.length > 0 ? (
              <div className="space-y-2">
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(org.role)}
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Lid sinds: {new Date(org.created_at).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {translateRole(org.role)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Geen organisaties gevonden</p>
            )}
          </div>

          {/* Workspaces */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Werkruimtes ({workspaces.length})
            </h3>
            {workspaces.length > 0 ? (
              <div className="space-y-2">
                {workspaces.map((workspace) => (
                  <div key={workspace.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getRoleIcon(workspace.role)}
                      <div>
                        <p className="font-medium">{workspace.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Organisatie: {workspace.organization_name} • Lid sinds: {new Date(workspace.created_at).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-blue-600">
                      {translateRole(workspace.role)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Geen werkruimtes gevonden</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
