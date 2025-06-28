
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './OrganizationSettings';
import { EmailSettings } from './EmailSettings';
import { WorkspaceSettings } from './WorkspaceSettings';
import { InvoiceSettings } from './InvoiceSettings';
import { DocumentSettings } from './DocumentSettings';
import { HistoryLogs } from './HistoryLogs';
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
          <div className="space-y-6">
            <OrganizationSettings />
            <div className="space-y-6">
              <UserFilters 
                users={users}
                onUsersUpdate={handleUsersUpdate}
                onUserRoleUpdate={handleUserRoleUpdate}
              />
              <UserList users={users} userRole={userRole || 'member'} />
            </div>
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
        
        <TabsContent value="history">
          <HistoryLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};
