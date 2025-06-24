
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Save } from 'lucide-react';
import { SenderEmailField } from './SenderEmailField';

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
    sender_email?: string;
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
  const [senderEmail, setSenderEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (item) {
      setName(item.name);
      setSenderEmail(item.sender_email || '');
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

      // Update name and sender email
      if (type === 'organization') {
        // For organization, we update organization_settings table for sender email
        const { error: updateError } = await supabase
          .from('organizations')
          .update({
            name: name.trim(),
            slug: name.toLowerCase().replace(/\s+/g, '-')
          })
          .eq('id', item.id);

        if (updateError) throw updateError;

        // Update organization settings with sender email
        if (senderEmail.trim()) {
          const { error: settingsError } = await supabase
            .from('organization_settings')
            .upsert({
              organization_id: item.id,
              company_email: senderEmail.trim()
            }, {
              onConflict: 'organization_id'
            });

          if (settingsError) throw settingsError;
        }
      } else {
        // For workspace, update both name and sender_email
        const { error: updateError } = await supabase
          .from('workspaces')
          .update({
            name: name.trim(),
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            sender_email: senderEmail.trim() || null
          })
          .eq('id', item.id);

        if (updateError) throw updateError;
      }

      // Handle membership changes more carefully
      const currentUsersWithAccess = users.filter(u => u.hasAccess);
      const currentUsersWithoutAccess = users.filter(u => !u.hasAccess);

      if (type === 'organization') {
        // For organization: handle org and workspace memberships
        for (const user of currentUsersWithoutAccess) {
          // Remove from organization (this will cascade to workspaces via database triggers)
          await supabase
            .from('organization_members')
            .delete()
            .eq('organization_id', item.id)
            .eq('user_id', user.id);
        }

        for (const user of currentUsersWithAccess) {
          // Use upsert with proper conflict handling
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
            // Don't throw, just log - user might already be a member
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
                // Don't throw, just log
              }
            }
          }
        }
      } else {
        // For workspace: handle workspace membership only
        for (const user of currentUsersWithoutAccess) {
          await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', item.id)
            .eq('user_id', user.id);
        }

        for (const user of currentUsersWithAccess) {
          // First ensure they're in the parent organization
          if (item.organization_id) {
            const { error: orgMemberError } = await supabase
              .from('organization_members')
              .upsert({
                organization_id: item.organization_id,
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

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg">
            {type === 'organization' ? 'Organisatie' : 'Werkruimte'} Bewerken
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Annuleren
            </Button>
            <Button size="sm" onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Opslaan...' : 'Opslaan'}
            </Button>
          </div>
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
            <SenderEmailField
              value={senderEmail}
              onChange={setSenderEmail}
              label={type === 'organization' ? 'Organisatie E-mailadres' : 'Werkruimte E-mailadres'}
              description={
                type === 'organization' 
                  ? 'Dit emailadres wordt gebruikt als standaard voor alle e-mails vanuit deze organisatie'
                  : 'Dit emailadres wordt gebruikt voor e-mails vanuit deze werkruimte. Laat leeg om het organisatie emailadres te gebruiken.'
              }
              placeholder={type === 'organization' ? 'info@uwbedrijf.nl' : 'werkruimte@uwbedrijf.nl'}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
