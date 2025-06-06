
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OrganizationSettings } from './OrganizationSettings';
import { UserManagement } from './UserManagement';
import { Building, Users, Settings, Plus, AlertCircle } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const OrganizationManager = () => {
  const { user } = useAuth();
  const { 
    organizations, 
    currentOrganization, 
    workspaces, 
    refreshOrganizations, 
    refreshWorkspaces 
  } = useOrganization();
  const { toast } = useToast();
  
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);

  const createOrganization = async () => {
    if (!newOrgName.trim() || !user) return;

    setLoading(true);
    try {
      console.log('Creating organization with name:', newOrgName);
      const slug = newOrgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name: newOrgName, slug }])
        .select()
        .single();

      console.log('Organization creation result:', { org, orgError });

      if (orgError) {
        console.error('Error creating organization:', orgError);
        throw orgError;
      }

      console.log('Created organization, now adding membership');
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{ organization_id: org.id, user_id: user.id, role: 'owner' }]);

      console.log('Membership creation result:', { memberError });

      if (memberError) {
        console.error('Error creating organization membership:', memberError);
        throw memberError;
      }

      toast({
        title: "Organisatie aangemaakt",
        description: `${newOrgName} is succesvol aangemaakt.`,
      });

      setNewOrgName('');
      setShowCreateOrg(false);
      await refreshOrganizations();
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
    if (!newWorkspaceName.trim() || !currentOrganization || !user) return;

    setLoading(true);
    try {
      console.log('Creating workspace with name:', newWorkspaceName);
      const slug = newWorkspaceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([{ 
          organization_id: currentOrganization.id, 
          name: newWorkspaceName, 
          slug 
        }])
        .select()
        .single();

      console.log('Workspace creation result:', { workspace, workspaceError });

      if (workspaceError) {
        console.error('Error creating workspace:', workspaceError);
        throw workspaceError;
      }

      console.log('Created workspace, now adding membership');
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([{ workspace_id: workspace.id, user_id: user.id, role: 'admin' }]);

      console.log('Workspace membership creation result:', { memberError });

      if (memberError) {
        console.error('Error creating workspace membership:', memberError);
        throw memberError;
      }

      toast({
        title: "Werkruimte aangemaakt",
        description: `${newWorkspaceName} is succesvol aangemaakt.`,
      });

      setNewWorkspaceName('');
      setShowCreateWorkspace(false);
      await refreshWorkspaces();
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

  // Show message if no organizations exist
  if (organizations.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Welkom bij Organisatie Beheer
            </CardTitle>
            <CardDescription>
              Je hebt nog geen organisaties. Begin door je eerste organisatie aan te maken.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showCreateOrg ? (
              <Button onClick={() => setShowCreateOrg(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Eerste Organisatie Aanmaken
              </Button>
            ) : (
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="orgName">Organisatie Naam</Label>
                    <Input
                      id="orgName"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      placeholder="Mijn Advocatenkantoor"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={createOrganization} 
                      disabled={loading || !newOrgName.trim()}
                      size="sm"
                    >
                      {loading ? 'Bezig...' : 'Aanmaken'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCreateOrg(false)} 
                      size="sm"
                    >
                      Annuleren
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Instellingen
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gebruikersbeheer
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-6">
          {/* Organization Settings with create button */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Organisatie Instellingen
                  </CardTitle>
                  <CardDescription>
                    Beheer uw organisaties en hun instellingen
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowCreateOrg(!showCreateOrg)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nieuwe Organisatie
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showCreateOrg && (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="orgName">Organisatie Naam</Label>
                      <Input
                        id="orgName"
                        value={newOrgName}
                        onChange={(e) => setNewOrgName(e.target.value)}
                        placeholder="Mijn Advocatenkantoor"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={createOrganization} 
                        disabled={loading || !newOrgName.trim()}
                        size="sm"
                      >
                        {loading ? 'Bezig...' : 'Aanmaken'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateOrg(false)} 
                        size="sm"
                      >
                        Annuleren
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <OrganizationSettings />
            </CardContent>
          </Card>

          {/* Workspace Settings with create button */}
          {currentOrganization && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Werkruimte Instellingen
                    </CardTitle>
                    <CardDescription>
                      Beheer werkruimtes binnen {currentOrganization.name}
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => setShowCreateWorkspace(!showCreateWorkspace)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe Werkruimte
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showCreateWorkspace && (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="workspaceName">Werkruimte Naam</Label>
                        <Input
                          id="workspaceName"
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                          placeholder="Marketing Team"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={createWorkspace} 
                          disabled={loading || !newWorkspaceName.trim()}
                          size="sm"
                        >
                          {loading ? 'Bezig...' : 'Aanmaken'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowCreateWorkspace(false)} 
                          size="sm"
                        >
                          Annuleren
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid gap-3">
                  {workspaces.length === 0 ? (
                    <div className="text-center p-6 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Nog geen werkruimtes aangemaakt</p>
                      <p className="text-sm">Maak je eerste werkruimte aan met de knop hierboven</p>
                    </div>
                  ) : (
                    workspaces.map((workspace) => (
                      <div key={workspace.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{workspace.name}</div>
                            <div className="text-sm text-muted-foreground">/{workspace.slug}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
