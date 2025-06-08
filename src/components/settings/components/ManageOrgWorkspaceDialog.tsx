
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  workspaces?: Workspace[];
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  hasOrgAccess?: boolean;
  workspaceAccess?: { [workspaceId: string]: boolean };
}

interface ManageOrgWorkspaceDialogProps {
  type: 'organization';
  item?: Organization | null;
  trigger: React.ReactNode;
  onSaved: () => void;
}

export const ManageOrgWorkspaceDialog = ({ type, item, trigger, onSaved }: ManageOrgWorkspaceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item?.name || '');
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const { toast } = useToast();
  const { refreshData } = useOrganization();

  useEffect(() => {
    if (item) {
      setName(item.name || '');
    } else {
      setName('');
    }
  }, [item]);

  useEffect(() => {
    if (open && item) {
      fetchData();
    }
  }, [open, item]);

  const fetchData = async () => {
    if (!item) return;

    try {
      setLoading(true);
      
      // Get all users from profiles
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (usersError) throw usersError;

      // Get current organization members
      const { data: orgMembers, error: orgMembersError } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', item.id);
      
      if (orgMembersError) throw orgMembersError;
      const orgMemberIds = orgMembers?.map(m => m.user_id) || [];

      // Get workspaces for this organization
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('id, name, slug, organization_id')
        .eq('organization_id', item.id)
        .order('name');
      
      if (workspacesError) throw workspacesError;
      setWorkspaces(workspacesData || []);

      // Get workspace members for all workspaces
      const workspaceIds = workspacesData?.map(w => w.id) || [];
      let workspaceMembers: { [workspaceId: string]: string[] } = {};
      
      if (workspaceIds.length > 0) {
        const { data: wsMembers, error: wsMembersError } = await supabase
          .from('workspace_members')
          .select('user_id, workspace_id')
          .in('workspace_id', workspaceIds);
        
        if (wsMembersError) throw wsMembersError;
        
        workspaceMembers = (wsMembers || []).reduce((acc, member) => {
          if (!acc[member.workspace_id]) {
            acc[member.workspace_id] = [];
          }
          acc[member.workspace_id].push(member.user_id);
          return acc;
        }, {} as { [workspaceId: string]: string[] });
      }

      // Combine users with access info
      const usersWithAccess = allUsers?.map(user => ({
        ...user,
        hasOrgAccess: orgMemberIds.includes(user.id),
        workspaceAccess: workspaceIds.reduce((acc, wsId) => {
          acc[wsId] = workspaceMembers[wsId]?.includes(user.id) || false;
          return acc;
        }, {} as { [workspaceId: string]: boolean })
      })) || [];

      setUsers(usersWithAccess);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Kon gegevens niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrgUserToggle = async (userId: string, hasAccess: boolean) => {
    // Update local state immediately
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newWorkspaceAccess = { ...user.workspaceAccess };
        // If removing from org, remove from all workspaces
        if (!hasAccess) {
          Object.keys(newWorkspaceAccess).forEach(wsId => {
            newWorkspaceAccess[wsId] = false;
          });
        }
        return { 
          ...user, 
          hasOrgAccess: hasAccess,
          workspaceAccess: newWorkspaceAccess
        };
      }
      return user;
    }));
  };

  const handleWorkspaceUserToggle = (workspaceId: string, userId: string, hasAccess: boolean) => {
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          workspaceAccess: {
            ...user.workspaceAccess,
            [workspaceId]: hasAccess
          }
        };
      }
      return user;
    }));
  };

  const handleAddWorkspace = async () => {
    if (!newWorkspaceName.trim() || !item) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspaceName.trim(),
          slug: newWorkspaceName.toLowerCase().replace(/\s+/g, '-'),
          organization_id: item.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      setWorkspaces(prev => [...prev, data]);
      setNewWorkspaceName('');
      setShowAddWorkspace(false);
      
      // Update users to include this workspace
      setUsers(prev => prev.map(user => ({
        ...user,
        workspaceAccess: {
          ...user.workspaceAccess,
          [data.id]: false
        }
      })));

      toast({
        title: "Succes",
        description: "Werkruimte succesvol toegevoegd",
      });
    } catch (error) {
      console.error('Error adding workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet toevoegen",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!confirm(`Weet je zeker dat je werkruimte "${workspaceName}" wilt verwijderen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      // Remove from local state
      setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
      
      // Update users to remove this workspace
      setUsers(prev => prev.map(user => {
        const newWorkspaceAccess = { ...user.workspaceAccess };
        delete newWorkspaceAccess[workspaceId];
        return {
          ...user,
          workspaceAccess: newWorkspaceAccess
        };
      }));

      toast({
        title: "Succes",
        description: `Werkruimte "${workspaceName}" verwijderd`,
      });
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const toggleWorkspaceExpanded = (workspaceId: string) => {
    setExpandedWorkspaces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workspaceId)) {
        newSet.delete(workspaceId);
      } else {
        newSet.add(workspaceId);
      }
      return newSet;
    });
  };

  const handleSave = async () => {
    if (!item || !name.trim()) {
      toast({
        title: "Fout",
        description: "Naam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      // Update organization name first
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          name: name.trim(),
          slug: name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Handle organization membership changes
      const currentOrgUsers = users.filter(u => u.hasOrgAccess);
      const removedOrgUsers = users.filter(u => !u.hasOrgAccess);

      // Remove users from organization (and all workspaces automatically via triggers)
      for (const user of removedOrgUsers) {
        await supabase
          .from('organization_members')
          .delete()
          .eq('organization_id', item.id)
          .eq('user_id', user.id);
      }

      // Add users to organization
      for (const user of currentOrgUsers) {
        const { error: orgMemberError } = await supabase
          .from('organization_members')
          .upsert({
            organization_id: item.id,
            user_id: user.id,
            role: 'member'
          }, {
            onConflict: 'organization_id,user_id'
          });

        if (orgMemberError) {
          console.error('Error managing organization member:', orgMemberError);
        }
      }

      // Handle workspace membership changes
      for (const workspace of workspaces) {
        const workspaceUsers = users.filter(u => u.workspaceAccess?.[workspace.id]);
        const removedWorkspaceUsers = users.filter(u => !u.workspaceAccess?.[workspace.id]);

        // Remove users from workspace
        for (const user of removedWorkspaceUsers) {
          await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', workspace.id)
            .eq('user_id', user.id);
        }

        // Add users to workspace
        for (const user of workspaceUsers) {
          // Only add if user is also in organization
          if (user.hasOrgAccess) {
            const { error: workspaceMemberError } = await supabase
              .from('workspace_members')
              .upsert({
                workspace_id: workspace.id,
                user_id: user.id,
                role: 'member'
              }, {
                onConflict: 'workspace_id,user_id'
              });

            if (workspaceMemberError) {
              console.error('Error managing workspace member:', workspaceMemberError);
            }
          }
        }
      }

      toast({
        title: "Succes",
        description: "Organisatie succesvol bijgewerkt",
      });

      await refreshData();
      setOpen(false);
      onSaved();
    } catch (error) {
      console.error('Error updating:', error);
      toast({
        title: "Fout",
        description: "Kon organisatie niet bijwerken",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Organisatie Beheren
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="organisatie" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="organisatie">Organisatie</TabsTrigger>
            <TabsTrigger value="werkruimtes">Werkruimtes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="organisatie" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Organisatie Details</Label>
            </div>
            <div>
              <Label htmlFor="name" className="text-sm">Organisatie Naam</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
                placeholder="Organisatie naam"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium">Organisatie Gebruikers</Label>
              <div className="max-h-64 overflow-y-auto border rounded-md p-3 mt-2 space-y-2">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Laden...</div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={`org-${user.id}`}
                        checked={user.hasOrgAccess}
                        onCheckedChange={(checked) => 
                          handleOrgUserToggle(user.id, checked as boolean)
                        }
                      />
                      <label 
                        htmlFor={`org-${user.id}`}
                        className="text-sm cursor-pointer flex-1"
                      >
                        {user.full_name || user.email}
                        {user.email !== user.full_name && (
                          <span className="text-muted-foreground ml-2">({user.email})</span>
                        )}
                      </label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="werkruimtes" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Werkruimtes</Label>
              <Button
                size="sm"
                onClick={() => setShowAddWorkspace(!showAddWorkspace)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Werkruimte Toevoegen
              </Button>
            </div>
            
            {showAddWorkspace && (
              <div className="flex gap-2 p-3 border rounded-md bg-muted/50">
                <Input
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Werkruimte naam"
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddWorkspace}>
                  Toevoegen
                </Button>
                <Button size="sm" variant="outline" onClick={() => setShowAddWorkspace(false)}>
                  Annuleren
                </Button>
              </div>
            )}
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-sm text-muted-foreground">Laden...</div>
              ) : workspaces.length === 0 ? (
                <div className="text-sm text-muted-foreground">Geen werkruimtes gevonden</div>
              ) : (
                workspaces.map((workspace) => (
                  <div key={workspace.id} className="border rounded-md">
                    <div className="flex items-center justify-between p-3 bg-muted/30">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleWorkspaceExpanded(workspace.id)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {expandedWorkspaces.has(workspace.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        <span className="font-medium">{workspace.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteWorkspace(workspace.id, workspace.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {expandedWorkspaces.has(workspace.id) && (
                      <div className="p-3 border-t">
                        <Label className="text-xs font-medium mb-2 block">Werkruimte Gebruikers</Label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {users.map((user) => (
                            <div key={user.id} className="flex items-center space-x-3">
                              <Checkbox
                                id={`ws-${workspace.id}-${user.id}`}
                                checked={user.workspaceAccess?.[workspace.id] || false}
                                disabled={!user.hasOrgAccess}
                                onCheckedChange={(checked) => 
                                  handleWorkspaceUserToggle(workspace.id, user.id, checked as boolean)
                                }
                              />
                              <label 
                                htmlFor={`ws-${workspace.id}-${user.id}`}
                                className={`text-sm cursor-pointer flex-1 ${
                                  !user.hasOrgAccess ? 'text-muted-foreground' : ''
                                }`}
                              >
                                {user.full_name || user.email}
                                {user.email !== user.full_name && (
                                  <span className="text-muted-foreground ml-2">({user.email})</span>
                                )}
                                {!user.hasOrgAccess && (
                                  <span className="text-xs text-muted-foreground ml-2">(niet in organisatie)</span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
