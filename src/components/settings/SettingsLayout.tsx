
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { OrganizationWorkspaceView } from './OrganizationWorkspaceView';
import { UserProfileSettings } from './UserProfileSettings';
import { HistoryLogs } from './HistoryLogs';
import { DocumentSettings } from './DocumentSettings';
import { EmailSettings } from './EmailSettings';
import { InvoiceSettings } from './InvoiceSettings';
import { AIInstructionsSettings } from './AIInstructionsSettings';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface SettingsLayoutProps {
  currentTab: string;
  onTabChange: (value: string) => void;
}

export const SettingsLayout = ({ currentTab, onTabChange }: SettingsLayoutProps) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string>('lid');
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    // Handle old "templates-emails" tab by redirecting to new "documenten" tab
    if (value === 'templates-emails' || value === 'templates') {
      value = 'documenten';
    }
    onTabChange(value);
    navigate(`/instellingen?tab=${value}`);
  };

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
      <div className="w-full px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Gebruikersrol laden...</p>
        </div>
      </div>
    );
  }

  // Map old tab names to new ones
  let mappedCurrentTab = currentTab;
  if (currentTab === 'templates-emails' || currentTab === 'templates') {
    mappedCurrentTab = 'documenten';
  }

  return (
    <div className="w-full px-2 sm:px-4">
      <Tabs value={mappedCurrentTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className={`grid w-full gap-1 h-auto p-1 ${
          isMobile 
            ? 'grid-cols-3 grid-rows-3' 
            : 'grid-cols-7 grid-rows-1'
        }`}>
          <TabsTrigger 
            value="organizations" 
            className={`${isMobile ? 'text-sm px-2 py-2' : 'px-3 py-1.5'} whitespace-nowrap`}
          >
            {isMobile ? 'Organisaties' : 'Organisaties'}
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className={`${isMobile ? 'text-sm px-2 py-2' : 'px-3 py-1.5'} whitespace-nowrap`}
          >
            Gebruikers
          </TabsTrigger>
          <TabsTrigger 
            value="invoicing" 
            className={`${isMobile ? 'text-sm px-2 py-2' : 'px-3 py-1.5'} whitespace-nowrap`}
          >
            Facturatie
          </TabsTrigger>
          <TabsTrigger 
            value="documenten" 
            className={`${isMobile ? 'text-sm px-2 py-2' : 'px-3 py-1.5'} whitespace-nowrap`}
          >
            Documenten
          </TabsTrigger>
          <TabsTrigger 
            value="emails" 
            className={`${isMobile ? 'text-sm px-2 py-2' : 'px-3 py-1.5'} whitespace-nowrap`}
          >
            Emails
          </TabsTrigger>
          <TabsTrigger 
            value="ai-instructions" 
            className={`${isMobile ? 'text-sm px-2 py-2' : 'px-3 py-1.5'} whitespace-nowrap`}
          >
            AI Instructies
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className={`${isMobile ? 'text-sm px-2 py-2' : 'px-3 py-1.5'} whitespace-nowrap`}
          >
            Geschiedenis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations">
          <Card className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
              <OrganizationWorkspaceView userRole={userRole} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
              <UserProfileSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing">
          <Card>
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
              <InvoiceSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documenten">
          <Card>
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
              <RoleGuard 
                requiredRoles={['admin', 'eigenaar']} 
                userRole={userRole}
              >
                <DocumentSettings />
              </RoleGuard>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emails">
          <Card>
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
              <RoleGuard 
                requiredRoles={['admin', 'eigenaar']} 
                userRole={userRole}
              >
                <EmailSettings />
              </RoleGuard>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-instructions">
          <Card>
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
              <RoleGuard 
                requiredRoles={['admin', 'eigenaar']} 
                userRole={userRole}
              >
                <AIInstructionsSettings />
              </RoleGuard>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
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
