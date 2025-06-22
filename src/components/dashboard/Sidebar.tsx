import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Clock,
  ChevronDown,
  ChevronRight,
  Plus,
  Send,
  FileCheck,
  FileSpreadsheet,
  Folder
} from 'lucide-react';

export type ViewType = 'overview' | 'pending-tasks' | 'actions' | 'documents' | 'active-dossiers' | 'closed-dossiers' | 'dossiers' | 'invoices' | 'quotes' | 'phone-calls' | 'emails' | 'contacts' | 'settings';

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
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Auto-expand submenu's based on current route and auto-collapse others
  useEffect(() => {
    try {
      const path = location.pathname;
      const search = location.search;
      const newExpandedMenus: string[] = [];

      console.log('Current path:', path, 'Search:', search);

      // Check if we're on a page that should have its submenu expanded
      if (path.startsWith('/facturen')) {
        newExpandedMenus.push('invoices');
      } else if (path.startsWith('/offertes')) {
        newExpandedMenus.push('quotes');
      } else if (path.startsWith('/documenten')) {
        newExpandedMenus.push('documents');
      } else if (path.startsWith('/actieve-dossiers') || path.startsWith('/gesloten-dossiers')) {
        newExpandedMenus.push('dossiers');
      }

      console.log('Expanded menus:', newExpandedMenus);

      // Set only the relevant submenu as expanded (auto-collapse others)
      setExpandedMenus(newExpandedMenus);
    } catch (error) {
      console.error('Error in useEffect:', error);
      setExpandedMenus([]);
    }
  }, [location.pathname, location.search]);

  const isActiveRoute = (path: string) => {
    try {
      const currentPath = location.pathname;
      const currentSearch = location.search;
      
      console.log('Checking route:', path, 'against current:', currentPath, currentSearch);
      
      // Handle exact path matches first
      if (currentPath === path) {
        console.log('Exact match found for:', path);
        return true;
      }
      
      // Handle URL parameter matches for invoices
      if (path === '/facturen?status=draft' && currentPath === '/facturen' && currentSearch === '?status=draft') {
        return true;
      }
      if (path === '/facturen?status=sent' && currentPath === '/facturen' && currentSearch === '?status=sent') {
        return true;
      }
      
      // Handle URL parameter matches for quotes
      if (path === '/offertes?status=draft' && currentPath === '/offertes' && currentSearch === '?status=draft') {
        return true;
      }
      if (path === '/offertes?status=sent' && currentPath === '/offertes' && currentSearch === '?status=sent') {
        return true;
      }
      
      // Handle URL parameter matches for documents
      if (path === '/documenten?status=sent' && currentPath === '/documenten' && currentSearch === '?status=sent') {
        return true;
      }
      
      // FALLBACK LOGIC: Handle base routes without parameters
      // For /facturen (no params) -> highlight "Concepten" (draft status)
      if (currentPath === '/facturen' && currentSearch === '' && path === '/facturen?status=draft') {
        console.log('Fallback: highlighting Concepten for base /facturen route');
        return true;
      }
      
      // For /offertes (no params) -> highlight "Concepten" (draft status)  
      if (currentPath === '/offertes' && currentSearch === '' && path === '/offertes?status=draft') {
        console.log('Fallback: highlighting Concepten for base /offertes route');
        return true;
      }
      
      // For /documenten (no params) -> highlight "Opstellen"
      if (currentPath === '/documenten' && currentSearch === '' && path === '/documenten/opstellen') {
        console.log('Fallback: highlighting Opstellen for base /documenten route');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in isActiveRoute:', error);
      return false;
    }
  };

  const isActiveSubmenu = (parentId: string) => {
    try {
      const path = location.pathname;
      const search = location.search;
      
      console.log('Checking submenu:', parentId, 'for path:', path);
      
      if (parentId === 'invoices') {
        // Check if we're on any invoice-related page
        return path.startsWith('/facturen');
      }
      if (parentId === 'quotes') {
        // Check if we're on any quote-related page
        return path.startsWith('/offertes');
      }
      if (parentId === 'documents') {
        // Check if we're on any document-related page
        return path.startsWith('/documenten');
      }
      if (parentId === 'dossiers') {
        return path.startsWith('/actieve-dossiers') || path.startsWith('/gesloten-dossiers');
      }
      return false;
    } catch (error) {
      console.error('Error in isActiveSubmenu:', error);
      return false;
    }
  };

  const menuItems = [
    { id: 'overview' as ViewType, label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'pending-tasks' as ViewType, label: 'Openstaande Taken', icon: Clock, badge: pendingTasksCount, path: '/openstaande-taken' },
    { id: 'actions' as ViewType, label: 'AI Acties', icon: Activity, path: '/ai-acties' },
    { 
      id: 'dossiers' as ViewType, 
      label: 'Dossiers', 
      icon: Folder, 
      path: '/actieve-dossiers',
      hasSubmenu: true,
      submenu: [
        { id: 'active-dossiers', label: 'Actieve Dossiers', icon: FolderOpen, path: '/actieve-dossiers' },
        { id: 'closed-dossiers', label: 'Gesloten Dossiers', icon: FolderX, path: '/gesloten-dossiers' },
      ]
    },
    { 
      id: 'documents' as ViewType, 
      label: 'Documenten', 
      icon: FileText, 
      path: '/documenten/opstellen',
      hasSubmenu: true,
      submenu: [
        { id: 'new-document', label: 'Opstellen', icon: Plus, path: '/documenten/opstellen' },
        { id: 'document-list', label: 'Overzicht', icon: FileCheck, path: '/documenten' },
        { id: 'sent-documents', label: 'Verzonden', icon: Send, path: '/documenten?status=sent' },
      ]
    },
    { 
      id: 'invoices' as ViewType, 
      label: 'Facturen', 
      icon: CreditCard, 
      path: '/facturen',
      hasSubmenu: true,
      submenu: [
        { id: 'new-invoice', label: 'Opstellen', icon: Plus, path: '/facturen/opstellen' },
        { id: 'concept-invoices', label: 'Concepten', icon: FileCheck, path: '/facturen?status=draft' },
        { id: 'sent-invoices', label: 'Verzonden', icon: Send, path: '/facturen?status=sent' },
      ]
    },
    { 
      id: 'quotes' as ViewType, 
      label: 'Offertes', 
      icon: FileSpreadsheet, 
      path: '/offertes',
      hasSubmenu: true,
      submenu: [
        { id: 'new-quote', label: 'Opstellen', icon: Plus, path: '/offertes/opstellen' },
        { id: 'concept-quotes', label: 'Concepten', icon: FileCheck, path: '/offertes?status=draft' },
        { id: 'sent-quotes', label: 'Verzonden', icon: Send, path: '/offertes?status=sent' },
      ]
    },
    { id: 'phone-calls' as ViewType, label: 'Telefoongesprekken', icon: Phone, path: '/telefoongesprekken' },
    { id: 'emails' as ViewType, label: 'E-mails', icon: Mail, path: '/e-mails' },
    { id: 'contacts' as ViewType, label: 'Contacten', icon: Users, path: '/contacten' },
    { id: 'settings' as ViewType, label: 'Instellingen', icon: Settings, path: '/instellingen' },
  ];

  const handleMenuClick = (item: any, submenuItem?: any) => {    
    try {
      const path = submenuItem?.path || item.path;
      console.log('Navigating to:', path);
      navigate(path);
    } catch (error) {
      console.error('Error in handleMenuClick:', error);
    }
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
                variant={isActiveRoute(item.path) || isActiveSubmenu(item.id) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start relative",
                  collapsed && "px-3",
                  (isActiveRoute(item.path) || isActiveSubmenu(item.id)) && "bg-primary/10 text-primary font-medium"
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
                        variant={isActiveRoute(submenuItem.path) ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start text-sm",
                          isActiveRoute(submenuItem.path) && "bg-primary/10 text-primary font-medium"
                        )}
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
