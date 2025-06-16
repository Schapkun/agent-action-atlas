
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { OrganizationSettings } from '@/components/settings/OrganizationSettings';
import { WorkspaceSettings } from '@/components/settings/WorkspaceSettings';
import { UserManagement } from '@/components/settings/UserManagement';
import { InvoiceSettings } from '@/components/settings/InvoiceSettings';
import { EmailTemplateSettings } from '@/components/settings/EmailTemplateSettings';
import { TemplateList } from '@/components/settings/TemplateList';
import { HistoryLogs } from '@/components/settings/HistoryLogs';

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'organization';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  useEffect(() => {
    // If no tab is specified, set default tab
    if (!searchParams.get('tab')) {
      setSearchParams({ tab: 'organization' });
    }
  }, [searchParams, setSearchParams]);

  // Dummy handlers for components that need them
  const handleUsersUpdate = () => {
    // Handle users update
  };

  const handleUserRoleUpdate = () => {
    // Handle user role update
  };

  const handleTemplateSelect = () => {
    // Handle template selection
  };

  const handleTemplateEdit = () => {
    // Handle template editing
  };

  return (
    <SettingsLayout>
      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="organization">Organisatie</TabsTrigger>
          <TabsTrigger value="workspace">Werkruimte</TabsTrigger>
          <TabsTrigger value="users">Gebruikers</TabsTrigger>
          <TabsTrigger value="invoicing">Facturatie</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Geschiedenis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="organization">
          <OrganizationSettings />
        </TabsContent>
        
        <TabsContent value="workspace">
          <WorkspaceSettings userRole="admin" />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement 
            onUsersUpdate={handleUsersUpdate}
            onUserRoleUpdate={handleUserRoleUpdate}
          />
        </TabsContent>
        
        <TabsContent value="invoicing">
          <InvoiceSettings />
        </TabsContent>
        
        <TabsContent value="emails">
          <EmailTemplateSettings />
        </TabsContent>
        
        <TabsContent value="templates">
          <TemplateList 
            templates={[]}
            onSelectTemplate={handleTemplateSelect}
            onEditTemplate={handleTemplateEdit}
            selectedTemplate=""
          />
        </TabsContent>
        
        <TabsContent value="history">
          <HistoryLogs />
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  );
};

export default Settings;
