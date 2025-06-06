
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OrganizationSettings } from './OrganizationSettings';
import { UserManagement } from './UserManagement';
import { Building, Users, Settings, Plus } from 'lucide-react';
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
      const slug = newOrgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name: newOrgName, slug }])
        .select()
        .single();

      if (orgError) throw orgError;

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{ organization_id: org.id, user_id: user.id, role: 'owner' }]);

      if (memberError) throw memberError;

      toast({
        title: "Organisatie aangemaakt",
        description: `${newOrgName} is succesvol aangemaakt.`,
      });

      setNewOrgName('');
      setShowCreateOrg(false);
      refreshOrganizations();
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet aanmaken.",
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

      if (workspaceError) throw workspaceError;

      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([{ workspace_id: workspace.id, user_id: user.id, role: 'admin' }]);

      if (memberError) throw memberError;

      toast({
        title: "Werkruimte aangemaakt",
        description: `${newWorkspaceName} is succesvol aangemaakt.`,
      });

      setNewWorkspaceName('');
      setShowCreateWorkspace(false);
      refreshWorkspaces();
    } catch (error: any) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet aanmaken.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Instellingen
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gebruikersbeheer
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Nieuw Aanmaken
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-6">
          <OrganizationSettings />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="create" className="space-y-6">
          {/* Organizations Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Organisaties
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
                        Aanmaken
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

              <div className="grid gap-3">
                {organizations.map((org) => (
                  <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-muted-foreground">/{org.slug}</div>
                      </div>
                      {currentOrganization?.id === org.id && (
                        <Badge variant="secondary">Actief</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workspaces Section */}
          {currentOrganization && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Werkruimtes in {currentOrganization.name}
                    </CardTitle>
                    <CardDescription>
                      Beheer werkruimtes binnen deze organisatie
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
                          Aanmaken
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
                  {workspaces.map((workspace) => (
                    <div key={workspace.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{workspace.name}</div>
                          <div className="text-sm text-muted-foreground">/{workspace.slug}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
