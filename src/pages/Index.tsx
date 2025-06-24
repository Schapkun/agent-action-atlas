import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ContextDataViewer } from '@/components/dashboard/ContextDataViewer';
import { PendingTasks } from '@/components/dashboard/PendingTasks';
import { AiActionsManager } from '@/components/dashboard/AiActionsManager';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ViewType } from '@/components/dashboard/Sidebar';
import { ContactManager } from '@/components/dashboard/contacts/ContactManager';
import { PhoneCallManager } from '@/components/dashboard/PhoneCallManager';
import { EmailManager } from '@/components/dashboard/EmailManager';
import { ActiveDossiers } from '@/components/dashboard/ActiveDossiers';
import { ClosedDossiers } from '@/components/dashboard/ClosedDossiers';
import { DocumentManager } from '@/components/dashboard/DocumentManager';
import { PendingTasksManager } from '@/components/dashboard/PendingTasksManager';

const Index = () => {
  const { user } = useAuth();
  const { isLoadingOrganizations } = useOrganization();
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    
    if (path === '/') {
      setCurrentView('overview');
    } else if (path === '/openstaande-taken') {
      setCurrentView('pending-tasks');
    } else if (path === '/clienten' || path === '/contacten') {
      setCurrentView('contacts');
    } else if (path === '/telefoongesprekken') {
      setCurrentView('phone-calls');
    } else if (path === '/e-mails') {
      setCurrentView('emails');
    } else if (path === '/actieve-dossiers') {
      setCurrentView('active-dossiers');
    } else if (path === '/gesloten-dossiers') {
      setCurrentView('closed-dossiers');
    } else if (path.startsWith('/documenten')) {
      setCurrentView('documents');
    } else if (path.startsWith('/facturen')) {
      setCurrentView('invoices');
    } else if (path.startsWith('/offertes')) {
      setCurrentView('quotes');
    } else if (path === '/instellingen') {
      setCurrentView('settings');
    }
  }, [location.pathname]);

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <PendingTasks />
            <AiActionsManager />
          </div>
        );
      case 'pending-tasks':
        return <PendingTasksManager />;
      case 'contacts':
        return <ContactManager />;
      case 'phone-calls':
        return <PhoneCallManager />;
      case 'emails':
        return <EmailManager />;
      case 'active-dossiers':
        return <ActiveDossiers />;
      case 'closed-dossiers':
        return <ClosedDossiers />;
      case 'documents':
        return <DocumentManager />;
      default:
        return (
          <div className="space-y-6">
            <DashboardStats />
            <PendingTasks />
            <AiActionsManager />
            <ContextDataViewer />
          </div>
        );
    }
  };

  if (isLoadingOrganizations) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Niet ingelogd</h1>
          <p className="text-gray-600">Log in om toegang te krijgen tot het dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar 
        currentView={currentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentView={currentView}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <main className={`flex-1 overflow-auto ${
          currentView === 'documents' ? 'p-0' : 'p-6'
        }`}>
          <div className={currentView === 'documents' ? 'w-full max-w-none' : 'max-w-7xl mx-auto'}>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
