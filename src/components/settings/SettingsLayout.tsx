
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
        console.log('Fetching role for user:', user.email);
        
        // Check if user is the account owner (info@schapkun.com)
        if (user.email === 'info@schapkun.com') {
          console.log('User is account owner (info@schapkun.com), setting role to eigenaar');
          setUserRole('eigenaar');
          return;
        }

        // For all other users, get their role from organization membership
        const { data: memberships, error } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        console.log('Organization memberships query result:', { memberships, error });

        if (error) {
          console.error('Error fetching organization membership:', error);
          setUserRole('lid');
          return;
        }

        if (memberships && memberships.length > 0) {
          const role = memberships[0].role;
          console.log('User role from organization membership:', role);
          setUserRole(role);
        } else {
          console.log('No organization membership found, setting role to lid');
          setUserRole('lid');
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('lid');
      }
    };

    fetchUserRole();
  }, [user?.id, user?.email]);

  console.log('SettingsLayout - Current user:', user?.email);
  console.log('SettingsLayout - userRole state:', userRole);

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
