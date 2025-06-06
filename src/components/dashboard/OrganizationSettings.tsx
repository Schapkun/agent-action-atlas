
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Building, Edit, Save, X } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => startEditOrg(org)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};
