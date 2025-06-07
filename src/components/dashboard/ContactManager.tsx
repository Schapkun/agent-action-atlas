
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';

export const ContactManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user } = useAuth();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;

      try {
        // Check if user is account owner
        if (user.email === 'info@schapkun.com') {
          setUserRole('owner');
          return;
        }

        // Get user's role from their organization memberships
        const { data: memberships } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        if (memberships && memberships.length > 0) {
          setUserRole(memberships[0].role);
        } else {
          setUserRole('lid'); // Default role if no membership found
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('lid'); // Default to lid on error
      }
    };

    fetchUserRole();
  }, [user]);

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  // Check if user can invite others (not 'lid' role)
  const canInviteUsers = userRole !== 'lid';

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Contact List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Contacten</CardTitle>
            {canInviteUsers && (
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Nieuw Contact
              </Button>
            )}
          </div>

          {!selectedOrganization && !selectedWorkspace && (
            <div className="text-sm text-muted-foreground">
              Selecteer een organisatie of werkruimte om contacten te bekijken
            </div>
          )}

          {(selectedOrganization || selectedWorkspace) && (
            <>
              <div className="text-sm text-muted-foreground">
                Data voor: {getContextInfo()}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Zoek contacten..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </>
          )}
        </CardHeader>

        <div className="px-6 pt-3 pb-6">
          {!selectedOrganization && !selectedWorkspace ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecteer een organisatie of werkruimte om contacten te bekijken</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen contacten gevonden voor de geselecteerde context</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
