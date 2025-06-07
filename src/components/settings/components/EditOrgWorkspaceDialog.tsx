import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Trash2, Edit } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  hasAccess?: boolean;
  workspaceAccess?: { [workspaceId: string]: boolean };
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  organization_id: string;
}

interface EditOrgWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'organization' | 'workspace';
  item: {
    id: string;
    name: string;
    organization_id?: string;
    workspaces?: Workspace[];
  } | null;
  onUpdate: () => void;
}

export const EditOrgWorkspaceDialog: React.FC<EditOrgWorkspaceDialogProps> = ({
  isOpen,
  onClose,
  type,
  item,
  onUpdate
}) => {
  const [name, setName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setName(item.name);
      if (type === 'organization') {
        setWorkspaces(item.workspaces || []);
      }
      fetchUsers();
    }
  }, [item, type]);

  const fetchUsers = async () => {
    if (!item) return;

    try {
      setLoading(true);
      
      // Get all users from profiles
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (usersError) throw usersError;

      if (type === 'organization') {
        // For organization: get organization members and their workspace access
        const { data: orgMembers, error: orgMembersError } = await supabase
          .from('organization_members')
          .select('user_id')
          .eq('organization_id', item.id);
        
        if (orgMembersError) throw orgMembersError;
        const orgMemberIds = orgMembers?.map(m => m.user_id) || [];

        // Get workspace memberships for all users in this organization
        const { data: workspaceMembers, error: workspaceMembersError } = await supabase
          .from('workspace_members')
          .select('user_id, workspace_id')
          .in('workspace_id', workspaces.map(w => w.id));

        if (workspaceMembersError) throw workspaceMembersError;

        // Build user data with workspace access info
        const usersWithAccess = allUsers?.map(user => {
          const workspaceAccess: { [workspaceId: string]: boolean } = {};
          workspaces.forEach(workspace => {
            workspaceAccess[workspace.id] = workspaceMembers?.some(
              wm => wm.user_id === user.id && wm.workspace_id === workspace.id
            ) || false;
          });

          return {
            ...user,
            hasAccess: orgMemberIds.includes(user.id),
            workspaceAccess
          };
        }) || [];

        setUsers(usersWithAccess);
      } else {
        // For workspace: get workspace members only
        const { data: members, error: membersError } = await supabase
          .from('workspace_members')
          .select('user_id')
          .eq('workspace_id', item.id);
        
        if (membersError) throw membersError;
        const currentMembers = members?.map(m => m.user_id) || [];

        const usersWithAccess = allUsers?.map(user => ({
          ...user,
          hasAccess: currentMembers.includes(user.id)
        })) || [];

        setUsers(usersWithAccess);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Kon gebruikers niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: string, hasAccess: boolean) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, hasAccess } : user
    ));
  };

  const handleWorkspaceToggle = (userId: string, workspaceId: string, hasAccess: boolean) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            workspaceAccess: {
              ...user.workspaceAccess,
              [workspaceId]: hasAccess
            }
          } 
        : user
    ));
  };

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim() || !item) return;

    try {
      const slug = newWorkspaceName.toLowerCase().replace(/\s+/g, '-');
      
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspaceName.trim(),
          slug: slug,
          organization_id: item.id
        })
        .select()
        .single();

      if (error) throw error;

      setWorkspaces(prev => [...prev, data]);
      setNewWorkspaceName('');
      
      toast({
        title: "Succes",
        description: "Werkruimte aangemaakt",
      });
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const handleUpdateWorkspace = async (workspaceId: string) => {
    if (!editWorkspaceName.trim()) return;

    try {
      const slug = editWorkspaceName.toLowerCase().replace(/\s+/g, '-');
      
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: editWorkspaceName.trim(),
          slug: slug
        })
        .eq('id', workspaceId);

      if (error) throw error;

      setWorkspaces(prev => prev.map(ws => 
        ws.id === workspaceId 
          ? { ...ws, name: editWorkspaceName.trim() }
          : ws
      ));
      
      setEditingWorkspace(null);
      setEditWorkspaceName('');
      
      toast({
        title: "Succes",
        description: "Werkruimte bijgewerkt",
      });
    } catch (error) {
      console.error('Error updating workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkspace = async (workspaceId: string, workspaceName: string) => {
    if (!confirm(`Weet je zeker dat je werkruimte "${workspaceName}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
      
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

  const handleSave = async () => {
    if (!item || !name.trim()) return;

    try {
      setLoading(true);

      // Update name
      if (type === 'organization') {
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            name: name.trim(),
            slug: name.toLowerCase().replace(/\s+/g, '-')
          })
          .eq('id', item.id);

        if (updateError) throw updateError;
      } else {
        const { error: updateError } = await supabase
          .from('workspaces')
          .update({
            name: name.trim(),
            slug: name.toLowerCase().replace(/\s+/g, '-')
          })
          .eq('id', item.id);

        if (updateError) throw updateError;
      }

      if (type === 'organization') {
        // Handle organization and workspace memberships
        for (const user of users) {
          if (user.hasAccess) {
            // Add to organization
            await supabase
              .from('organization_members')
              .upsert({
                organization_id: item.id,
                user_id: user.id,
                role: 'member'
              });

            // Handle workspace memberships
            for (const workspace of workspaces) {
              const hasWorkspaceAccess = user.workspaceAccess?.[workspace.id] || false;
              
              if (hasWorkspaceAccess) {
                // Add to workspace
                await supabase
                  .from('workspace_members')
                  .upsert({
                    workspace_id: workspace.id,
                    user_id: user.id,
                    role: 'member'
                  });
              } else {
                // Remove from workspace
                await supabase
                  .from('workspace_members')
                  .delete()
                  .eq('workspace_id', workspace.id)
                  .eq('user_id', user.id);
              }
            }
          } else {
            // Remove from organization and all workspaces
            await supabase
              .from('organization_members')
              .delete()
              .eq('organization_id', item.id)
              .eq('user_id', user.id);

            for (const workspace of workspaces) {
              await supabase
                .from('workspace_members')
                .delete()
                .eq('workspace_id', workspace.id)
                .eq('user_id', user.id);
            }
          }
        }
      } else {
        // Handle workspace memberships only
        const usersWithAccess = users.filter(u => u.hasAccess).map(u => u.id);
        const usersWithoutAccess = users.filter(u => !u.hasAccess).map(u => u.id);

        if (usersWithoutAccess.length > 0) {
          await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', item.id)
            .in('user_id', usersWithoutAccess);
        }

        for (const userId of usersWithAccess) {
          await supabase
            .from('workspace_members')
            .upsert({
              workspace_id: item.id,
              user_id: userId,
              role: 'member'
            });

          // Also ensure they're in the parent organization
          if (item.organization_id) {
            await supabase
              .from('organization_members')
              .upsert({
                organization_id: item.organization_id,
                user_id: userId,
                role: 'member'
              });
          }
        }
      }

      toast({
        title: "Succes",
        description: `${type === 'organization' ? 'Organisatie' : 'Werkruimte'} succesvol bijgewerkt`,
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating:', error);
      toast({
        title: "Error",
        description: `Kon ${type === 'organization' ? 'organisatie' : 'werkruimte'} niet bijwerken`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {type === 'organization' ? 'Organisatie' : 'Werkruimte'} Bewerken
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Name Section */}
          <div>
            <Label htmlFor="name" className="text-sm">Naam</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              placeholder={`${type === 'organization' ? 'Organisatie' : 'Werkruimte'} naam`}
            />
          </div>

          {/* Workspaces Section - Only for Organizations */}
          {type === 'organization' && (
            <div>
              <Label className="text-sm">Werkruimtes</Label>
              <div className="border rounded-md p-3 mt-1 space-y-3">
                {/* Existing Workspaces */}
                {workspaces.map((workspace) => (
                  <div key={workspace.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    {editingWorkspace === workspace.id ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <Input
                          value={editWorkspaceName}
                          onChange={(e) => setEditWorkspaceName(e.target.value)}
                          className="flex-1"
                        />
                        <Button size="sm" onClick={() => handleUpdateWorkspace(workspace.id)}>
                          Opslaan
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setEditingWorkspace(null);
                            setEditWorkspaceName('');
                          }}
                        >
                          Annuleren
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1">{workspace.name}</span>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingWorkspace(workspace.id);
                              setEditWorkspaceName(workspace.name);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWorkspace(workspace.id, workspace.name)}
                            className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                {/* Add New Workspace */}
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Input
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Nieuwe werkruimte naam"
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}>
                    <Plus className="h-3 w-3 mr-1" />
                    Toevoegen
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Users Section */}
          <div>
            <Label className="text-sm">Gebruikers</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2 mt-1 space-y-2">
              {loading ? (
                <div className="text-sm text-muted-foreground">Laden...</div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="space-y-2">
                    {/* Main user checkbox */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={user.id}
                        checked={user.hasAccess}
                        onCheckedChange={(checked) => 
                          handleUserToggle(user.id, checked as boolean)
                        }
                      />
                      <label 
                        htmlFor={user.id}
                        className="text-sm cursor-pointer flex-1 font-medium"
                      >
                        {user.full_name || user.email}
                        {user.email !== user.full_name && (
                          <span className="text-muted-foreground ml-2">({user.email})</span>
                        )}
                      </label>
                    </div>
                    
                    {/* Workspace checkboxes - Only for organizations and when user has access */}
                    {type === 'organization' && user.hasAccess && workspaces.length > 0 && (
                      <div className="ml-6 space-y-1">
                        {workspaces.map((workspace) => (
                          <div key={workspace.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${user.id}-${workspace.id}`}
                              checked={user.workspaceAccess?.[workspace.id] || false}
                              onCheckedChange={(checked) => 
                                handleWorkspaceToggle(user.id, workspace.id, checked as boolean)
                              }
                            />
                            <label 
                              htmlFor={`${user.id}-${workspace.id}`}
                              className="text-xs cursor-pointer text-muted-foreground"
                            >
                              {workspace.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Annuleren
            </Button>
            <Button size="sm" onClick={handleSave} disabled={loading}>
              {loading ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
