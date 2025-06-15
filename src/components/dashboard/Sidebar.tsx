
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  Send,
  Eye,
  FileCheck,
  Calculator
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
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['invoices']);

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuId) 
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const menuItems = [
    { id: 'overview' as ViewType, label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'pending-tasks' as ViewType, label: 'Openstaande Taken', icon: Clock, badge: pendingTasksCount, path: '/openstaande-taken' },
    { id: 'actions' as ViewType, label: 'AI Acties', icon: Activity, path: '/ai-acties' },
    { id: 'documents' as ViewType, label: 'Documenten', icon: FolderOpen, path: '/documenten' },
    { id: 'active-dossiers' as ViewType, label: 'Actieve Dossiers', icon: FileText, path: '/actieve-dossiers' },
    { id: 'closed-dossiers' as ViewType, label: 'Gesloten Dossiers', icon: FolderX, path: '/gesloten-dossiers' },
    { 
      id: 'invoices' as ViewType, 
      label: 'Facturen', 
      icon: CreditCard, 
      path: '/facturen',
      hasSubmenu: true,
      submenu: [
        { id: 'new-invoice', label: 'Opstellen', icon: Plus, action: 'new-invoice' },
        { id: 'sent-invoices', label: 'Verzonden', icon: Send, path: '/facturen?status=sent' },
        { id: 'concept-invoices', label: 'Concepten', icon: FileCheck, path: '/facturen?status=draft' },
        { id: 'paid-invoices', label: 'Betaald', icon: Calculator, path: '/facturen?status=paid' },
      ]
    },
    { id: 'phone-calls' as ViewType, label: 'Telefoongesprekken', icon: Phone, path: '/telefoongesprekken' },
    { id: 'emails' as ViewType, label: 'E-mails', icon: Mail, path: '/e-mails' },
    { id: 'contacts' as ViewType, label: 'Contacten', icon: Users, path: '/contacten' },
    { id: 'settings' as ViewType, label: 'Instellingen', icon: Settings, path: '/instellingen' },
  ];

  const handleMenuClick = (item: any, submenuItem?: any) => {
    if (submenuItem?.action === 'new-invoice') {
      // Trigger new invoice dialog - we'll implement this in the parent
      const event = new CustomEvent('openNewInvoiceDialog');
      window.dispatchEvent(event);
      return;
    }
    
    if (item.hasSubmenu && !submenuItem) {
      toggleSubmenu(item.id);
      return;
    }
    
    const path = submenuItem?.path || item.path;
    navigate(path);
  };

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
              <span className="font-semibold text-foreground">Meester.app</span>
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
              {/* Main menu item */}
              <Button
                variant={currentView === item.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start relative",
                  collapsed && "px-3"
                )}
                onClick={() => handleMenuClick(item)}
              >
                <item.icon className="h-4 w-4" />
                {!collapsed && (
                  <>
                    <span className="ml-3 flex-1 text-left">{item.label}</span>
                    {item.hasSubmenu && (
                      expandedMenus.includes(item.id) ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                    )}
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

              {/* Submenu */}
              {item.hasSubmenu && !collapsed && expandedMenus.includes(item.id) && (
                <ul className="ml-6 mt-2 space-y-1">
                  {item.submenu?.map((submenuItem) => (
                    <li key={submenuItem.id}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-sm"
                        onClick={() => handleMenuClick(item, submenuItem)}
                      >
                        <submenuItem.icon className="h-3 w-3" />
                        <span className="ml-2">{submenuItem.label}</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
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
