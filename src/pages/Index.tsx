
import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { ActionOverview } from '@/components/dashboard/ActionOverview';
import { DocumentManager } from '@/components/dashboard/DocumentManager';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ActiveDossiers } from '@/components/dashboard/ActiveDossiers';
import { ClosedDossiers } from '@/components/dashboard/ClosedDossiers';
import { InvoiceManager } from '@/components/dashboard/InvoiceManager';
import { PhoneCallManager } from '@/components/dashboard/PhoneCallManager';
import { EmailManager } from '@/components/dashboard/EmailManager';
import { ContactManager } from '@/components/dashboard/ContactManager';
import { PendingTasks } from '@/components/dashboard/PendingTasks';
import { OrganizationManager } from '@/components/dashboard/OrganizationManager';
import { MyAccount } from '@/components/dashboard/MyAccount';
import { FirstOrganizationSetup } from '@/components/dashboard/FirstOrganizationSetup';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useOrganization } from '@/contexts/OrganizationContext';

export type ViewType = 'overview' | 'pending-tasks' | 'actions' | 'documents' | 'active-dossiers' | 'closed-dossiers' | 'invoices' | 'phone-calls' | 'emails' | 'contacts' | 'settings' | 'my-account';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentOrganization, loading } = useOrganization();

  const renderContent = () => {
    // Show setup screen if no organization exists
    if (!loading && !currentOrganization) {
      return <FirstOrganizationSetup />;
    }

    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <ActionOverview limit={10} showFilters={false} />
          </div>
        );
      case 'pending-tasks':
        return <PendingTasks />;
      case 'actions':
        return <ActionOverview />;
      case 'documents':
        return <DocumentManager />;
      case 'active-dossiers':
        return <ActiveDossiers />;
      case 'closed-dossiers':
        return <ClosedDossiers />;
      case 'invoices':
        return <InvoiceManager />;
      case 'phone-calls':
        return <PhoneCallManager />;
      case 'emails':
        return <EmailManager />;
      case 'contacts':
        return <ContactManager />;
      case 'settings':
        return <OrganizationManager />;
      case 'my-account':
        return <MyAccount />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex w-full">
        {/* Only show sidebar if user has an organization */}
        {currentOrganization && (
          <Sidebar 
            currentView={currentView} 
            onViewChange={setCurrentView}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Only show header if user has an organization */}
          {currentOrganization && (
            <Header 
              currentView={currentView}
              onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              onAccountView={() => setCurrentView('my-account')}
            />
          )}
          <main className="flex-1 overflow-auto p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
