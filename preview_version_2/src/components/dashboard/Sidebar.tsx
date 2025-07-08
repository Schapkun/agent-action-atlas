import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePendingTasksRealtime } from '@/hooks/usePendingTasksRealtime';
import { 
  LayoutDashboard, 
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
  ChevronDown,
  ChevronRight,
  Plus,
  Send,
  FileCheck,
  FileSpreadsheet,
  Folder,
  HelpCircle
} from 'lucide-react';

// Custom WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={className}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
  </svg>
);

export type ViewType = 'overview' | 'actions' | 'documents' | 'active-dossiers' | 'closed-dossiers' | 'dossiers' | 'invoices' | 'quotes' | 'phone-calls' | 'whatsapp' | 'emails' | 'contacts' | 'settings' | 'support';

interface SidebarProps {
  currentView: ViewType;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar = ({ 
  currentView, 
  collapsed, 
  onToggleCollapse
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const { pendingTasksCount } = usePendingTasksRealtime();

  useEffect(() => {
    try {
      const path = location.pathname;
      const search = location.search;
      const newExpandedMenus: string[] = [];

      console.log('Current path:', path, 'Search:', search);

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
      
      if (currentPath === path) {
        console.log('Exact match found for:', path);
        return true;
      }
      
      if (path === '/clienten' && (currentPath === '/clienten' || currentPath === '/contacten')) {
        return true;
      }
      
      if (path === '/facturen?status=draft' && currentPath === '/facturen' && currentSearch === '?status=draft') {
        return true;
      }
      if (path === '/facturen?status=sent' && currentPath === '/facturen' && currentSearch === '?status=sent') {
        return true;
      }
      
      if (path === '/offertes?status=draft' && currentPath === '/offertes' && currentSearch === '?status=draft') {
        return true;
      }
      if (path === '/offertes?status=sent' && currentPath === '/offertes' && currentSearch === '?status=sent') {
        return true;
      }
      
      if (path === '/documenten?status=sent' && currentPath === '/documenten' && currentSearch === '?status=sent') {
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
      
      console.log('Checking submenu:', parentId, 'for path:', path);
      
      if (parentId === 'invoices') {
        return path.startsWith('/facturen');
      }
      if (parentId === 'quotes') {
        return path.startsWith('/offertes');
      }
      if (parentId === 'documents') {
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
    { id: 'overview' as ViewType, label: 'Dashboard', icon: LayoutDashboard, badge: pendingTasksCount, path: '/' },
    { id: 'contacts' as ViewType, label: 'Cliënten', icon: Users, path: '/clienten' },
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
      path: '/documenten/nieuw',
      hasSubmenu: true,
      submenu: [
        { id: 'new-document', label: 'Opstellen', icon: Plus, path: '/documenten/nieuw' },
        { id: 'concept-documents', label: 'Concepten', icon: FileCheck, path: '/documenten?status=draft' },
        { id: 'sent-documents', label: 'Verzonden', icon: Send, path: '/documenten?status=sent' },
      ]
    },
    { 
      id: 'invoices' as ViewType, 
      label: 'Facturen', 
      icon: CreditCard, 
      path: '/facturen/nieuw',
      hasSubmenu: true,
      submenu: [
        { id: 'new-invoice', label: 'Opstellen', icon: Plus, path: '/facturen/nieuw' },
        { id: 'concept-invoices', label: 'Concepten', icon: FileCheck, path: '/facturen?status=draft' },
        { id: 'sent-invoices', label: 'Verzonden', icon: Send, path: '/facturen?status=sent' },
      ]
    },
    { 
      id: 'quotes' as ViewType, 
      label: 'Offertes', 
      icon: FileSpreadsheet, 
      path: '/offertes/nieuw',
      hasSubmenu: true,
      submenu: [
        { id: 'new-quote', label: 'Opstellen', icon: Plus, path: '/offertes/nieuw' },
        { id: 'concept-quotes', label: 'Concepten', icon: FileCheck, path: '/offertes?status=draft' },
        { id: 'sent-quotes', label: 'Verzonden', icon: Send, path: '/offertes?status=sent' },
      ]
    },
    { id: 'phone-calls' as ViewType, label: 'Telefoongesprekken', icon: Phone, path: '/telefoongesprekken' },
    { id: 'whatsapp' as ViewType, label: 'WhatsApp', icon: WhatsAppIcon, path: '/whatsapp' },
    { id: 'emails' as ViewType, label: 'E-mails', icon: Mail, path: '/e-mails' },
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
      "bg-card border-r border-border flex flex-col h-full relative",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border flex-shrink-0">
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
      <nav className="flex-1 p-4 overflow-y-auto">
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

      {/* Support Link - Always visible at bottom */}
      <div className="p-4 border-t border-border bg-card flex-shrink-0">
        <Button
          variant={location.pathname === '/support' ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            collapsed && "px-3",
            location.pathname === '/support' && "bg-primary/10 text-primary font-medium"
          )}
          onClick={() => navigate('/support')}
        >
          <HelpCircle className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Hulp & Support</span>}
        </Button>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border bg-card flex-shrink-0">
          <div className="text-xs text-muted-foreground">
            Meester.app v1.0
          </div>
        </div>
      )}
    </div>
  );
};
