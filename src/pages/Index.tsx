
import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { ActionOverview } from '@/components/dashboard/ActionOverview';
import { DocumentManager } from '@/components/dashboard/DocumentManager';
import { DashboardStats } from '@/components/dashboard/DashboardStats';

export type ViewType = 'overview' | 'actions' | 'documents' | 'settings';

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
