
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  Mail
} from 'lucide-react';
import type { ViewType } from '@/pages/Index';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ currentView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) => {
  const menuItems = [
    { id: 'overview' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'actions' as ViewType, label: 'AI Acties', icon: Activity },
    { id: 'documents' as ViewType, label: 'Documenten', icon: FolderOpen },
    { id: 'active-dossiers' as ViewType, label: 'Actieve Dossiers', icon: FileText },
    { id: 'closed-dossiers' as ViewType, label: 'Gesloten Dossiers', icon: FolderX },
    { id: 'invoices' as ViewType, label: 'Facturen', icon: CreditCard },
    { id: 'phone-calls' as ViewType, label: 'Telefoongesprekken', icon: Phone },
    { id: 'emails' as ViewType, label: 'E-mails', icon: Mail },
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
                  "w-full justify-start",
                  collapsed && "px-3"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
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
