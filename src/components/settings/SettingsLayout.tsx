
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './OrganizationSettings';
import { UserManagement } from './UserManagement';
import { EmailSettings } from './EmailSettings';
import { WorkspaceSettings } from './WorkspaceSettings';
import { InvoiceSettings } from './InvoiceSettings';
import { DocumentSettings } from './DocumentSettings';
import { HistoryLogs } from './HistoryLogs';
import { UserProfileSettings } from './UserProfileSettings';
import { AIInstructionsSettings } from './AIInstructionsSettings';
import { GeneralSettings } from './GeneralSettings';

export const SettingsLayout = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Instellingen</h1>
        <p className="text-slate-600">Beheer uw organisatie-instellingen en voorkeuren</p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="general">Algemeen</TabsTrigger>
          <TabsTrigger value="organization">Organisatie & Werkruimtes</TabsTrigger>
          <TabsTrigger value="users">Gebruikers</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="invoice">Facturatie</TabsTrigger>
          <TabsTrigger value="documents">Documenten</TabsTrigger>
          <TabsTrigger value="ai">AI Instructies</TabsTrigger>
          <TabsTrigger value="profile">Profiel</TabsTrigger>
          <TabsTrigger value="history">Geschiedenis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralSettings />
        </TabsContent>
        
        <TabsContent value="organization">
          <OrganizationSettings />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="email">
          <EmailSettings />
        </TabsContent>
        
        <TabsContent value="invoice">
          <InvoiceSettings />
        </TabsContent>
        
        <TabsContent value="documents">
          <DocumentSettings />
        </TabsContent>
        
        <TabsContent value="ai">
          <AIInstructionsSettings />
        </TabsContent>
        
        <TabsContent value="profile">
          <UserProfileSettings />
        </TabsContent>
        
        <TabsContent value="history">
          <HistoryLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
