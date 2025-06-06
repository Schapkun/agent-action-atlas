
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { User, Building2, Settings, Mail } from 'lucide-react';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
}

interface UserAccess {
  organizations: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  workspaces: Array<{
    id: string;
    name: string;
    role: string;
    organization_name: string;
  }>;
}

export const MyAccount = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userAccess, setUserAccess] = useState<UserAccess>({ organizations: [], workspaces: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
    fetchUserAccess();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Kon profiel niet ophalen",
        variant: "destructive",
      });
    }
  };

  const fetchUserAccess = async () => {
    try {
      // Fetch organizations
      const { data: orgData, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations(id, name)
        `)
        .eq('user_id', user?.id);

      if (orgError) throw orgError;

      // Fetch workspaces
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspaces(id, name, organizations(name))
        `)
        .eq('user_id', user?.id);

      if (workspaceError) throw workspaceError;

      const organizations = orgData?.map(item => ({
        id: item.organizations.id,
        name: item.organizations.name,
        role: item.role
      })) || [];

      const workspaces = workspaceData?.map(item => ({
        id: item.workspaces.id,
        name: item.workspaces.name,
        role: item.role,
        organization_name: item.workspaces.organizations.name
      })) || [];

      setUserAccess({ organizations, workspaces });
    } catch (error) {
      console.error('Error fetching user access:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!userProfile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: userProfile.full_name,
          email: userProfile.email
        })
        .eq('id', user?.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          action: 'Profiel bijgewerkt via Mijn Account',
          details: { full_name: userProfile.full_name, email: userProfile.email }
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-100 text-red-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'member':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Eigenaar';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Lid';
      default:
        return role;
    }
  };

  if (loading) {
    return <div>Account gegevens laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          Mijn Account
        </h1>
        <p className="text-muted-foreground">
          Beheer je persoonlijke gegevens en bekijk je toegangsrechten
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Persoonlijke Gegevens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="full-name">Volledige Naam</Label>
                  <Input
                    id="full-name"
                    value={userProfile.full_name || ''}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      full_name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.email || ''}
                    onChange={(e) => setUserProfile({
                      ...userProfile,
                      email: e.target.value
                    })}
                  />
                </div>
              </div>
              <div>
                <Label>Account aangemaakt</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(userProfile.created_at).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <Button onClick={updateProfile} disabled={saving}>
                {saving ? 'Opslaan...' : 'Profiel Bijwerken'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Organization Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organisatie Toegang
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userAccess.organizations.length === 0 ? (
            <p className="text-muted-foreground">Je hebt geen toegang tot organisaties</p>
          ) : (
            <div className="space-y-3">
              {userAccess.organizations.map((org) => (
                <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{org.name}</h4>
                  </div>
                  <Badge className={getRoleBadgeColor(org.role)}>
                    {getRoleLabel(org.role)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workspace Access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Werkruimte Toegang
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userAccess.workspaces.length === 0 ? (
            <p className="text-muted-foreground">Je hebt geen toegang tot werkruimtes</p>
          ) : (
            <div className="space-y-3">
              {userAccess.workspaces.map((workspace) => (
                <div key={workspace.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{workspace.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Organisatie: {workspace.organization_name}
                    </p>
                  </div>
                  <Badge className={getRoleBadgeColor(workspace.role)}>
                    {getRoleLabel(workspace.role)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
