
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  FileText, 
  Settings, 
  ChevronLeft,
  Scale,
  FolderOpen,
  FolderX,
  CreditCard,
  Phone,
  Mail,
  Users,
  Clock
} from 'lucide-react';
import type { ViewType } from '@/pages/Index';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ 
  currentView, 
  onViewChange, 
  collapsed, 
  onToggleCollapse
}: SidebarProps) => {
  const [pendingTasksCount, setPendingTasksCount] = useState(3);

  // Calculate actual pending tasks count by checking localStorage
  useEffect(() => {
    const calculatePendingTasks = () => {
      const savedApprovedTasks = localStorage.getItem('approvedTasks');
      let approvedTaskIds: string[] = [];
      
      if (savedApprovedTasks) {
        try {
          approvedTaskIds = JSON.parse(savedApprovedTasks);
        } catch (error) {
          console.error('Error parsing approved tasks:', error);
        }
      }

      // Mock total tasks (should match the tasks in PendingTasks component)
      const totalTasks = 3; // d4, e1, d7
      const actualPendingCount = totalTasks - approvedTaskIds.length;
      setPendingTasksCount(Math.max(0, actualPendingCount));
    };

    // Calculate on mount
    calculatePendingTasks();

    // Listen for storage changes to update count when tasks are approved
    const handleStorageChange = () => {
      calculatePendingTasks();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for manual localStorage updates (same tab)
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'approvedTasks') {
        calculatePendingTasks();
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  const menuItems = [
    { id: 'overview' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pending-tasks' as ViewType, label: 'Openstaande Taken', icon: Clock, badge: pendingTasksCount },
    { id: 'actions' as ViewType, label: 'AI Acties', icon: Activity },
    { id: 'documents' as ViewType, label: 'Documenten', icon: FileText },
    { id: 'active-dossiers' as ViewType, label: 'Actieve Dossiers', icon: FolderOpen },
    { id: 'closed-dossiers' as ViewType, label: 'Gesloten Dossiers', icon: FolderX },
    { id: 'invoices' as ViewType, label: 'Facturen', icon: CreditCard },
    { id: 'phone-calls' as ViewType, label: 'Telefoongesprekken', icon: Phone },
    { id: 'emails' as ViewType, label: 'E-mails', icon: Mail },
    { id: 'contacts' as ViewType, label: 'Contacten', icon: Users },
    { id: 'settings' as ViewType, label: 'Instellingen', icon: Settings },
  ];

  return (
    <div className={cn(
      "bg-card border-r border-border flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <Scale className="h-6 w-6 text-primary" />
              <span className="font-semibold text-foreground">AI Juridisch</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="ml-auto"
          >
            <ChevronLeft className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Button
                variant={currentView === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start relative",
                  collapsed && "px-3"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && (
                  <>
                    <span className="ml-3">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-auto bg-orange-100 text-orange-700 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {collapsed && item.badge && item.badge > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 bg-orange-100 text-orange-700 text-xs h-5 w-5 p-0 flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground">
            AI Agent Dashboard v1.0
          </div>
        </div>
      )}
    </div>
  );
};
