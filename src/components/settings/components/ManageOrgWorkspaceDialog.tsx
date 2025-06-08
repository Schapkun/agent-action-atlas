
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { OrganizationTab } from './OrganizationTab';
import { WorkspacesTab } from './WorkspacesTab';

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
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        const newWorkspaceAccess = { ...user.workspaceAccess };
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

  const handleEditOrganization = async (newName: string) => {
    if (!item) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: newName,
          slug: newName.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', item.id);

      if (error) throw error;

      setName(newName);

      toast({
        title: "Succes",
        description: "Organisatie naam bijgewerkt",
      });
    } catch (error) {
      console.error('Error updating organization name:', error);
      toast({
        title: "Error",
        description: "Kon organisatie naam niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrganization = async () => {
    if (!item || !confirm(`Weet je zeker dat je organisatie "${item.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Organisatie "${item.name}" verwijderd`,
      });

      await refreshData();
      setOpen(false);
      onSaved();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const handleAddWorkspace = async (workspaceName: string) => {
    if (!item) return;

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: workspaceName,
          slug: workspaceName.toLowerCase().replace(/\s+/g, '-'),
          organization_id: item.id
        })
        .select()
        .single();

      if (error) throw error;

      setWorkspaces(prev => [...prev, data]);
      
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

  const handleEditWorkspace = async (workspaceId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: newName,
          slug: newName.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', workspaceId);

      if (error) throw error;

      setWorkspaces(prev => prev.map(ws => 
        ws.id === workspaceId 
          ? { ...ws, name: newName }
          : ws
      ));

      toast({
        title: "Succes",
        description: "Werkruimte naam bijgewerkt",
      });
    } catch (error) {
      console.error('Error updating workspace name:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte naam niet bijwerken",
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

      setWorkspaces(prev => prev.filter(ws => ws.id !== workspaceId));
      
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

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg">
            Organisatie Beheren
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="organisatie" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="organisatie">Organisatie</TabsTrigger>
              <TabsTrigger value="werkruimtes">Werkruimtes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="organisatie" className="flex-1 overflow-hidden">
              <OrganizationTab
                organization={item}
                users={users}
                loading={loading}
                onEditOrganization={handleEditOrganization}
                onDeleteOrganization={handleDeleteOrganization}
                onUserToggle={handleOrgUserToggle}
              />
            </TabsContent>
            
            <TabsContent value="werkruimtes" className="flex-1 overflow-hidden">
              <WorkspacesTab
                workspaces={workspaces}
                users={users}
                loading={loading}
                onAddWorkspace={handleAddWorkspace}
                onEditWorkspace={handleEditWorkspace}
                onDeleteWorkspace={handleDeleteWorkspace}
                onUserToggle={handleWorkspaceUserToggle}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-shrink-0 flex justify-end space-x-2 pt-4 border-t bg-background">
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
