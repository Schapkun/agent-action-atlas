
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './OrganizationSettings';
import { EmailSettings } from './EmailSettings';
import { WorkspaceSettings } from './WorkspaceSettings';
import { DocumentSettings } from './DocumentSettings';
import { HistoryLogs } from './HistoryLogs';
import { AIInstructionsSettings } from './AIInstructionsSettings';
import { GeneralSettings } from './GeneralSettings';
import { UserProfileSettings } from './UserProfileSettings';

export const SettingsLayout = () => {
  return (
    <div className="w-full p-6">
      <Tabs defaultValue="general" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">Algemeen</TabsTrigger>
          <TabsTrigger value="organization">Organisaties</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="documents">Documenten</TabsTrigger>
          <TabsTrigger value="ai">AI Instructies</TabsTrigger>
          <TabsTrigger value="history">Geschiedenis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="organization">
          <Tabs defaultValue="org-workspaces" className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="org-workspaces">Organisaties & Werkruimtes</TabsTrigger>
              <TabsTrigger value="users">Gebruikers</TabsTrigger>
            </TabsList>
            
            <TabsContent value="org-workspaces">
              <OrganizationSettings />
            </TabsContent>
            
            <TabsContent value="users">
              <UserProfileSettings />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="email">
          <EmailSettings />
        </TabsContent>
        
        <TabsContent value="documents">
          <DocumentSettings />
        </TabsContent>
        
        <TabsContent value="ai">
          <AIInstructionsSettings />
        </TabsContent>
        
        <TabsContent value="history">
          <HistoryLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
