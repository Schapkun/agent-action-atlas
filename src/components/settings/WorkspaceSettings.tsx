
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Edit } from 'lucide-react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  created_at: string;
  organization?: {
    name: string;
  };
  user_role?: string;
}

interface Organization {
  id: string;
  name: string;
}

export const WorkspaceSettings = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [newWorkspace, setNewWorkspace] = useState({ name: '', organization_id: '' });
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkspaces();
    fetchOrganizations();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          role,
          workspaces (
            id,
            name,
            slug,
            organization_id,
            created_at,
            organizations (
              name
            )
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const workspacesWithRoles = data?.map(item => ({
        id: item.workspaces?.id || '',
        name: item.workspaces?.name || '',
        slug: item.workspaces?.slug || '',
        organization_id: item.workspaces?.organization_id || '',
        created_at: item.workspaces?.created_at || '',
        organization: item.workspaces?.organizations,
        user_role: item.role
      })) || [];

      setWorkspaces(workspacesWithRoles);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast({
        title: "Error",
        description: "Kon werkruimtes niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organizations (
            id,
            name
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const orgs = data?.map(item => item.organizations).filter(Boolean) || [];
      setOrganizations(orgs as Organization[]);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspace.name.trim() || !newWorkspace.organization_id) return;

    try {
      const slug = newWorkspace.name.toLowerCase().replace(/\s+/g, '-');
      
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspace.name,
          slug: slug,
          organization_id: newWorkspace.organization_id
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceData.id,
          user_id: user?.id,
          role: 'admin'
        });

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: newWorkspace.organization_id,
          workspace_id: workspaceData.id,
          action: 'Werkruimte aangemaakt',
          details: { workspace_name: newWorkspace.name }
        });

      toast({
        title: "Succes",
        description: "Werkruimte succesvol aangemaakt",
      });

      setNewWorkspace({ name: '', organization_id: '' });
      setIsCreateDialogOpen(false);
      fetchWorkspaces();
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const updateWorkspace = async () => {
    if (!editingWorkspace || !editingWorkspace.name.trim()) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: editingWorkspace.name,
          slug: editingWorkspace.name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', editingWorkspace.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: editingWorkspace.organization_id,
          workspace_id: editingWorkspace.id,
          action: 'Werkruimte bijgewerkt',
          details: { workspace_name: editingWorkspace.name }
        });

      toast({
        title: "Succes",
        description: "Werkruimte succesvol bijgewerkt",
      });

      setEditingWorkspace(null);
      fetchWorkspaces();
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
    if (!confirm(`Weet je zeker dat je werkruimte "${workspaceName}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Werkruimte succesvol verwijderd",
      });

      fetchWorkspaces();
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
    return <div>Werkruimtes laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Werkruimtes</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Werkruimte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Werkruimte Aanmaken</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workspace-name">Werkruimte Naam</Label>
                <Input
                  id="workspace-name"
                  value={newWorkspace.name}
                  onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                  placeholder="Voer werkruimte naam in"
                />
              </div>
              <div>
                <Label htmlFor="organization">Organisatie</Label>
                <Select
                  value={newWorkspace.organization_id}
                  onValueChange={(value) => setNewWorkspace({ ...newWorkspace, organization_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer organisatie" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={createWorkspace}>
                  Aanmaken
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {workspaces.map((workspace) => (
          <Card key={workspace.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{workspace.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Organisatie: {workspace.organization?.name} • Rol: {workspace.user_role} • 
                    Aangemaakt: {new Date(workspace.created_at).toLocaleDateString('nl-NL')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {(workspace.user_role === 'admin' || workspace.user_role === 'owner') && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingWorkspace(workspace)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteWorkspace(workspace.id, workspace.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {editingWorkspace && (
        <Dialog open={!!editingWorkspace} onOpenChange={() => setEditingWorkspace(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Werkruimte Bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-workspace-name">Werkruimte Naam</Label>
                <Input
                  id="edit-workspace-name"
                  value={editingWorkspace.name}
                  onChange={(e) => setEditingWorkspace({ ...editingWorkspace, name: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingWorkspace(null)}>
                  Annuleren
                </Button>
                <Button onClick={updateWorkspace}>
                  Opslaan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
