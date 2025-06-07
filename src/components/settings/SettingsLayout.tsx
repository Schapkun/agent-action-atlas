
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { OrganizationWorkspaceView } from './OrganizationWorkspaceView';
import { UserProfileSettings } from './UserProfileSettings';
import { HistoryLogs } from './HistoryLogs';
import { DocumentLayoutSettings } from './DocumentLayoutSettings';
import { RoleGuard } from '@/components/auth/RoleGuard';

export const SettingsLayout = () => {
  // Mock user role - in production this would come from your auth context
  // For now, using 'lid' to demonstrate the restriction
  const userRole = 'lid'; // Could be 'admin', 'eigenaar', or 'lid'

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
