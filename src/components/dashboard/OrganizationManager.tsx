
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Users, 
  Plus, 
  Settings, 
  Folder,
  UserPlus,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { OrganizationSettings } from './OrganizationSettings';
import { ProfileManagement } from './ProfileManagement';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const OrganizationManager = () => {
  const { user } = useAuth();
  const { 
    organizations, 
    currentOrganization, 
    workspaces, 
    currentWorkspace,
    setCurrentOrganization,
    setCurrentWorkspace,
    refreshOrganizations,
    refreshWorkspaces
  } = useOrganization();
  const { toast } = useToast();

  const [newOrgName, setNewOrgName] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const createOrganization = async () => {
    if (!newOrgName.trim() || !user) return;

    setLoading(true);
    try {
      // Create the organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          slug: newOrgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add the user as organization owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) throw memberError;

      // Create default workspace
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          organization_id: org.id,
          name: 'Hoofd Werkruimte',
          slug: 'main'
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add user as workspace admin
      const { error: workspaceMemberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: 'admin'
        });

      if (workspaceMemberError) throw workspaceMemberError;

      toast({
        title: "Organisatie aangemaakt",
        description: `De organisatie "${newOrgName}" is succesvol aangemaakt met een standaard werkruimte.`,
      });

      setNewOrgName('');
      refreshOrganizations();
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet aanmaken: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim() || !currentOrganization) return;

    setLoading(true);
    try {
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          organization_id: currentOrganization.id,
          name: newWorkspaceName,
          slug: newWorkspaceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // Add current user as workspace admin
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspace.id,
          user_id: user!.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Werkruimte aangemaakt",
        description: `De werkruimte "${newWorkspaceName}" is succesvol aangemaakt.`,
      });

      setNewWorkspaceName('');
      refreshWorkspaces();
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet aanmaken: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!currentOrganization) return;

    setLoading(true);
    try {
      // First delete all workspace members
      await supabase
        .from('workspace_members')
        .delete()
        .eq('workspace_id', workspaceId);

      // Then delete the workspace
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      toast({
        title: "Werkruimte verwijderd",
        description: `De werkruimte "${workspaceName}" is succesvol verwijderd.`,
      });

      // If current workspace was deleted, reset it
      if (currentWorkspace?.id === workspaceId) {
        setCurrentWorkspace(null);
      }

      refreshWorkspaces();
    } catch (error: any) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet verwijderen: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim() || !currentOrganization) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_invitations')
        .insert({
          email: inviteEmail,
          organization_id: currentOrganization.id,
          role: inviteRole,
          invited_by: user!.id
        });

      if (error) throw error;

      toast({
        title: "Uitnodiging verstuurd",
        description: `Een uitnodiging is verstuurd naar ${inviteEmail}.`,
      });

      setInviteEmail('');
      setInviteRole('member');
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet versturen: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center p-6">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Selecteer eerst een organisatie of maak een nieuwe aan</p>
            
            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-org">Nieuwe organisatie</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-org"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Organisatienaam"
                    disabled={loading}
                  />
                  <Button 
                    onClick={createOrganization}
                    disabled={loading || !newOrgName.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
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
            <Building className="h-5 w-5" />
            Organisatiebeheer
          </CardTitle>
          <CardDescription>
            Beheer je organisaties, werkruimtes en teamleden
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Organisaties
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Werkruimtes
          </TabsTrigger>
          <TabsTrigger value="invites" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Uitnodigen
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gebruikersprofielen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Organisatie-instellingen
              </CardTitle>
              <CardDescription>
                Beheer je organisaties en hun instellingen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <OrganizationSettings />
              
              <div className="pt-4 border-t">
                <Label htmlFor="new-org">Nieuwe organisatie aanmaken</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="new-org"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Organisatienaam"
                    disabled={loading}
                  />
                  <Button 
                    onClick={createOrganization}
                    disabled={loading || !newOrgName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aanmaken
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Werkruimtes in {currentOrganization?.name}
              </CardTitle>
              <CardDescription>
                Beheer werkruimtes binnen je organisatie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {workspaces.length === 0 ? (
                  <div className="text-center p-6 text-muted-foreground">
                    <Folder className="h-8 w-8 mx-auto mb-2" />
                    <p>Nog geen werkruimtes gevonden</p>
                  </div>
                ) : (
                  workspaces.map((workspace) => (
                    <div key={workspace.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Folder className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{workspace.name}</div>
                          <div className="text-sm text-muted-foreground">/{workspace.slug}</div>
                        </div>
                        {currentWorkspace?.id === workspace.id && (
                          <Badge variant="secondary">Actief</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentWorkspace(workspace)}
                        >
                          Selecteren
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteWorkspace(workspace.id, workspace.name)}
                          disabled={loading}
                        >
                          Verwijderen
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 border-t">
                <Label htmlFor="new-workspace">Nieuwe werkruimte aanmaken</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="new-workspace"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Werkruimtenaam"
                    disabled={loading}
                  />
                  <Button 
                    onClick={createWorkspace}
                    disabled={loading || !newWorkspaceName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Aanmaken
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Teamleden uitnodigen
              </CardTitle>
              <CardDescription>
                Nodig nieuwe teamleden uit voor {currentOrganization?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email adres</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="naam@bedrijf.nl"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-role">Rol</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Lid</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Eigenaar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={sendInvitation}
                  disabled={loading || !inviteEmail.trim()}
                  className="w-full"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Uitnodiging versturen
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <ProfileManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
