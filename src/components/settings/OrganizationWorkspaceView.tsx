import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Settings, Users, Plus, Edit, Trash2, Save, Briefcase } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  workspaces: Workspace[];
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  organization_id: string;
}

interface OrganizationWorkspaceViewProps {
  userRole: string;
}

export const OrganizationWorkspaceView = ({ userRole }: OrganizationWorkspaceViewProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingOrganization, setEditingOrganization] = useState<string | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [showCreateOrgForm, setShowCreateOrgForm] = useState(false);
  const [showCreateWorkspaceForm, setShowCreateWorkspaceForm] = useState<string | null>(null);
  const [newOrgData, setNewOrgData] = useState({ name: '', slug: '' });
  const [newWorkspaceData, setNewWorkspaceData] = useState({ name: '', slug: '' });
  const [editOrgData, setEditOrgData] = useState({ name: '', slug: '' });
  const [editWorkspaceData, setEditWorkspaceData] = useState({ name: '', slug: '' });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .order('name');

      if (orgsError) throw orgsError;

      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('*')
        .order('name');

      if (workspacesError) throw workspacesError;

      const organizationsWithWorkspaces = orgsData?.map(org => ({
        ...org,
        workspaces: workspacesData?.filter(ws => ws.organization_id === org.id) || []
      })) || [];

      setOrganizations(organizationsWithWorkspaces);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Kon organisaties niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgData.name || !newOrgData.slug) return;

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: newOrgData.name,
          slug: newOrgData.slug
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Organisatie succesvol aangemaakt",
      });

      setNewOrgData({ name: '', slug: '' });
      setShowCreateOrgForm(false);
      fetchOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const updateOrganization = async (orgId: string) => {
    if (!editOrgData.name || !editOrgData.slug) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editOrgData.name,
          slug: editOrgData.slug
        })
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Organisatie succesvol bijgewerkt",
      });

      setEditingOrganization(null);
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Weet je zeker dat je organisatie "${orgName}" wilt verwijderen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Organisatie "${orgName}" verwijderd`,
      });

      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const createWorkspace = async (organizationId: string) => {
    if (!newWorkspaceData.name || !newWorkspaceData.slug) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspaceData.name,
          slug: newWorkspaceData.slug,
          organization_id: organizationId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Werkruimte succesvol aangemaakt",
      });

      setNewWorkspaceData({ name: '', slug: '' });
      setShowCreateWorkspaceForm(null);
      fetchOrganizations();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const updateWorkspace = async (workspaceId: string) => {
    if (!editWorkspaceData.name || !editWorkspaceData.slug) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: editWorkspaceData.name,
          slug: editWorkspaceData.slug
        })
        .eq('id', workspaceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Werkruimte succesvol bijgewerkt",
      });

      setEditingWorkspace(null);
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!confirm(`Weet je zeker dat je werkruimte "${workspaceName}" wilt verwijderen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Werkruimte "${workspaceName}" verwijderd`,
      });

      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet verwijderen",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  return (
    <div className="bg-muted/40 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h3 className="text-lg font-medium">Organisaties & Werkruimtes</h3>
        </div>
        {(user?.email === 'info@schapkun.com') && (
          <Button onClick={() => setShowCreateOrgForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Organisatie
          </Button>
        )}
      </div>

      {/* Create Organization Form */}
      {showCreateOrgForm && (
        <div className="bg-background rounded-lg border border-border/50 p-4 mb-4">
          <h4 className="font-medium text-base mb-4">Nieuwe Organisatie Aanmaken</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="new-org-name">Naam</Label>
              <Input
                id="new-org-name"
                value={newOrgData.name}
                onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                placeholder="Organisatie naam"
              />
            </div>
            <div>
              <Label htmlFor="new-org-slug">Slug</Label>
              <Input
                id="new-org-slug"
                value={newOrgData.slug}
                onChange={(e) => setNewOrgData({ ...newOrgData, slug: e.target.value })}
                placeholder="organisatie-slug"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={createOrganization}>
              <Save className="h-4 w-4 mr-2" />
              Opslaan
            </Button>
            <Button variant="outline" onClick={() => setShowCreateOrgForm(false)}>
              Annuleren
            </Button>
          </div>
        </div>
      )}

      {/* Organizations List */}
      {organizations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Geen organisaties gevonden
        </p>
      ) : (
        <div className="space-y-4">
          {organizations.map((org) => (
            <div key={org.id} className="bg-background rounded-lg border border-border/50">
              {/* Organization Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    {editingOrganization === org.id ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          value={editOrgData.name}
                          onChange={(e) => setEditOrgData({ ...editOrgData, name: e.target.value })}
                          placeholder="Organisatie naam"
                        />
                        <Input
                          value={editOrgData.slug}
                          onChange={(e) => setEditOrgData({ ...editOrgData, slug: e.target.value })}
                          placeholder="organisatie-slug"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium text-base">{org.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Organisatie • Werkruimtes ({org.workspaces.length})
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {(user?.email === 'info@schapkun.com') && (
                  <div className="flex space-x-1 mr-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOrganization(org.id, org.name)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {editingOrganization === org.id ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateOrganization(org.id)}
                        className="h-8 w-8 p-0"
                        title="Opslaan"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingOrganization(org.id);
                          setEditOrgData({ name: org.name, slug: org.slug });
                        }}
                        className="h-8 w-8 p-0"
                        title="Bewerken"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Workspaces under this organization */}
              {org.workspaces.length > 0 && (
                <div className="p-2">
                  {org.workspaces.map((workspace) => (
                    <div key={workspace.id} className="flex items-center justify-between p-3 rounded-md hover:bg-muted/30">
                      <div className="flex items-center gap-3 ml-10">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {editingWorkspace === workspace.id ? (
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={editWorkspaceData.name}
                                onChange={(e) => setEditWorkspaceData({ ...editWorkspaceData, name: e.target.value })}
                                placeholder="Werkruimte naam"
                              />
                              <Input
                                value={editWorkspaceData.slug}
                                onChange={(e) => setEditWorkspaceData({ ...editWorkspaceData, slug: e.target.value })}
                                placeholder="werkruimte-slug"
                              />
                            </div>
                          ) : (
                            <>
                              <p className="font-medium text-sm">{workspace.name}</p>
                              <p className="text-xs text-muted-foreground">Werkruimte</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWorkspace(workspace.id, workspace.name)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          title="Verwijder werkruimte"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {editingWorkspace === workspace.id ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateWorkspace(workspace.id)}
                            className="h-8 w-8 p-0"
                            title="Opslaan"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingWorkspace(workspace.id);
                              setEditWorkspaceData({ name: workspace.name, slug: workspace.slug });
                            }}
                            className="h-8 w-8 p-0"
                            title="Bewerken"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Create Workspace Form */}
              {showCreateWorkspaceForm === org.id && (
                <div className="p-3 bg-muted/15 rounded-lg border-2 border-dashed border-muted-foreground/20 mx-2 mb-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      value={newWorkspaceData.name}
                      onChange={(e) => setNewWorkspaceData({ ...newWorkspaceData, name: e.target.value })}
                      placeholder="Werkruimte naam"
                    />
                    <Input
                      value={newWorkspaceData.slug}
                      onChange={(e) => setNewWorkspaceData({ ...newWorkspaceData, slug: e.target.value })}
                      placeholder="werkruimte-slug"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => createWorkspace(org.id)}>
                      <Save className="h-4 w-4 mr-2" />
                      Opslaan
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCreateWorkspaceForm(null)}>
                      Annuleren
                    </Button>
                  </div>
                </div>
              )}

              {/* Add Workspace Button */}
              {showCreateWorkspaceForm !== org.id && (
                <div className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateWorkspaceForm(org.id)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuwe Werkruimte
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
