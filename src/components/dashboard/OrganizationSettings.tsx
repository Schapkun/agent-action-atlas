
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building, Users, Edit, Save, X } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const OrganizationSettings = () => {
  const { 
    organizations, 
    currentOrganization, 
    workspaces, 
    currentWorkspace,
    refreshOrganizations,
    refreshWorkspaces
  } = useOrganization();
  const { toast } = useToast();
  
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);

  const startEditOrg = (org: any) => {
    setEditingOrg(org.id);
    setOrgName(org.name);
  };

  const startEditWorkspace = (workspace: any) => {
    setEditingWorkspace(workspace.id);
    setWorkspaceName(workspace.name);
  };

  const cancelEdit = () => {
    setEditingOrg(null);
    setEditingWorkspace(null);
    setOrgName('');
    setWorkspaceName('');
  };

  const saveOrgName = async (orgId: string) => {
    if (!orgName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          name: orgName,
          slug: orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        })
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "Organisatie bijgewerkt",
        description: "De organisatienaam is succesvol bijgewerkt.",
      });

      setEditingOrg(null);
      setOrgName('');
      refreshOrganizations();
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatienaam niet bijwerken.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWorkspaceName = async (workspaceId: string) => {
    if (!workspaceName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ 
          name: workspaceName,
          slug: workspaceName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        })
        .eq('id', workspaceId);

      if (error) throw error;

      toast({
        title: "Werkruimte bijgewerkt",
        description: "De werkruimtenaam is succesvol bijgewerkt.",
      });

      setEditingWorkspace(null);
      setWorkspaceName('');
      refreshWorkspaces();
    } catch (error: any) {
      console.error('Error updating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimtenaam niet bijwerken.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Organizations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Organisatie Instellingen
          </CardTitle>
          <CardDescription>
            Beheer uw organisaties en hun instellingen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {organizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    {editingOrg === org.id ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="max-w-xs"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => saveOrgName(org.id)}
                          disabled={loading || !orgName.trim()}
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
                    ) : (
                      <>
                        <div className="font-medium">{org.name}</div>
                        <div className="text-sm text-muted-foreground">/{org.slug}</div>
                      </>
                    )}
                  </div>
                  {currentOrganization?.id === org.id && (
                    <Badge variant="secondary">Actief</Badge>
                  )}
                </div>
                {editingOrg !== org.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditOrg(org)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workspaces Section */}
      {currentOrganization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Werkruimte Instellingen
            </CardTitle>
            <CardDescription>
              Beheer werkruimtes binnen {currentOrganization.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {workspaces.map((workspace) => (
                <div key={workspace.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      {editingWorkspace === workspace.id ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            className="max-w-xs"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => saveWorkspaceName(workspace.id)}
                            disabled={loading || !workspaceName.trim()}
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
                      ) : (
                        <>
                          <div className="font-medium">{workspace.name}</div>
                          <div className="text-sm text-muted-foreground">/{workspace.slug}</div>
                        </>
                      )}
                    </div>
                    {currentWorkspace?.id === workspace.id && (
                      <Badge variant="secondary">Actief</Badge>
                    )}
                  </div>
                  {editingWorkspace !== workspace.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditWorkspace(workspace)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </CardContent>
      )}
    </div>
  );
};
