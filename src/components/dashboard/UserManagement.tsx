import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, UserPlus, Edit, Trash, Send, AlertCircle } from 'lucide-react';
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
      console.log('Fetching organization members for:', currentOrganization.id);
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          user_id,
          role
        `)
        .eq('organization_id', currentOrganization.id);

      console.log('Organization members query result:', { data, error });

      if (error) {
        console.error('Error fetching organization members:', error);
        if (error.message.includes('policy')) {
          console.log('Policy error - user might not have permission to view members');
          setOrgMembers([]);
          return;
        }
        throw error;
      }

      // Now fetch profile data separately for each member
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', member.user_id)
              .single();

            return {
              id: member.id,
              user_id: member.user_id,
              role: member.role,
              email: profile?.email,
              full_name: profile?.full_name
            };
          } catch (profileError) {
            console.error('Error fetching profile for user:', member.user_id, profileError);
            return {
              id: member.id,
              user_id: member.user_id,
              role: member.role,
              email: 'Unknown',
              full_name: 'Unknown User'
            };
          }
        })
      );

      console.log('Final organization members with profiles:', membersWithProfiles);
      setOrgMembers(membersWithProfiles);
    } catch (error: any) {
      console.error('Error fetching organization members:', error);
      toast({
        title: "Error",
        description: "Kon organisatieleden niet laden: " + error.message,
        variant: "destructive",
      });
    }
  };

  const fetchWorkspaceMembers = async () => {
    if (!currentWorkspace) return;

    try {
      console.log('Fetching workspace members for:', currentWorkspace.id);
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role
        `)
        .eq('workspace_id', currentWorkspace.id);

      console.log('Workspace members query result:', { data, error });

      if (error) {
        console.error('Error fetching workspace members:', error);
        if (error.message.includes('policy')) {
          console.log('Policy error - user might not have permission to view workspace members');
          setWorkspaceMembers([]);
          return;
        }
        throw error;
      }

      // Now fetch profile data separately for each member
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', member.user_id)
              .single();

            return {
              id: member.id,
              user_id: member.user_id,
              role: member.role,
              email: profile?.email,
              full_name: profile?.full_name
            };
          } catch (profileError) {
            console.error('Error fetching profile for user:', member.user_id, profileError);
            return {
              id: member.id,
              user_id: member.user_id,
              role: member.role,
              email: 'Unknown',
              full_name: 'Unknown User'
            };
          }
        })
      );

      console.log('Final workspace members with profiles:', membersWithProfiles);
      setWorkspaceMembers(membersWithProfiles);
    } catch (error: any) {
      console.error('Error fetching workspace members:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte leden niet laden: " + error.message,
        variant: "destructive",
      });
    }
  };

  const fetchInvitations = async () => {
    if (!currentOrganization) return;

    try {
      console.log('Fetching invitations for organization:', currentOrganization.id);
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .is('accepted_at', null);

      console.log('Invitations query result:', { data, error });

      if (error) {
        console.error('Error fetching invitations:', error);
        if (error.message.includes('policy')) {
          console.log('Policy error - user might not have permission to view invitations');
          setInvitations([]);
          return;
        }
        throw error;
      }
      
      setInvitations(data || []);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
    }
  };

  const sendInvitation = async () => {
    if (!inviteEmail.trim() || !currentOrganization || !user) return;

    setLoading(true);
    try {
      console.log('Sending invitation to:', inviteEmail);
      
      // Create invitation in database
      const { data: invitation, error } = await supabase
        .from('user_invitations')
        .insert([{
          email: inviteEmail,
          organization_id: currentOrganization.id,
          workspace_id: currentWorkspace?.id || null,
          role: inviteRole,
          invited_by: user.id
        }])
        .select()
        .single();

      console.log('Invitation creation result:', { invitation, error });

      if (error) {
        console.error('Error creating invitation:', error);
        throw error;
      }

      // Send email via our edge function
      try {
        console.log('Sending invitation email...');
        const emailResponse = await supabase.functions.invoke('send-invitation-email', {
          body: {
            email: inviteEmail,
            organizationName: currentOrganization.name,
            inviterName: user.user_metadata?.full_name || user.email || 'Een collega',
            role: inviteRole,
            invitationLink: `${window.location.origin}/invitation/${invitation.token}`
          }
        });

        console.log('Email response:', emailResponse);

        if (emailResponse.error) {
          console.error('Error sending email:', emailResponse.error);
          // Still show success toast since invitation was created
          toast({
            title: "Uitnodiging aangemaakt",
            description: `Uitnodiging is aangemaakt voor ${inviteEmail}, maar de email kon niet worden verzonden.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Uitnodiging verzonden",
            description: `Uitnodiging is verzonden naar ${inviteEmail}.`,
          });
        }
      } catch (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast({
          title: "Uitnodiging aangemaakt",
          description: `Uitnodiging is aangemaakt voor ${inviteEmail}, maar de email kon niet worden verzonden.`,
          variant: "destructive",
        });
      }

      setInviteEmail('');
      setInviteRole('member');
      setShowInviteForm(false);
      fetchInvitations();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "Kon uitnodiging niet verzenden: " + error.message,
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
    if (currentOrganization) {
      fetchOrgMembers();
      fetchInvitations();
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (currentWorkspace) {
      fetchWorkspaceMembers();
    }
  }, [currentWorkspace]);

  if (!currentOrganization) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="text-center p-6">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Selecteer eerst een organisatie om gebruikers te beheren</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                    {loading ? 'Bezig...' : 'Uitnodiging Verzenden'}
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
            {orgMembers.length === 0 ? (
              <div className="text-center p-6 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>Nog geen leden in deze organisatie</p>
                <p className="text-sm">Nodig gebruikers uit met de knop hierboven</p>
              </div>
            ) : (
              orgMembers.map((member) => (
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
              ))
            )}
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
              {workspaceMembers.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2" />
                  <p>Nog geen leden in deze werkruimte</p>
                </div>
              ) : (
                workspaceMembers.map((member) => (
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
                ))
              )}
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
