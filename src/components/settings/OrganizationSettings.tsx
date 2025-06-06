
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Trash2, Plus, Edit } from 'lucide-react';

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
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          role,
          organizations (
            id,
            name,
            slug,
            created_at
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const orgsWithRoles = data?.map(item => ({
        id: item.organizations?.id || '',
        name: item.organizations?.name || '',
        slug: item.organizations?.slug || '',
        created_at: item.organizations?.created_at || '',
        user_role: item.role
      })) || [];

      setOrganizations(orgsWithRoles);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Kon organisaties niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async () => {
    if (!newOrgName.trim()) return;

    try {
      const slug = newOrgName.toLowerCase().replace(/\s+/g, '-');
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: newOrgName,
          slug: slug
        })
        .select()
        .single();

      if (orgError) throw orgError;

      await supabase
        .from('organization_members')
        .insert({
          organization_id: orgData.id,
          user_id: user?.id,
          role: 'owner'
        });

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: orgData.id,
          action: 'Organisatie aangemaakt',
          details: { organization_name: newOrgName }
        });

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
        description: "Kon organisatie niet aanmaken",
        variant: "destructive",
      });
    }
  };

  const updateOrganization = async () => {
    if (!editingOrg || !editingOrg.name.trim()) return;

    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: editingOrg.name,
          slug: editingOrg.name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', editingOrg.id);

      if (error) throw error;

      await supabase
        .from('history_logs')
        .insert({
          user_id: user?.id,
          organization_id: editingOrg.id,
          action: 'Organisatie bijgewerkt',
          details: { organization_name: editingOrg.name }
        });

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
    return <div>Organisaties laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Organisaties</h2>
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
        {organizations.map((org) => (
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
                  {org.user_role === 'owner' && (
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
        ))}
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
