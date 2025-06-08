
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Edit, Trash2, Plus, Users } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  hasAccess?: boolean;
}

interface Workspace {
  id: string;
  name: string;
  organization_id: string;
  users?: User[];
}

interface Organization {
  id: string;
  name: string;
  workspaces: Workspace[];
  users?: User[];
}

interface ManageOrgWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  onUpdate: () => void;
}

export const ManageOrgWorkspaceDialog: React.FC<ManageOrgWorkspaceDialogProps> = ({
  isOpen,
  onClose,
  organization,
  onUpdate
}) => {
  const [orgName, setOrgName] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [originalWorkspaces, setOriginalWorkspaces] = useState<Workspace[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [orgUsers, setOrgUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [showAddWorkspace, setShowAddWorkspace] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (organization) {
      setOrgName(organization.name);
      fetchUsersAndAccess();
    }
  }, [organization]);

  // Reset workspace names when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset workspaces to their original state
      setWorkspaces(originalWorkspaces);
      setEditingWorkspace(null);
      setShowAddWorkspace(false);
      setNewWorkspaceName('');
    }
  }, [isOpen, originalWorkspaces]);

  const fetchUsersAndAccess = async () => {
    if (!organization) return;

    try {
      setLoading(true);
      
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (usersError) throw usersError;

      // Get ALL workspaces for this organization from the database
      const { data: allWorkspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select('id, name, organization_id')
        .eq('organization_id', organization.id)
        .order('name');

      if (workspacesError) throw workspacesError;

      console.log('Fetched workspaces from database:', allWorkspacesData);

      // Get organization members
      const { data: orgMembers, error: orgMembersError } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', organization.id);

      if (orgMembersError) throw orgMembersError;

      const orgMemberIds = orgMembers?.map(m => m.user_id) || [];
      
      // Set organization users with access info
      const usersWithOrgAccess = users?.map(user => ({
        ...user,
        hasAccess: orgMemberIds.includes(user.id)
      })) || [];

      setAllUsers(users || []);
      setOrgUsers(usersWithOrgAccess);

      // Get workspace members for each workspace
      const workspacesWithUsers = await Promise.all(
        (allWorkspacesData || []).map(async (workspace) => {
          const { data: wsMembers } = await supabase
            .from('workspace_members')
            .select('user_id')
            .eq('workspace_id', workspace.id);

          const wsMemberIds = wsMembers?.map(m => m.user_id) || [];
          const workspaceUsers = users?.map(user => ({
            ...user,
            hasAccess: wsMemberIds.includes(user.id)
          })) || [];

          return {
            ...workspace,
            users: workspaceUsers
          };
        })
      );

      console.log('Workspaces with users:', workspacesWithUsers);
      setWorkspaces(workspacesWithUsers);
      setOriginalWorkspaces(workspacesWithUsers); // Store original state
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

  const handleOrgUserToggle = (userId: string, hasAccess: boolean) => {
    setOrgUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, hasAccess } : user
    ));

    // If user is being removed from organization, also remove from all workspaces
    if (!hasAccess) {
      setWorkspaces(prev => prev.map(workspace => ({
        ...workspace,
        users: workspace.users?.map(user =>
          user.id === userId ? { ...user, hasAccess: false } : user
        ) || []
      })));
    }
  };

  const handleWorkspaceUserToggle = (workspaceId: string, userId: string, hasAccess: boolean) => {
    // Check if user has access to organization first
    const userHasOrgAccess = orgUsers.find(u => u.id === userId)?.hasAccess;
    if (!userHasOrgAccess && hasAccess) {
      toast({
        title: "Niet toegestaan",
        description: "Gebruiker moet eerst toegang hebben tot de organisatie",
        variant: "destructive",
      });
      return;
    }

    setWorkspaces(prev => prev.map(workspace => {
      if (workspace.id === workspaceId) {
        return {
          ...workspace,
          users: workspace.users?.map(user =>
            user.id === userId ? { ...user, hasAccess } : user
          ) || []
        };
      }
      return workspace;
    }));
  };

  const isUserDisabledForWorkspace = (userId: string) => {
    const userHasOrgAccess = orgUsers.find(u => u.id === userId)?.hasAccess;
    return !userHasOrgAccess;
  };

  const handleUpdateOrganization = async () => {
    if (!organization || !orgName.trim()) return;

    try {
      setLoading(true);

      // Update organization name
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          name: orgName.trim(),
          slug: orgName.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', organization.id);

      if (updateError) throw updateError;

      // Handle organization membership changes
      const usersWithAccess = orgUsers.filter(u => u.hasAccess);
      const usersWithoutAccess = orgUsers.filter(u => !u.hasAccess);

      // Remove users without access from organization AND all workspaces
      for (const user of usersWithoutAccess) {
        // Remove from organization
        await supabase
          .from('organization_members')
          .delete()
          .eq('organization_id', organization.id)
          .eq('user_id', user.id);

        // Remove from ALL workspaces in this organization
        for (const workspace of workspaces) {
          await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', workspace.id)
            .eq('user_id', user.id);
        }
      }

      // Add users with access
      for (const user of usersWithAccess) {
        const { error } = await supabase
          .from('organization_members')
          .upsert({
            organization_id: organization.id,
            user_id: user.id,
            role: 'member'
          }, {
            onConflict: 'organization_id,user_id'
          });

        if (error) {
          console.error('Error managing organization member:', error);
        }
      }

      // Don't show toast here - will be shown in handleSaveAll
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error; // Re-throw to be caught in handleSaveAll
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWorkspace = async (workspaceId: string, name: string) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: name.trim(),
          slug: name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', workspaceId);

      if (error) throw error;

      // Handle workspace membership
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace?.users) {
        const usersWithAccess = workspace.users.filter(u => u.hasAccess);
        const usersWithoutAccess = workspace.users.filter(u => !u.hasAccess);

        // Remove users without access
        for (const user of usersWithoutAccess) {
          await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', workspaceId)
            .eq('user_id', user.id);
        }

        // Add users with access
        for (const user of usersWithAccess) {
          // Ensure they're in the organization first
          await supabase
            .from('organization_members')
            .upsert({
              organization_id: organization!.id,
              user_id: user.id,
              role: 'member'
            }, {
              onConflict: 'organization_id,user_id'
            });

          // Then add to workspace
          const { error } = await supabase
            .from('workspace_members')
            .upsert({
              workspace_id: workspaceId,
              user_id: user.id,
              role: 'member'
            }, {
              onConflict: 'workspace_id,user_id'
            });

          if (error) {
            console.error('Error managing workspace member:', error);
          }
        }
      }

      // Update both current state and original state after successful save
      const updatedWorkspace = { ...workspaces.find(w => w.id === workspaceId)!, name: name.trim() };
      setWorkspaces(prev => prev.map(w => 
        w.id === workspaceId ? updatedWorkspace : w
      ));
      setOriginalWorkspaces(prev => prev.map(w => 
        w.id === workspaceId ? updatedWorkspace : w
      ));
      setEditingWorkspace(null);

      // Don't show toast here - will be shown in handleSaveAll
    } catch (error) {
      console.error('Error updating workspace:', error);
      throw error; // Re-throw to be caught in handleSaveAll
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

      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId));
      setOriginalWorkspaces(prev => prev.filter(w => w.id !== workspaceId));

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

  const handleAddWorkspace = async () => {
    if (!newWorkspaceName.trim() || !organization) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: newWorkspaceName.trim(),
          slug: newWorkspaceName.toLowerCase().replace(/\s+/g, '-'),
          organization_id: organization.id
        })
        .select()
        .single();

      if (error) throw error;

      const newWorkspace = {
        ...data,
        users: allUsers.map(user => ({ ...user, hasAccess: false }))
      };

      setWorkspaces(prev => [...prev, newWorkspace]);
      setOriginalWorkspaces(prev => [...prev, newWorkspace]);
      setNewWorkspaceName('');
      setShowAddWorkspace(false);

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

  const handleSaveAll = async () => {
    // Close popup immediately and show loading toast
    setLoading(true);
    onClose();
    
    toast({
      title: "Bezig met opslaan",
      description: "De wijzigingen worden verwerkt...",
    });

    try {
      // Update organization in background
      await handleUpdateOrganization();
      
      // Update all workspaces in background
      for (const workspace of workspaces) {
        if (workspace.users) {
          await handleUpdateWorkspace(workspace.id, workspace.name);
        }
      }

      // Show success message
      toast({
        title: "Succes",
        description: "De wijzigingen zijn opgeslagen",
      });

      // Update parent component
      onUpdate();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: "Error",
        description: "Kon wijzigingen niet opslaan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original state
    setWorkspaces(originalWorkspaces);
    setOrgName(organization?.name || '');
    setEditingWorkspace(null);
    setShowAddWorkspace(false);
    setNewWorkspaceName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Organisatie & Werkruimtes Beheren
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="organization" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="organization" className="text-sm">Organisatie</TabsTrigger>
              <TabsTrigger value="workspaces" className="text-sm">Werkruimtes</TabsTrigger>
            </TabsList>

            <TabsContent value="organization" className="flex-1 overflow-hidden mt-4">
              <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Organisatie Details</h3>
              
              <div className="h-[calc(100%-3rem)] overflow-hidden">
                <Card className="h-full">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="mb-4 flex-shrink-0">
                      <Label htmlFor="orgName" className="text-sm font-medium">Organisatie Naam</Label>
                      <Input
                        id="orgName"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <Label className="text-sm font-medium">Organisatie Gebruikers</Label>
                      <ScrollArea className="h-[calc(100%-1.5rem)] border rounded-md p-3 mt-2">
                        <div className="space-y-2">
                          {loading ? (
                            <div className="text-sm text-muted-foreground">Laden...</div>
                          ) : (
                            orgUsers.map((user) => (
                              <div key={user.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`org-${user.id}`}
                                  checked={user.hasAccess}
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
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="workspaces" className="flex-1 overflow-hidden mt-4">
              <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="text-lg font-semibold">Werkruimtes</h3>
                {!showAddWorkspace && (
                  <Button onClick={() => setShowAddWorkspace(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Werkruimte Toevoegen
                  </Button>
                )}
              </div>

              <div className="h-[calc(100%-4.5rem)] overflow-hidden flex flex-col">
                {showAddWorkspace && (
                  <Card className="mb-3 flex-shrink-0">
                    <CardContent className="p-4">
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Werkruimte naam"
                          value={newWorkspaceName}
                          onChange={(e) => setNewWorkspaceName(e.target.value)}
                        />
                        <Button onClick={handleAddWorkspace} size="sm">
                          Toevoegen
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setShowAddWorkspace(false)}
                          size="sm"
                        >
                          Annuleren
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-3 pr-2">
                    {loading ? (
                      <div className="text-sm text-muted-foreground">Werkruimtes laden...</div>
                    ) : workspaces.length === 0 ? (
                      <Card>
                        <CardContent className="p-4 text-center text-sm text-muted-foreground">
                          Geen werkruimtes gevonden voor deze organisatie.
                        </CardContent>
                      </Card>
                    ) : (
                      workspaces.map((workspace) => (
                        <Card key={workspace.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              {editingWorkspace === workspace.id ? (
                                <div className="flex space-x-2 flex-1">
                                  <Input
                                    value={workspace.name}
                                    onChange={(e) => setWorkspaces(prev => 
                                      prev.map(w => w.id === workspace.id ? {...w, name: e.target.value} : w)
                                    )}
                                    className="flex-1"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateWorkspace(workspace.id, workspace.name)}
                                  >
                                    Opslaan
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      // Reset to original name when canceling edit
                                      const originalWorkspace = originalWorkspaces.find(w => w.id === workspace.id);
                                      if (originalWorkspace) {
                                        setWorkspaces(prev => prev.map(w => 
                                          w.id === workspace.id ? {...w, name: originalWorkspace.name} : w
                                        ));
                                      }
                                      setEditingWorkspace(null);
                                    }}
                                  >
                                    Annuleren
                                  </Button>
                                </div>
                              ) : (
                                <>
                                  <CardTitle className="text-base">{workspace.name}</CardTitle>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingWorkspace(workspace.id)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteWorkspace(workspace.id, workspace.name)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Werkruimte Gebruikers
                              </Label>
                              <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
                                {workspace.users?.map((user) => {
                                  const isDisabled = isUserDisabledForWorkspace(user.id);
                                  return (
                                    <div key={user.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`ws-${workspace.id}-${user.id}`}
                                        checked={user.hasAccess}
                                        disabled={isDisabled}
                                        onCheckedChange={(checked) => 
                                          handleWorkspaceUserToggle(workspace.id, user.id, checked as boolean)
                                        }
                                      />
                                      <label 
                                        htmlFor={`ws-${workspace.id}-${user.id}`}
                                        className={`text-sm cursor-pointer flex-1 ${
                                          isDisabled ? 'text-muted-foreground opacity-50' : ''
                                        }`}
                                      >
                                        {user.full_name || user.email}
                                        {isDisabled && (
                                          <span className="ml-1 text-red-500">(Eerst organisatie toegang vereist)</span>
                                        )}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleCancel}>
            Annuleren
          </Button>
          <Button onClick={handleSaveAll} disabled={loading}>
            {loading ? 'Opslaan...' : 'Alles Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
