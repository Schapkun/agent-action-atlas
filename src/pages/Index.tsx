
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface IndexProps {
  children: React.ReactNode;
}

const Index = ({ children }: IndexProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Determine current view from URL
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/') return 'overview';
    if (path === '/openstaande-taken') return 'pending-tasks';
    if (path === '/ai-acties') return 'actions';
    if (path === '/documenten' || path.startsWith('/documenten/')) return 'documents';
    if (path === '/actieve-dossiers') return 'active-dossiers';
    if (path === '/gesloten-dossiers') return 'closed-dossiers';
    if (path === '/facturen' || path.startsWith('/facturen/')) return 'invoices';
    if (path === '/offertes' || path.startsWith('/offertes/')) return 'quotes';
    if (path === '/telefoongesprekken') return 'phone-calls';
    if (path === '/e-mails') return 'emails';
    if (path === '/contacten') return 'contacts';
    if (path === '/instellingen') return 'settings';
    return 'overview';
  };

  const currentView = getCurrentView();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex w-full">
        <div className={cn(
          "fixed left-0 top-0 h-full z-40 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}>
          <Sidebar 
            currentView={currentView} 
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>
        
        <div className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          <Header 
            currentView={currentView}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="flex-1 overflow-auto p-6 w-full">
            <div className="w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
