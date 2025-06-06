import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, Building2, Settings, Save } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface Organization {
  id: string;
  name: string;
  role: string;
}

interface Workspace {
  id: string;
  name: string;
  organization_name: string;
}

export const MyAccount = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch organizations
      const { data: orgData, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations!fk_organization_members_organization (
            id,
            name
          )
        `)
        .eq('user_id', user?.id);

      if (orgError) throw orgError;
      
      const orgs = orgData?.map(item => ({
        id: item.organizations?.id || '',
        name: item.organizations?.name || '',
        role: item.role
      })) || [];
      setOrganizations(orgs);

      // Fetch workspaces
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspace_members')
        .select(`
          workspaces!fk_workspace_members_workspace (
            id,
            name,
            organizations!fk_workspaces_organization (
              name
            )
          )
        `)
        .eq('user_id', user?.id);

      if (workspaceError) throw workspaceError;
      
      const workspaces = workspaceData?.map(item => ({
        id: item.workspaces?.id || '',
        name: item.workspaces?.name || '',
        organization_name: item.workspaces?.organizations?.name || ''
      })) || [];
      setWorkspaces(workspaces);

    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Kon gebruikersgegevens niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: profile.full_name,
          email: profile.email
        })
        .eq('id', profile.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          action: 'Profiel bijgewerkt',
          details: { full_name: profile.full_name, email: profile.email }
        });

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div>Account gegevens laden...</div>;
  }

  if (!profile) {
    return <div>Kon profiel niet laden</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback className="text-lg">
            {getInitials(profile.full_name || profile.email || 'U')}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">Mijn Account</h1>
          <p className="text-muted-foreground">Beheer je persoonlijke gegevens en voorkeuren</p>
        </div>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Persoonlijke Informatie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full-name">Volledige Naam</Label>
              <Input
                id="full-name"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Voer je volledige naam in"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mailadres</Label>
              <Input
                id="email"
                type="email"
                value={profile.email || ''}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Voer je e-mailadres in"
              />
            </div>
          </div>
          <Button onClick={updateProfile} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Opslaan...' : 'Profiel Opslaan'}
          </Button>
        </CardContent>
      </Card>

      {/* Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Mijn Organisaties
          </CardTitle>
        </CardHeader>
        <CardContent>
          {organizations.length === 0 ? (
            <p className="text-muted-foreground">Je bent nog geen lid van een organisatie</p>
          ) : (
            <div className="space-y-2">
              {organizations.map((org) => (
                <div key={org.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{org.name}</p>
                    <p className="text-sm text-muted-foreground">Rol: {org.role}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workspaces */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Mijn Werkruimtes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workspaces.length === 0 ? (
            <p className="text-muted-foreground">Je hebt nog geen toegang tot werkruimtes</p>
          ) : (
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{workspace.name}</p>
                    <p className="text-sm text-muted-foreground">Organisatie: {workspace.organization_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
