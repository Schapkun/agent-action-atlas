
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus } from 'lucide-react';

interface InviteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string) => Promise<void>;
}

interface Organization {
  id: string;
  name: string;
}

interface Workspace {
  id: string;
  name: string;
  organization_id: string;
}

export const InviteUserDialog = ({ isOpen, onOpenChange, onInvite }: InviteUserDialogProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchOrganizations();
      fetchWorkspaces();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedOrganization) {
      const filtered = workspaces.filter(ws => ws.organization_id === selectedOrganization);
      setFilteredWorkspaces(filtered);
      setSelectedWorkspace(''); // Reset workspace selection when organization changes
    } else {
      setFilteredWorkspaces([]);
      setSelectedWorkspace('');
    }
  }, [selectedOrganization, workspaces]);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, organization_id')
        .order('name');

      if (error) throw error;
      setWorkspaces(data || []);
    } catch (error) {
      console.error('Error fetching workspaces:', error);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !selectedOrganization) {
      toast({
        title: "Error",
        description: "Vul alle verplichte velden in",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create invitation
      const invitationData = {
        email: inviteEmail,
        role: selectedRole,
        organization_id: selectedOrganization,
        workspace_id: selectedWorkspace || null,
        invited_by: user?.id
      };

      const { data, error } = await supabase
        .from('user_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) throw error;

      // Log the invitation
      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: selectedOrganization,
          workspace_id: selectedWorkspace || null,
          action: 'Gebruiker uitgenodigd',
          details: {
            email: inviteEmail,
            role: selectedRole,
            invitation_id: data.id
          }
        });

      toast({
        title: "Uitnodiging verzonden",
        description: `Uitnodiging verzonden naar ${inviteEmail}`,
      });

      // Reset form
      setInviteEmail('');
      setSelectedRole('member');
      setSelectedOrganization('');
      setSelectedWorkspace('');
      onOpenChange(false);

      // Call the original onInvite if needed
      await onInvite(inviteEmail);
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet verzenden",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Gebruiker Uitnodigen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Gebruiker Uitnodigen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="invite-email" className="text-sm">E-mailadres *</Label>
            <Input
              id="invite-email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Voer e-mailadres in"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="invite-role" className="text-sm">Rol *</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecteer rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Gebruiker</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="owner">Eigenaar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="invite-organization" className="text-sm">Organisatie *</Label>
            <Select value={selectedOrganization} onValueChange={setSelectedOrganization}>
              <SelectTrigger className="mt-1">
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

          {selectedOrganization && filteredWorkspaces.length > 0 && (
            <div>
              <Label htmlFor="invite-workspace" className="text-sm">Werkruimte (optioneel)</Label>
              <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecteer werkruimte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Geen specifieke werkruimte</SelectItem>
                  {filteredWorkspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button size="sm" onClick={handleInvite}>
              Uitnodigen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
