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
        // If account owner, show ALL organizations regardless of membership
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('id, name, slug, created_at')
          .order('created_at', { ascending: false });

        if (orgError) {
          console.error('Organizations fetch error:', orgError);
          throw orgError;
        }

        console.log('All organization data (account owner):', orgData);

        // For account owner, show all organizations with 'super_admin' role
        const orgsWithRoles = orgData?.map(org => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          created_at: org.created_at,
          user_role: 'super_admin' // Special role for account owner
        })) || [];

        setOrganizations(orgsWithRoles);
      } else {
        // For regular users, use the existing membership-based logic
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

      // Only add user as organization owner if they're not the super admin
      if (user.email !== 'info@schapkun.com') {
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
      }

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
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Organisaties</h2>
          <Button onClick={fetchOrganizations} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Opnieuw proberen
          </Button>
        </div>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-red-600 mb-3 text-sm">{error}</p>
            <Button onClick={fetchOrganizations} size="sm">
              Opnieuw laden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Organisaties</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Organisatie
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Nieuwe Organisatie Aanmaken</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="org-name" className="text-sm">Organisatie Naam</Label>
                <Input
                  id="org-name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Voer organisatie naam in"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(false)}>
                  Annuleren
                </Button>
                <Button size="sm" onClick={createOrganization}>
                  Aanmaken
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {organizations.length === 0 ? (
          <Card>
            <CardContent className="p-4 text-center text-sm text-muted-foreground">
              {user?.email === 'info@schapkun.com' 
                ? 'Er zijn nog geen organisaties aangemaakt.'
                : 'Je bent nog geen lid van een organisatie. Maak een nieuwe organisatie aan om te beginnen.'
              }
            </CardContent>
          </Card>
        ) : (
          organizations.map((org) => (
            <Card key={org.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">{org.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Rol: {org.user_role === 'super_admin' ? 'Super Administrator' : org.user_role} • Aangemaakt: {new Date(org.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {(org.user_role === 'owner' || org.user_role === 'super_admin') && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingOrg(org)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteOrganization(org.id, org.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg">Organisatie Bewerken</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="edit-org-name" className="text-sm">Organisatie Naam</Label>
                <Input
                  id="edit-org-name"
                  value={editingOrg.name}
                  onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEditingOrg(null)}>
                  Annuleren
                </Button>
                <Button size="sm" onClick={updateOrganization}>
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
