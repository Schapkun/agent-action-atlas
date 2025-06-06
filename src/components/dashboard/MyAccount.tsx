
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Edit, Save, X, Building, Users } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserMembership {
  organization_id: string;
  organization_name: string;
  role: string;
  workspaces: {
    id: string;
    name: string;
    role: string;
  }[];
}

export const MyAccount = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<any>(null);
  const [memberships, setMemberships] = useState<UserMembership[]>([]);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      setEditName(data.full_name || '');
      setEditEmail(data.email || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchMemberships = async () => {
    if (!user) return;

    try {
      // Get organization memberships
      const { data: orgMemberships, error: orgError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations!inner(name)
        `)
        .eq('user_id', user.id);

      if (orgError) {
        console.error('Error fetching organization memberships:', orgError);
        return;
      }

      // Get workspace memberships
      const { data: workspaceMemberships, error: workspaceError } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          role,
          workspaces!inner(id, name, organization_id)
        `)
        .eq('user_id', user.id);

      if (workspaceError) {
        console.error('Error fetching workspace memberships:', workspaceError);
        return;
      }

      // Combine data
      const combinedMemberships = orgMemberships?.map(org => {
        const orgWorkspaces = workspaceMemberships?.filter(
          ws => ws.workspaces.organization_id === org.organization_id
        ).map(ws => ({
          id: ws.workspaces.id,
          name: ws.workspaces.name,
          role: ws.role
        })) || [];

        return {
          organization_id: org.organization_id,
          organization_name: org.organizations.name,
          role: org.role,
          workspaces: orgWorkspaces
        };
      }) || [];

      setMemberships(combinedMemberships);
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
  };

  const saveProfile = async () => {
    if (!user || !editName.trim() || !editEmail.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: editName,
          email: editEmail
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profiel bijgewerkt",
        description: "Je profiel is succesvol bijgewerkt.",
      });

      setEditing(false);
      fetchProfile();
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

  const cancelEdit = () => {
    setEditing(false);
    setEditName(profile?.full_name || '');
    setEditEmail(profile?.email || '');
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMemberships();
    }
  }, [user]);

  if (!user || !profile) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center p-6">
            <p className="text-muted-foreground">Laden...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Eigenaar';
      case 'admin': return 'Admin';
      default: return 'Lid';
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Mijn Account
              </CardTitle>
              <CardDescription>
                Beheer je persoonlijke gegevens
              </CardDescription>
            </div>
            {!editing && (
              <Button 
                onClick={() => setEditing(true)}
                size="sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Bewerken
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editName">Volledige Naam</Label>
                <Input
                  id="editName"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Je volledige naam"
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email Adres</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="je@email.com"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={saveProfile}
                  disabled={loading || !editName.trim() || !editEmail.trim()}
                  size="sm"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Bezig...' : 'Opslaan'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={cancelEdit}
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Annuleren
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label>Volledige Naam</Label>
                <p className="text-sm text-muted-foreground mt-1">{profile.full_name || 'Niet ingesteld'}</p>
              </div>
              <div>
                <Label>Email Adres</Label>
                <p className="text-sm text-muted-foreground mt-1">{profile.email || 'Niet ingesteld'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization and Workspace Memberships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Mijn Toegang
          </CardTitle>
          <CardDescription>
            Organisaties en werkruimtes waar je toegang tot hebt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {memberships.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <Building className="h-8 w-8 mx-auto mb-2" />
              <p>Je hebt nog geen toegang tot organisaties</p>
            </div>
          ) : (
            <div className="space-y-4">
              {memberships.map((membership) => (
                <div key={membership.organization_id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <h4 className="font-medium">{membership.organization_name}</h4>
                    </div>
                    <Badge variant={getRoleBadgeVariant(membership.role)}>
                      {getRoleLabel(membership.role)}
                    </Badge>
                  </div>
                  
                  {membership.workspaces.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Werkruimtes
                      </h5>
                      <div className="grid gap-2">
                        {membership.workspaces.map((workspace) => (
                          <div key={workspace.id} className="flex items-center justify-between py-1 px-2 bg-muted/50 rounded">
                            <span className="text-sm">{workspace.name}</span>
                            <Badge variant={getRoleBadgeVariant(workspace.role)} className="text-xs">
                              {getRoleLabel(workspace.role)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
