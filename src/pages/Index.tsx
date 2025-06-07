
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { ProtectedRoute } from '@/components/ProtectedRoute';

interface IndexProps {
  children: React.ReactNode;
}

const Index = ({ children }: IndexProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Calculate pending tasks count - currently 0 since we removed all mock data
  const pendingTasksCount = 0;

  // Determine current view from URL
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === '/') return 'overview';
    if (path === '/pending-tasks') return 'pending-tasks';
    if (path === '/actions') return 'actions';
    if (path === '/documents') return 'documents';
    if (path === '/active-dossiers') return 'active-dossiers';
    if (path === '/closed-dossiers') return 'closed-dossiers';
    if (path === '/invoices') return 'invoices';
    if (path === '/phone-calls') return 'phone-calls';
    if (path === '/emails') return 'emails';
    if (path === '/contacts') return 'contacts';
    if (path === '/settings') return 'settings';
    return 'overview';
  };

  const currentView = getCurrentView();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background flex w-full">
        <Sidebar 
          currentView={currentView} 
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          pendingTasksCount={pendingTasksCount}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            currentView={currentView}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
