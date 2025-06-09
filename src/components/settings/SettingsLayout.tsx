
import { useState } from 'react';
import { User, Users, FileText, History, Building2, Layout, User2 } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserManagementComponent } from './UserManagementComponent';
import { HistoryLogs } from './HistoryLogs';
import { DocumentLayoutSettings } from './DocumentLayoutSettings';
import { OrganizationWorkspaceView } from './OrganizationWorkspaceView';
import { UserProfileSettings } from './UserProfileSettings';
import { HTMLBuilderSettings } from './HTMLBuilderSettings';

export const SettingsLayout = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [userRole, setUserRole] = useState<string>('user'); // Default role

  const tabs = [
    { id: 'users', label: 'Gebruikers', icon: Users },
    { id: 'history', label: 'Historie', icon: History },
    { id: 'templates', label: 'Templates', icon: FileText },
    { id: 'htmlbuilder', label: 'HTML Builder', icon: Layout },
    { id: 'workspace', label: 'Workspace', icon: Building2 },
    { id: 'profile', label: 'Profiel', icon: User2 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagementComponent />;
      case 'history':
        return <HistoryLogs />;
      case 'templates':
        return <DocumentLayoutSettings />;
      case 'htmlbuilder':
        return <HTMLBuilderSettings />;
      case 'workspace':
        return <OrganizationWorkspaceView userRole={userRole} />;
      case 'profile':
        return <UserProfileSettings />;
      default:
        return <UserManagementComponent />;
    }
  };

  return (
    <div className="container h-full mx-auto py-10">
      <Tabs defaultValue="users" className="h-full">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-sm">
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="h-full outline-none">
            {renderContent()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
