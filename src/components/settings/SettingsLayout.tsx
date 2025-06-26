
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './OrganizationSettings';
import { WorkspaceSettings } from './WorkspaceSettings';
import { UserManagement } from './UserManagement';
import { DocumentSettings } from './DocumentSettings';
import { DossierSettings } from './DossierSettings';
import { EmailSettings } from './EmailSettings';
import { InvoiceSettings } from './InvoiceSettings';
import { HistoryLogs } from './HistoryLogs';
import { UserProfileSettings } from './UserProfileSettings';

interface SettingsLayoutProps {
  currentTab: string;
  onTabChange: (value: string) => void;
}

export const SettingsLayout = ({ currentTab, onTabChange }: SettingsLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Instellingen</h1>
          <p className="text-slate-600">Beheer uw organisatie, werkruimtes, gebruikers en systeem instellingen.</p>
        </div>

        <Tabs value={currentTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="organizations">Organisaties</TabsTrigger>
            <TabsTrigger value="workspaces">Werkruimtes</TabsTrigger>
            <TabsTrigger value="users">Gebruikers</TabsTrigger>
            <TabsTrigger value="dossiers">Dossiers</TabsTrigger>
            <TabsTrigger value="documenten">Documenten</TabsTrigger>
            <TabsTrigger value="emails">E-mails</TabsTrigger>
            <TabsTrigger value="invoices">Facturatie</TabsTrigger>
            <TabsTrigger value="profile">Profiel</TabsTrigger>
          </TabsList>

          <TabsContent value="organizations">
            <OrganizationSettings />
          </TabsContent>

          <TabsContent value="workspaces">
            <WorkspaceSettings />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="dossiers">
            <DossierSettings />
          </TabsContent>

          <TabsContent value="documenten">
            <DocumentSettings />
          </TabsContent>

          <TabsContent value="emails">
            <EmailSettings />
          </TabsContent>

          <TabsContent value="invoices">
            <InvoiceSettings />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
