
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, Edit, Save, X, Trash } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const OrganizationSettings = () => {
  const { 
    organizations, 
    currentOrganization, 
    refreshOrganizations
  } = useOrganization();
  const { toast } = useToast();
  
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [loading, setLoading] = useState(false);

  const startEditOrg = (org: any) => {
    setEditingOrg(org.id);
    setOrgName(org.name);
  };

  const cancelEdit = () => {
    setEditingOrg(null);
    setOrgName('');
  };

  const saveOrgName = async (orgId: string) => {
    if (!orgName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          name: orgName,
          slug: orgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        })
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "Organisatie bijgewerkt",
        description: "De organisatienaam is succesvol bijgewerkt.",
      });

      setEditingOrg(null);
      setOrgName('');
      refreshOrganizations();
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatienaam niet bijwerken.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteOrganization = async (orgId: string) => {
    setLoading(true);
    try {
      // First delete all related data
      await supabase.from('organization_members').delete().eq('organization_id', orgId);
      await supabase.from('workspaces').delete().eq('organization_id', orgId);
      
      // Then delete the organization
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);

      if (error) throw error;

      toast({
        title: "Organisatie verwijderd",
        description: "De organisatie is succesvol verwijderd.",
      });

      refreshOrganizations();
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet verwijderen: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-3">
      {organizations.map((org) => (
        <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3 flex-1">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              {editingOrg === org.id ? (
                <div className="flex gap-2 items-center">
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => saveOrgName(org.id)}
                    disabled={loading || !orgName.trim()}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={cancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="font-medium">{org.name}</div>
                  <div className="text-sm text-muted-foreground">/{org.slug}</div>
                </>
              )}
            </div>
            {currentOrganization?.id === org.id && (
              <Badge variant="secondary">Actief</Badge>
            )}
          </div>
          {editingOrg !== org.id && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => startEditOrg(org)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Organisatie verwijderen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Weet je zeker dat je de organisatie "{org.name}" wilt verwijderen? 
                      Dit verwijdert ook alle bijbehorende werkruimtes en kan niet ongedaan worden gemaakt.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuleren</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteOrganization(org.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Verwijderen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
