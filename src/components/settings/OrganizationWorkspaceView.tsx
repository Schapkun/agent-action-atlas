
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './OrganizationSettings';
import { WorkspaceSettings } from './WorkspaceSettings';

interface OrganizationWorkspaceViewProps {
  userRole: string;
}

export const OrganizationWorkspaceView = ({ userRole }: OrganizationWorkspaceViewProps) => {
  return (
    <Tabs defaultValue="organizations" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="organizations">Organisaties</TabsTrigger>
        <TabsTrigger value="workspaces">Werkruimtes</TabsTrigger>
      </TabsList>

      <TabsContent value="organizations" className="space-y-4">
        <OrganizationSettings userRole={userRole} />
      </TabsContent>

      <TabsContent value="workspaces" className="space-y-4">
        <WorkspaceSettings userRole={userRole} />
      </TabsContent>
    </Tabs>
  );
};
