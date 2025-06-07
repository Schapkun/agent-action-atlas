
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { OrganizationWorkspaceView } from './OrganizationWorkspaceView';
import { UserProfileSettings } from './UserProfileSettings';
import { HistoryLogs } from './HistoryLogs';
import { DocumentLayoutSettings } from './DocumentLayoutSettings';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const SettingsLayout = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('lid');

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;

      try {
        // Check if user is the account owner (first user in the system)
        const { data: allUsers } = await supabase
          .from('user_profiles')
          .select('id, created_at')
          .order('created_at', { ascending: true })
          .limit(1);

        if (allUsers && allUsers.length > 0 && allUsers[0].id === user.id) {
          console.log('User is account owner');
          setUserRole('eigenaar');
          return;
        }

        // Get user's role from their organization membership
        const { data: memberships } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        if (memberships && memberships.length > 0) {
          console.log('User role from organization:', memberships[0].role);
          setUserRole(memberships[0].role);
        } else {
          console.log('No organization membership found, defaulting to lid');
          setUserRole('lid');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('lid');
      }
    };

    fetchUserRole();
  }, [user?.id]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Instellingen</h1>
        <p className="text-muted-foreground">Beheer je organisaties, werkruimtes en gebruikersprofielen</p>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organizations">Organisaties & Werkruimtes</TabsTrigger>
          <TabsTrigger value="users">Gebruikers</TabsTrigger>
          <TabsTrigger value="documents">Document Layouts</TabsTrigger>
          <TabsTrigger value="history">Geschiedenis</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <Card>
            <CardContent className="p-6">
              <OrganizationWorkspaceView />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="p-6">
              <UserProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="p-6">
              <RoleGuard 
                requiredRoles={['admin', 'eigenaar']} 
                userRole={userRole}
                fallbackMessage="Je hebt geen toegang tot document layout instellingen. Alleen gebruikers met Admin of Eigenaar rol kunnen document layouts beheren."
              >
                <DocumentLayoutSettings />
              </RoleGuard>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-6">
              <RoleGuard 
                requiredRoles={['admin', 'eigenaar']} 
                userRole={userRole}
                fallbackMessage="Je hebt geen toegang tot de geschiedenis. Alleen gebruikers met Admin of Eigenaar rol kunnen de geschiedenis bekijken."
              >
                <HistoryLogs />
              </RoleGuard>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
