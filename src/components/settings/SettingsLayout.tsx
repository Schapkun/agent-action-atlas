
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './OrganizationSettings';
import { EmailSettings } from './EmailSettings';
import { WorkspaceSettings } from './WorkspaceSettings';
import { InvoiceSettings } from './InvoiceSettings';
import { DocumentSettings } from './DocumentSettings';
import { HistoryLogs } from './HistoryLogs';
import { UserProfileSettings } from './UserProfileSettings';
import { AIInstructionsSettings } from './AIInstructionsSettings';
import { GeneralSettings } from './GeneralSettings';
import { UserList } from './UserList';
import { UserFilters } from './UserFilters';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  organizations?: string[];
  workspaces?: string[];
  isPending?: boolean;
  invitationId?: string;
  role?: string;
  avatar_url?: string | null;
  updated_at?: string;
  member_since?: string;
}

export const SettingsLayout = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleUsersUpdate = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
  };

  const handleUserRoleUpdate = (role: string | null) => {
    setUserRole(role);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Instellingen</h1>
        <p className="text-slate-600">Beheer uw organisatie-instellingen en voorkeuren</p>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general">Algemeen</TabsTrigger>
          <TabsTrigger value="organization">Organisatie & Werkruimtes</TabsTrigger>
          <TabsTrigger value="users">Gebruikers</TabsTrigger>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="documents">Documenten & Facturatie</TabsTrigger>
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
          <div className="space-y-6">
            <UserFilters 
              users={users}
              onUsersUpdate={handleUsersUpdate}
              onUserRoleUpdate={handleUserRoleUpdate}
            />
            <UserList users={users} />
          </div>
        </TabsContent>
        
        <TabsContent value="email">
          <EmailSettings />
        </TabsContent>
        
        <TabsContent value="documents">
          <div className="space-y-6">
            <InvoiceSettings />
            <DocumentSettings />
          </div>
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
