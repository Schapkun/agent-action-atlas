
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  full_name: string;
  hasAccess?: boolean;
}

interface EditOrgWorkspaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'organization' | 'workspace';
  item: {
    id: string;
    name: string;
    organization_id?: string;
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
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setName(item.name);
      fetchUsers();
    }
  }, [item]);

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

      // Update user memberships
      const usersWithAccess = users.filter(u => u.hasAccess).map(u => u.id);
      const usersWithoutAccess = users.filter(u => !u.hasAccess).map(u => u.id);

      if (type === 'organization') {
        // Remove users who should not have access
        if (usersWithoutAccess.length > 0) {
          await supabase
            .from('organization_members')
            .delete()
            .eq('organization_id', item.id)
            .in('user_id', usersWithoutAccess);
        }

        // Add users who should have access
        for (const userId of usersWithAccess) {
          const { error: insertError } = await supabase
            .from('organization_members')
            .upsert({
              organization_id: item.id,
              user_id: userId,
              role: 'member'
            });
          
          if (insertError) {
            console.error('Error adding organization member:', insertError);
          }

          // If user is added to organization, add them to ALL workspaces in that organization
          const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id')
            .eq('organization_id', item.id);

          if (workspaces) {
            for (const workspace of workspaces) {
              await supabase
                .from('workspace_members')
                .upsert({
                  workspace_id: workspace.id,
                  user_id: userId,
                  role: 'member'
                });
            }
          }
        }

        // Remove users from all workspaces when removed from organization
        if (usersWithoutAccess.length > 0) {
          const { data: workspaces } = await supabase
            .from('workspaces')
            .select('id')
            .eq('organization_id', item.id);

          if (workspaces) {
            for (const workspace of workspaces) {
              await supabase
                .from('workspace_members')
                .delete()
                .eq('workspace_id', workspace.id)
                .in('user_id', usersWithoutAccess);
            }
          }
        }
      } else {
        // For workspace: manage workspace members only
        if (usersWithoutAccess.length > 0) {
          await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', item.id)
            .in('user_id', usersWithoutAccess);
        }

        for (const userId of usersWithAccess) {
          // Add to workspace
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
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {type === 'organization' ? 'Organisatie' : 'Werkruimte'} Bewerken
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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

          <div>
            <Label className="text-sm">Gebruikers</Label>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2 mt-1 space-y-2">
              {loading ? (
                <div className="text-sm text-muted-foreground">Laden...</div>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
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
