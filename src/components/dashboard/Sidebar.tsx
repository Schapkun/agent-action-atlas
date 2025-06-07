
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  FolderOpen, 
  Settings, 
  ChevronLeft,
  Scale,
  FileText,
  FolderX,
  CreditCard,
  Phone,
  Mail,
  Users,
  Clock
} from 'lucide-react';

export type ViewType = 'overview' | 'pending-tasks' | 'actions' | 'documents' | 'active-dossiers' | 'closed-dossiers' | 'invoices' | 'phone-calls' | 'emails' | 'contacts' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingTasksCount?: number;
}

export const Sidebar = ({ 
  currentView, 
  collapsed, 
  onToggleCollapse,
  pendingTasksCount = 0 
}: SidebarProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview' as ViewType, label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'pending-tasks' as ViewType, label: 'Openstaande Taken', icon: Clock, badge: pendingTasksCount, path: '/openstaande-taken' },
    { id: 'actions' as ViewType, label: 'AI Acties', icon: Activity, path: '/ai-acties' },
    { id: 'documents' as ViewType, label: 'Documenten', icon: FolderOpen, path: '/documenten' },
    { id: 'active-dossiers' as ViewType, label: 'Actieve Dossiers', icon: FileText, path: '/actieve-dossiers' },
    { id: 'closed-dossiers' as ViewType, label: 'Gesloten Dossiers', icon: FolderX, path: '/gesloten-dossiers' },
    { id: 'invoices' as ViewType, label: 'Facturen', icon: CreditCard, path: '/facturen' },
    { id: 'phone-calls' as ViewType, label: 'Telefoongesprekken', icon: Phone, path: '/telefoongesprekken' },
    { id: 'emails' as ViewType, label: 'E-mails', icon: Mail, path: '/e-mails' },
    { id: 'contacts' as ViewType, label: 'Contacten', icon: Users, path: '/contacten' },
    { id: 'settings' as ViewType, label: 'Instellingen', icon: Settings, path: '/instellingen' },
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
                onClick={() => navigate(item.path)}
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
