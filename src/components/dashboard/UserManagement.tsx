
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, UserPlus, Edit, Trash, Send } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Member {
  id: string;
  user_id: string;
  role: string;
  email?: string;
  full_name?: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
}

export const UserManagement = () => {
  const { user } = useAuth();
  const { currentOrganization, currentWorkspace } = useOrganization();
  const { toast } = useToast();
  
  const [orgMembers, setOrgMembers] = useState<Member[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(false);

  const fetchOrgMembers = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      const formattedMembers = data?.map(member => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        email: member.profiles?.email,
        full_name: member.profiles?.full_name
      })) || [];

      setOrgMembers(formattedMembers);
    } catch (error: any) {
      console.error('Error fetching organization members:', error);
      toast({
        title: "Error",
        description: "Kon organisatieleden niet laden.",
        variant: "destructive",
      });
    }
  };

  const fetchWorkspaceMembers = async () => {
    if (!currentWorkspace) return;

    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .eq('workspace_id', currentWorkspace.id);

      if (error) throw error;

      const formattedMembers = data?.map(member => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        email: member.profiles?.email,
        full_name: member.profiles?.full_name
      })) || [];

      setWorkspaceMembers(formattedMembers);
    } catch (error: any) {
      console.error('Error fetching workspace members:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte leden niet laden.",
        variant: "destructive",
      });
    }
  };

  const fetchInvitations = async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .is('accepted_at', null);

      if (error) throw error;
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim() || !currentOrganization || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_invitations')
        .insert([{
          email: inviteEmail,
          organization_id: currentOrganization.id,
          workspace_id: currentWorkspace?.id || null,
          role: inviteRole,
          invited_by: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Uitnodiging verzonden",
        description: `Uitnodiging is verzonden naar ${inviteEmail}.`,
      });

      setInviteEmail('');
      setInviteRole('member');
      setShowInviteForm(false);
      fetchInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet verzenden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string, isWorkspace: boolean = false) => {
    try {
      const table = isWorkspace ? 'workspace_members' : 'organization_members';
      const { error } = await supabase
        .from(table)
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Rol bijgewerkt",
        description: "De gebruikersrol is succesvol bijgewerkt.",
      });

      if (isWorkspace) {
        fetchWorkspaceMembers();
      } else {
        fetchOrgMembers();
      }
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Kon rol niet bijwerken.",
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string, isWorkspace: boolean = false) => {
    try {
      const table = isWorkspace ? 'workspace_members' : 'organization_members';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Gebruiker verwijderd",
        description: "De gebruiker is succesvol verwijderd.",
      });

      if (isWorkspace) {
        fetchWorkspaceMembers();
      } else {
        fetchOrgMembers();
      }
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Kon gebruiker niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOrgMembers();
    fetchInvitations();
  }, [currentOrganization]);

  useEffect(() => {
    fetchWorkspaceMembers();
  }, [currentWorkspace]);

  return (
    <div className="space-y-6">
      {/* Organization Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organisatie Leden
              </CardTitle>
              <CardDescription>
                Beheer leden van {currentOrganization?.name}
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowInviteForm(!showInviteForm)}
              size="sm"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Gebruiker Uitnodigen
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showInviteForm && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="inviteEmail">Email Adres</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="gebruiker@voorbeeld.nl"
                  />
                </div>
                <div>
                  <Label htmlFor="inviteRole">Rol</Label>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Lid</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Eigenaar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={sendInvitation} 
                    disabled={loading || !inviteEmail.trim()}
                    size="sm"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Uitnodiging Verzenden
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowInviteForm(false)} 
                    size="sm"
                  >
                    Annuleren
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-3">
            {orgMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="font-medium">{member.full_name || member.email}</div>
                    <div className="text-sm text-muted-foreground">{member.email}</div>
                  </div>
                  <Badge variant="secondary">{member.role}</Badge>
                </div>
                <div className="flex gap-2">
                  <Select 
                    value={member.role} 
                    onValueChange={(role) => updateMemberRole(member.id, role)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Lid</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Eigenaar</SelectItem>
                    </SelectContent>
                  </Select>
                  {member.user_id !== user?.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workspace Members */}
      {currentWorkspace && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Werkruimte Leden
            </CardTitle>
            <CardDescription>
              Beheer leden van {currentWorkspace.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {workspaceMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{member.full_name || member.email}</div>
                      <div className="text-sm text-muted-foreground">{member.email}</div>
                    </div>
                    <Badge variant="secondary">{member.role}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={member.role} 
                      onValueChange={(role) => updateMemberRole(member.id, role, true)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Lid</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    {member.user_id !== user?.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeMember(member.id, true)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Openstaande Uitnodigingen
            </CardTitle>
            <CardDescription>
              Uitnodigingen die nog niet zijn geaccepteerd
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Uitgenodigd als {invitation.role}
                      </div>
                    </div>
                    <Badge variant="outline">Wachtend</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Verloopt: {new Date(invitation.expires_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
