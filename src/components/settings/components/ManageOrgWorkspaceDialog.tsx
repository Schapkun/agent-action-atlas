
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

interface Organization {
  id: string;
  name: string;
  slug: string;
  workspaces?: any[];
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
  hasAccess?: boolean;
}

interface ManageOrgWorkspaceDialogProps {
  type: 'organization' | 'workspace';
  item?: Organization | Workspace | null;
  trigger: React.ReactNode;
  onSaved: () => void;
}

export const ManageOrgWorkspaceDialog = ({ type, item, trigger, onSaved }: ManageOrgWorkspaceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item?.name || '');
  const [users, setUsers] = useState<User[]>([]);
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
      fetchUsers();
    }
  }, [open, item]);

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

      // Get current members based on type
      let currentMembers: string[] = [];
      
      if (type === 'organization') {
        const { data: members, error: membersError } = await supabase
          .from('organization_members')
          .select('user_id')
          .eq('organization_id', item.id);
        
        if (membersError) throw membersError;
        currentMembers = members?.map(m => m.user_id) || [];
      } else {
        const { data: members, error: membersError } = await supabase
          .from('workspace_members')
          .select('user_id')
          .eq('workspace_id', item.id);
        
        if (membersError) throw membersError;
        currentMembers = members?.map(m => m.user_id) || [];
      }

      // Combine users with access info
      const usersWithAccess = allUsers?.map(user => ({
        ...user,
        hasAccess: currentMembers.includes(user.id)
      })) || [];

      setUsers(usersWithAccess);
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
      // Update name first
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

      // Handle membership changes
      const currentUsersWithAccess = users.filter(u => u.hasAccess);
      const currentUsersWithoutAccess = users.filter(u => !u.hasAccess);

      if (type === 'organization') {
        // For organization: handle org and workspace memberships
        for (const user of currentUsersWithoutAccess) {
          // Remove from organization
          await supabase
            .from('organization_members')
            .delete()
            .eq('organization_id', item.id)
            .eq('user_id', user.id);
        }

        for (const user of currentUsersWithAccess) {
          // Add to organization
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

          // Add to all workspaces in this organization
          const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id')
            .eq('organization_id', item.id);

          if (workspaces) {
            for (const workspace of workspaces) {
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
      } else {
        // For workspace: handle workspace membership only
        const workspace = item as Workspace;
        
        for (const user of currentUsersWithoutAccess) {
          await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', item.id)
            .eq('user_id', user.id);
        }

        for (const user of currentUsersWithAccess) {
          // First ensure they're in the parent organization
          if (workspace.organization_id) {
            const { error: orgMemberError } = await supabase
              .from('organization_members')
              .upsert({
                organization_id: workspace.organization_id,
                user_id: user.id,
                role: 'member'
              }, {
                onConflict: 'organization_id,user_id'
              });

            if (orgMemberError) {
              console.error('Error ensuring organization membership:', orgMemberError);
            }
          }

          // Then add to workspace
          const { error: workspaceMemberError } = await supabase
            .from('workspace_members')
            .upsert({
              workspace_id: item.id,
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

      toast({
        title: "Succes",
        description: `${type === 'organization' ? 'Organisatie' : 'Werkruimte'} succesvol bijgewerkt`,
      });

      // Refresh the organization context data
      await refreshData();
      
      setOpen(false);
      onSaved();
    } catch (error) {
      console.error('Error updating:', error);
      toast({
        title: "Fout",
        description: `Kon ${type === 'organization' ? 'organisatie' : 'werkruimte'} niet bijwerken`,
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
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>
            {type === 'organization' ? 'Organisatie' : 'Werkruimte'} Beheren
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Algemeen</TabsTrigger>
            <TabsTrigger value="users">Gebruikers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <div>
              <Label className="text-sm">Gebruikers Toegang</Label>
              <div className="max-h-64 overflow-y-auto border rounded-md p-4 mt-2 space-y-3">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Laden...</div>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={user.id}
                        checked={user.hasAccess}
                        onCheckedChange={(checked) => 
                          handleUserToggle(user.id, checked as boolean)
                        }
                      />
                      <label 
                        htmlFor={user.id}
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
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
