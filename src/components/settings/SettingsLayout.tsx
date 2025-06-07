
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
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) {
        setIsRoleLoading(false);
        return;
      }

      try {
        console.log('Fetching role for user:', user.email);
        
        // Check if user is the account owner (info@schapkun.com)
        if (user.email === 'info@schapkun.com') {
          console.log('User is account owner (info@schapkun.com), setting role to eigenaar');
          setUserRole('eigenaar');
          setIsRoleLoading(false);
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
          setIsRoleLoading(false);
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
        setIsRoleLoading(false);
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('lid');
        setIsRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id, user?.email]);

  console.log('SettingsLayout - Current user:', user?.email);
  console.log('SettingsLayout - userRole state:', userRole);
  console.log('SettingsLayout - isRoleLoading:', isRoleLoading);

  if (isRoleLoading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Gebruikersrol laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl" style={{ paddingTop: '20px' }}>
      <Tabs defaultValue="organizations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organizations">Org & Werkruimtes</TabsTrigger>
          <TabsTrigger value="users">Gebruikers</TabsTrigger>
          <TabsTrigger value="documents">Document Layouts</TabsTrigger>
          <TabsTrigger value="history">Geschiedenis</TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <CardContent className="p-6">
              <OrganizationWorkspaceView userRole={userRole} />
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
