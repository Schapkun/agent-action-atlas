
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Edit, RefreshCw } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  user_role?: string;
}

export const OrganizationSettings = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchOrganizations();
    }
  }, [user]);

  const fetchOrganizations = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching organizations for user:', user.id);
      console.log('User email:', user.email);
      
      // Check if user is the account owner (Michael Schapkun)
      const isAccountOwner = user.email === 'info@schapkun.com';
      console.log('Is account owner:', isAccountOwner);
      
      if (isAccountOwner) {
        // If account owner, show ALL organizations
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, slug, created_at')
          .order('created_at', { ascending: false });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          throw orgError;
        }

        console.log('All organization data (account owner):', orgData);

        // For account owner, get membership info but don't filter by it
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('role, organization_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.log('Membership fetch error (non-critical for account owner):', membershipError);
        }

        console.log('Membership data for account owner:', membershipData);

        // Combine data with role information where available
        const orgsWithRoles = orgData?.map(org => {
          const membership = membershipData?.find(m => m.organization_id === org.id);
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            created_at: org.created_at,
            user_role: membership?.role || 'owner' // Default to owner for account owner
          };
        }) || [];

        setOrganizations(orgsWithRoles);
      } else {
        // For regular users, use the existing logic
        const { data: membershipData, error: membershipError } = await supabase
          .from('organization_members')
          .select('role, organization_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error('Membership fetch error:', membershipError);
          throw membershipError;
        }

        console.log('Membership data:', membershipData);

        if (!membershipData || membershipData.length === 0) {
          console.log('No memberships found');
          setOrganizations([]);
          setLoading(false);
          return;
        }

        // Get organization details
        const orgIds = membershipData.map(m => m.organization_id);
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, slug, created_at')
          .in('id', orgIds);

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          throw orgError;
        }

        console.log('Organization data:', orgData);

        // Combine membership and organization data
        const orgsWithRoles = orgData?.map(org => {
          const membership = membershipData.find(m => m.organization_id === org.id);
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            created_at: org.created_at,
            user_role: membership?.role
          };
        }) || [];

        setOrganizations(orgsWithRoles);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      setError('Kon organisaties niet ophalen. Controleer je internetverbinding en probeer opnieuw.');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim() || !user?.id) return;

    try {
      console.log('Creating organization with name:', newOrgName);
      console.log('User ID:', user.id);
      
      const slug = newOrgName.toLowerCase().replace(/\s+/g, '-');
      
      // Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          slug: slug
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);
        throw orgError;
      }

      console.log('Organization created:', orgData);

      // Add user as organization owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) {
        console.error('Membership creation error:', memberError);
        throw memberError;
      }

      console.log('Membership created successfully');

      // Try to log but don't fail if it doesn't work
      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            organization_id: orgData.id,
            action: 'Organisatie aangemaakt',
            details: { organization_name: newOrgName }
          });
      } catch (logError) {
        console.error('Failed to log organization creation:', logError);
      }

      toast({
        title: "Succes",
        description: "Organisatie succesvol aangemaakt",
      });

      setNewOrgName('');
      setIsCreateDialogOpen(false);
      fetchOrganizations();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet aanmaken: " + (error as any)?.message,
        variant: "destructive",
      });
    }
  };

  const updateOrganization = async () => {
    if (!editingOrg || !editingOrg.name.trim() || !user?.id) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editingOrg.name,
          slug: editingOrg.name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', editingOrg.id);

      if (error) throw error;

      try {
        await supabase
          .from('history_logs')
          .insert({
            user_id: user.id,
            organization_id: editingOrg.id,
            action: 'Organisatie bijgewerkt',
            details: { organization_name: editingOrg.name }
          });
      } catch (logError) {
        console.error('Failed to log organization update:', logError);
      }

      toast({
        title: "Succes",
        description: "Organisatie succesvol bijgewerkt",
      });

      setEditingOrg(null);
      fetchOrganizations();
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const deleteOrganization = async (orgId: string, orgName: string) => {
    if (!confirm(`Weet je zeker dat je organisatie "${orgName}" wilt verwijderen?`)) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Organisatie succesvol verwijderd",
      });

      fetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet verwijderen",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Organisaties</h2>
          <Button onClick={fetchOrganizations} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Opnieuw proberen
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchOrganizations}>
              Opnieuw laden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Organisaties</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Organisatie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuwe Organisatie Aanmaken</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="org-name">Organisatie Naam</Label>
                <Input
                  id="org-name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Voer organisatie naam in"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button onClick={createOrganization}>
                  Aanmaken
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Je bent nog geen lid van een organisatie. Maak een nieuwe organisatie aan om te beginnen.
            </CardContent>
          </Card>
        ) : (
          organizations.map((org) => (
            <Card key={org.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{org.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Rol: {org.user_role} • Aangemaakt: {new Date(org.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {(org.user_role === 'owner' || user?.email === 'info@schapkun.com') && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingOrg(org)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteOrganization(org.id, org.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {editingOrg && (
        <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Organisatie Bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-org-name">Organisatie Naam</Label>
                <Input
                  id="edit-org-name"
                  value={editingOrg.name}
                  onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingOrg(null)}>
                  Annuleren
                </Button>
                <Button onClick={updateOrganization}>
                  Opslaan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
