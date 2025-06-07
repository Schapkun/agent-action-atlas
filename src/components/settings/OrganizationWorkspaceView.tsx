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
import { Settings, Users, Plus, Edit, Trash2, Save, Briefcase, Search } from 'lucide-react';

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

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

export const OrganizationWorkspaceView = ({ userRole }: OrganizationWorkspaceViewProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingOrganization, setEditingOrganization] = useState<string | null>(null);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [showCreateOrgForm, setShowCreateOrgForm] = useState(false);
  const [showCreateWorkspaceForm, setShowCreateWorkspaceForm] = useState<string | null>(null);
  const [newOrgData, setNewOrgData] = useState({ name: '' });
  const [newWorkspaceData, setNewWorkspaceData] = useState({ name: '' });
  const [editOrgData, setEditOrgData] = useState({ name: '' });
  const [editWorkspaceData, setEditWorkspaceData] = useState({ name: '' });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    // Filter organizations and workspaces based on search term
    if (!searchTerm.trim()) {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.map(org => {
        const orgMatches = org.name.toLowerCase().includes(searchTerm.toLowerCase());
        const hasMatchingWorkspace = org.workspaces.some(workspace =>
          workspace.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        // If organization name matches OR has matching workspaces, show all workspaces for that organization
        // This ensures when searching for a workspace, all other workspaces in that org remain visible
        return {
          ...org,
          workspaces: (orgMatches || hasMatchingWorkspace) ? org.workspaces : []
        };
      }).filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.workspaces.some(workspace => workspace.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredOrganizations(filtered);
    }
  }, [searchTerm, organizations]);

  // Check if user can create organizations and workspaces
  const canCreateContent = () => {
    console.log('OrganizationWorkspaceView - canCreateContent check:', { 
      userRole, 
      userEmail: user?.email,
      isAccountOwner: user?.email === 'info@schapkun.com'
    });
    
    // Account owner can always create content
    if (user?.email === 'info@schapkun.com') {
      console.log('Account owner detected, can create content');
      return true;
    }
    
    // For all other users, they need admin or eigenaar role
    const canCreate = userRole === 'admin' || userRole === 'eigenaar';
    console.log('Role-based check result:', { userRole, canCreate });
    return canCreate;
  };

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
    if (!newOrgData.name) return;

    try {
      const slug = generateSlug(newOrgData.name);
      
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: newOrgData.name,
          slug: slug
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Organisatie succesvol aangemaakt",
      });

      setNewOrgData({ name: '' });
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
    if (!editOrgData.name) return;

    try {
      const slug = generateSlug(editOrgData.name);
      
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editOrgData.name,
          slug: slug
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
    if (!newWorkspaceData.name) return;

    try {
      const slug = generateSlug(newWorkspaceData.name);
      
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspaceData.name,
          slug: slug,
          organization_id: organizationId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Werkruimte succesvol aangemaakt",
      });

      setNewWorkspaceData({ name: '' });
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
    if (!editWorkspaceData.name) return;

    try {
      const slug = generateSlug(editWorkspaceData.name);
      
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: editWorkspaceData.name,
          slug: slug
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

  const canCreate = canCreateContent();
  console.log('OrganizationWorkspaceView - Final render decision:', { 
    canCreate, 
    userRole, 
    userEmail: user?.email 
  });

  return (
    <div>
      {/* Search and Create Button Row */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Zoek organisaties en werkruimtes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {canCreate && (
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
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
              <Label htmlFor="new-org-name">Naam</Label>
              <Input
                id="new-org-name"
                value={newOrgData.name}
                onChange={(e) => setNewOrgData({ name: e.target.value })}
                placeholder="Organisatie naam"
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
      {filteredOrganizations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {searchTerm ? 'Geen organisaties of werkruimtes gevonden voor uw zoekopdracht' : 'Geen organisaties gevonden'}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredOrganizations.map((org) => (
            <div key={org.id} className="bg-background rounded-lg border border-border/50">
              {/* Organization Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/30">
                <div className="flex items-center gap-3">
                  <div>
                    {editingOrganization === org.id ? (
                      <div className="grid grid-cols-1 gap-2">
                        <Input
                          value={editOrgData.name}
                          onChange={(e) => setEditOrgData({ name: e.target.value })}
                          placeholder="Organisatie naam"
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
                {canCreate && (
                  <div className="flex space-x-1 mr-4">
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
                          setEditOrgData({ name: org.name });
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
                            <div className="grid grid-cols-1 gap-2">
                              <Input
                                value={editWorkspaceData.name}
                                onChange={(e) => setEditWorkspaceData({ name: e.target.value })}
                                placeholder="Werkruimte naam"
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
                      {canCreate && (
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
                                setEditWorkspaceData({ name: workspace.name });
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
                  ))}
                </div>
              )}

              {/* Create Workspace Form */}
              {showCreateWorkspaceForm === org.id && (
                <div className="p-3 bg-muted/15 rounded-lg border-2 border-dashed border-muted-foreground/20 mx-2 mb-2">
                  <div className="grid grid-cols-1 gap-2 mb-2">
                    <Input
                      value={newWorkspaceData.name}
                      onChange={(e) => setNewWorkspaceData({ name: e.target.value })}
                      placeholder="Werkruimte naam"
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
              {showCreateWorkspaceForm !== org.id && canCreate && (
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
