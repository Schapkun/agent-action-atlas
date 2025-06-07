import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { OrganizationWorkspaceView } from './OrganizationWorkspaceView';
import { UserProfileSettings } from './UserProfileSettings';
import { HistoryLogs } from './HistoryLogs';
import { DocumentLayoutSettings } from './DocumentLayoutSettings';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { useAuth } from '@/contexts/AuthContext';

export const SettingsLayout = () => {
  const { user } = useAuth();
  
  // In a real implementation, you would fetch the user's role from your database
  // For now, we'll simulate getting the role based on user data
  // This should be replaced with actual role fetching logic from your user management system
  const getUserRole = () => {
    if (!user) return 'lid';
    
    // Mock logic - in production this would come from your database
    // You could check user metadata, make an API call, etc.
    // For demonstration, let's check if the user's email contains certain keywords or matches patterns
    
    // If the email contains 'admin' anywhere, make them admin
    if (user.email?.toLowerCase().includes('admin')) return 'admin';
    
    // For testing purposes, let's make the first logged in user an 'eigenaar'
    // You can replace this with your actual email or logic
    if (user.email === 'info@schapkun.com' || user.email?.toLowerCase().includes('schapkun')) return 'eigenaar';
    
    // Default to 'eigenaar' for now so you can test - change this to 'lid' when ready for production
    // Replace this with your actual role-checking logic
    return 'eigenaar';
  };

  const userRole = getUserRole();

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
