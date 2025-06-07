import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

type UserRole = 'owner' | 'admin' | 'member';

export const InviteUserDialog = ({ isOpen, onOpenChange, onInvite }: InviteUserDialogProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('member');
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [filteredWorkspaces, setFilteredWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      setFilteredWorkspaces(workspaces); // Show all workspaces when no organization is selected
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

    setIsLoading(true);
    
    try {
      console.log('Starting invitation process for:', inviteEmail);

      // Create invitation with proper typing
      const invitationData: {
        email: string;
        role: UserRole;
        organization_id: string;
        workspace_id: string | null;
        invited_by: string;
      } = {
        email: inviteEmail,
        role: selectedRole,
        organization_id: selectedOrganization,
        workspace_id: selectedWorkspace === 'none' ? null : (selectedWorkspace || null),
        invited_by: user?.id || ''
      };

      const { data, error } = await supabase
        .from('user_invitations')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        throw error;
      }

      console.log('Invitation created successfully:', data);

      // Get organization and workspace details for the email
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', selectedOrganization)
        .single();

      const { data: inviterData } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user?.id)
        .single();

      // Send invitation email using the edge function
      console.log('Calling send-invitation-email edge function...');
      
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-invitation-email', {
        body: {
          email: inviteEmail,
          organization_name: orgData?.name || 'Onbekende Organisatie',
          role: selectedRole === 'owner' ? 'eigenaar' : selectedRole === 'admin' ? 'admin' : 'gebruiker',
          invited_by_name: inviterData?.full_name || inviterData?.email || 'Onbekend',
          signup_url: window.location.origin + '/register'
        }
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Don't throw here - the invitation is created, just email failed
        toast({
          title: "Uitnodiging aangemaakt",
          description: `Uitnodiging voor ${inviteEmail} is aangemaakt, maar email kon niet worden verzonden. Neem contact op met de gebruiker.`,
          variant: "destructive",
        });
      } else {
        console.log('Invitation email sent successfully:', emailResponse);
        toast({
          title: "Uitnodiging verzonden",
          description: `Uitnodiging succesvol verzonden naar ${inviteEmail}`,
        });
      }

      // Log the invitation
      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: selectedOrganization,
          workspace_id: selectedWorkspace === 'none' ? null : (selectedWorkspace || null),
          action: 'Gebruiker uitgenodigd',
          details: {
            email: inviteEmail,
            role: selectedRole,
            invitation_id: data.id,
            email_sent: !emailError
          }
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
        description: "Kon uitnodiging niet verzenden. Probeer opnieuw.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="invite-role" className="text-sm">Rol *</Label>
            <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)} disabled={isLoading}>
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
            <Select value={selectedOrganization} onValueChange={setSelectedOrganization} disabled={isLoading}>
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

          <div>
            <Label htmlFor="invite-workspace" className="text-sm">Werkruimte (optioneel)</Label>
            <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace} disabled={isLoading}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecteer werkruimte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Geen specifieke werkruimte</SelectItem>
                {filteredWorkspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Annuleren
            </Button>
            <Button size="sm" onClick={handleInvite} disabled={isLoading}>
              {isLoading ? 'Bezig...' : 'Uitnodigen'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
