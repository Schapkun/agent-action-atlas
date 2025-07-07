
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationTab } from './OrganizationTab';
import { WorkspacesTab } from './WorkspacesTab';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
  sender_email?: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  hasOrgAccess?: boolean;
  workspaceAccess?: { [workspaceId: string]: boolean };
}

interface TabsContainerProps {
  organization: Organization;
  users: User[];
  workspaces: Workspace[];
  loading: boolean;
  orgEmail: string;
  onOrgEmailChange: (email: string) => void;
  onEditOrganization: (newName: string) => Promise<void>;
  onDeleteOrganization: () => Promise<void>;
  onOrgUserToggle: (userId: string, hasAccess: boolean) => void;
  onAddWorkspace: (workspaceName: string) => Promise<void>;
  onEditWorkspace: (workspaceId: string, newName: string) => Promise<void>;
  onDeleteWorkspace: (workspaceId: string, workspaceName: string) => Promise<void>;
  onWorkspaceUserToggle: (workspaceId: string, userId: string, hasAccess: boolean) => void;
  onWorkspaceEmailChange: (workspaceId: string, email: string) => void;
}

export const TabsContainer = ({
  organization,
  users,
  workspaces,
  loading,
  orgEmail,
  onOrgEmailChange,
  onEditOrganization,
  onDeleteOrganization,
  onOrgUserToggle,
  onAddWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onWorkspaceUserToggle,
  onWorkspaceEmailChange
}: TabsContainerProps) => {
  return (
    <Tabs defaultValue="organization" className="flex-1 flex flex-col">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="organization">Organisatie</TabsTrigger>
        <TabsTrigger value="workspaces">Werkruimtes</TabsTrigger>
      </TabsList>

      <TabsContent value="organization" className="flex-1">
        <OrganizationTab
          organization={organization}
          users={users}
          loading={loading}
          orgEmail={orgEmail}
          onOrgEmailChange={onOrgEmailChange}
          onEditOrganization={onEditOrganization}
          onDeleteOrganization={onDeleteOrganization}
          onUserToggle={onOrgUserToggle}
        />
      </TabsContent>

      <TabsContent value="workspaces" className="flex-1">
        <WorkspacesTab
          workspaces={workspaces}
          users={users}
          loading={loading}
          onAddWorkspace={onAddWorkspace}
          onEditWorkspace={onEditWorkspace}
          onDeleteWorkspace={onDeleteWorkspace}
          onUserToggle={onWorkspaceUserToggle}
          onWorkspaceEmailChange={onWorkspaceEmailChange}
        />
      </TabsContent>
    </Tabs>
  );
};
