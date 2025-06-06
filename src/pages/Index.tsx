
import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { ActionOverview } from '@/components/dashboard/ActionOverview';
import { DocumentManager } from '@/components/dashboard/DocumentManager';
import { DashboardStats } from '@/components/dashboard/DashboardStats';

export type ViewType = 'overview' | 'actions' | 'documents' | 'active-dossiers' | 'closed-dossiers' | 'invoices' | 'phone-calls' | 'emails' | 'settings';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardStats />
            <ActionOverview limit={10} showFilters={false} />
          </div>
        );
      case 'actions':
        return <ActionOverview />;
      case 'documents':
        return <DocumentManager />;
      case 'active-dossiers':
        return (
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Actieve Dossiers</h2>
            <p className="text-muted-foreground">Overzicht van actieve dossiers wordt binnenkort beschikbaar.</p>
          </div>
        );
      case 'closed-dossiers':
        return (
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Gesloten Dossiers</h2>
            <p className="text-muted-foreground">Overzicht van gesloten dossiers wordt binnenkort beschikbaar.</p>
          </div>
        );
      case 'invoices':
        return (
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Facturen</h2>
            <p className="text-muted-foreground">Factuurbeheer wordt binnenkort beschikbaar.</p>
          </div>
        );
      case 'phone-calls':
        return (
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Telefoongesprekken</h2>
            <p className="text-muted-foreground">Overzicht van telefoongesprekken wordt binnenkort beschikbaar.</p>
          </div>
        );
      case 'emails':
        return (
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">E-mails</h2>
            <p className="text-muted-foreground">E-mailbeheer wordt binnenkort beschikbaar.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-card rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Instellingen</h2>
            <p className="text-muted-foreground">Instellingen worden binnenkort beschikbaar.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentView={currentView}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;
