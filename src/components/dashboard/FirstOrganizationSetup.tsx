
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Plus } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';

export const FirstOrganizationSetup = () => {
  const { user } = useAuth();
  const { createFirstOrganization, loading } = useOrganization();
  const [orgName, setOrgName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) return;

    setCreating(true);
    const success = await createFirstOrganization(orgName);
    setCreating(false);
    
    if (success) {
      setOrgName('');
    }
  };

  const getDefaultOrgName = () => {
    if (!user?.email) return '';
    const name = user.email.split('@')[0];
    return `${name}'s Organisatie`;
  };

  const handleUseDefault = () => {
    const defaultName = getDefaultOrgName();
    setOrgName(defaultName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Building className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Welkom bij AI Juridisch!</CardTitle>
          <CardDescription>
            Maak je eerste organisatie aan om te beginnen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organisatienaam</Label>
            <Input
              id="org-name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Voer een organisatienaam in"
              disabled={creating}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={handleUseDefault}
            className="w-full"
            disabled={creating}
          >
            Gebruik standaard naam: "{getDefaultOrgName()}"
          </Button>

          <Button 
            onClick={handleCreateOrganization}
            disabled={creating || !orgName.trim()}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            {creating ? 'Aanmaken...' : 'Organisatie aanmaken'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
