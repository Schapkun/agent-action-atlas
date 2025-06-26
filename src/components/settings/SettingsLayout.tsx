
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './OrganizationSettings';
import { UserProfileSettings } from './UserProfileSettings';
import { DocumentSettings } from './DocumentSettings';
import { InvoiceSettings } from './InvoiceSettings';
import { EmailSettings } from './EmailSettings';
import { HistoryLogs } from './HistoryLogs';

interface SettingsLayoutProps {
  currentTab: string;
  onTabChange: (value: string) => void;
}

export const SettingsLayout = ({ currentTab, onTabChange }: SettingsLayoutProps) => {
  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="organizations">Organisaties & Gebruikers</TabsTrigger>
        <TabsTrigger value="profile">Mijn Profiel</TabsTrigger>
        <TabsTrigger value="documenten">Documenten</TabsTrigger>
        <TabsTrigger value="invoices">Facturen</TabsTrigger>
        <TabsTrigger value="emails">E-mail</TabsTrigger>
        <TabsTrigger value="history">Historie</TabsTrigger>
      </TabsList>

      <TabsContent value="organizations" className="mt-6">
        <OrganizationSettings />
      </TabsContent>

      <TabsContent value="profile" className="mt-6">
        <UserProfileSettings />
      </TabsContent>

      <TabsContent value="documenten" className="mt-6">
        <DocumentSettings />
      </TabsContent>

      <TabsContent value="invoices" className="mt-6">
        <InvoiceSettings />
      </TabsContent>

      <TabsContent value="emails" className="mt-6">
        <EmailSettings />
      </TabsContent>

      <TabsContent value="history" className="mt-6">
        <HistoryLogs />
      </TabsContent>
    </Tabs>
  );
};
