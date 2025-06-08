
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationTab } from './OrganizationTab';
import { WorkspacesTab } from './WorkspacesTab';

interface Organization {
  id: string;
  name: string;
  slug: string;
  workspaces?: Workspace[];
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
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
  onEditOrganization: (newName: string) => Promise<void>;
  onDeleteOrganization: () => Promise<void>;
  onOrgUserToggle: (userId: string, hasAccess: boolean) => void;
  onAddWorkspace: (workspaceName: string) => Promise<void>;
  onEditWorkspace: (workspaceId: string, newName: string) => Promise<void>;
  onDeleteWorkspace: (workspaceId: string, workspaceName: string) => Promise<void>;
  onWorkspaceUserToggle: (workspaceId: string, userId: string, hasAccess: boolean) => void;
}

export const TabsContainer = ({
  organization,
  users,
  workspaces,
  loading,
  onEditOrganization,
  onDeleteOrganization,
  onOrgUserToggle,
  onAddWorkspace,
  onEditWorkspace,
  onDeleteWorkspace,
  onWorkspaceUserToggle
}: TabsContainerProps) => {
  return (
    <div className="flex-1 overflow-hidden">
      <Tabs defaultValue="organisatie" className="w-full h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
          <TabsTrigger value="organisatie">Organisatie</TabsTrigger>
          <TabsTrigger value="werkruimtes">Werkruimtes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organisatie" className="flex-1 overflow-hidden">
          <OrganizationTab
            organization={organization}
            users={users}
            loading={loading}
            onEditOrganization={onEditOrganization}
            onDeleteOrganization={onDeleteOrganization}
            onUserToggle={onOrgUserToggle}
          />
        </TabsContent>
        
        <TabsContent value="werkruimtes" className="flex-1 overflow-hidden">
          <WorkspacesTab
            workspaces={workspaces}
            users={users}
            loading={loading}
            onAddWorkspace={onAddWorkspace}
            onEditWorkspace={onEditWorkspace}
            onDeleteWorkspace={onDeleteWorkspace}
            onUserToggle={onWorkspaceUserToggle}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
