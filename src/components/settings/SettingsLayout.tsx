
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './OrganizationSettings';
import { WorkspaceSettings } from './WorkspaceSettings';
import { UserProfileSettings } from './UserProfileSettings';
import { HistoryLogs } from './HistoryLogs';
import { Building2, Users, Settings, History } from 'lucide-react';

export const SettingsLayout = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Instellingen</h1>
        <p className="text-muted-foreground">
          Beheer je organisaties, werkruimtes en gebruikersprofielen
        </p>
      </div>

      <Tabs defaultValue="organizations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organisaties
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Werkruimtes
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Gebruikers
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Geschiedenis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organizations" className="space-y-6">
          <OrganizationSettings />
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-6">
          <WorkspaceSettings />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserProfileSettings />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <HistoryLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
