
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HelpSupportMenu } from './HelpSupportMenu';
import { WorkspaceOrgSwitcher } from '@/components/settings/components/WorkspaceOrgSwitcher';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  FileText, 
  FolderOpen, 
  FolderX, 
  Receipt, 
  FileBarChart,
  Phone,
  Mail,
  Users,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type ViewType = 'overview' | 'pending-tasks' | 'actions' | 'documents' | 'active-dossiers' | 'closed-dossiers' | 'invoices' | 'quotes' | 'phone-calls' | 'emails' | 'contacts' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({ currentView, collapsed = false, onToggleCollapse }: SidebarProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', label: 'Overzicht', icon: LayoutDashboard, path: '/' },
    { id: 'pending-tasks', label: 'Openstaande Taken', icon: Clock, path: '/openstaande-taken' },
    { id: 'actions', label: 'AI Acties', icon: Sparkles, path: '/ai-acties' },
    { id: 'documents', label: 'Documenten', icon: FileText, path: '/documenten' },
    { id: 'active-dossiers', label: 'Actieve Dossiers', icon: FolderOpen, path: '/actieve-dossiers' },
    { id: 'closed-dossiers', label: 'Gesloten Dossiers', icon: FolderX, path: '/gesloten-dossiers' },
    { id: 'invoices', label: 'Facturen', icon: Receipt, path: '/facturen' },
    { id: 'quotes', label: 'Offertes', icon: FileBarChart, path: '/offertes' },
    { id: 'phone-calls', label: 'Telefoongesprekken', icon: Phone, path: '/telefoongesprekken' },
    { id: 'emails', label: 'E-mails', icon: Mail, path: '/e-mails' },
    { id: 'contacts', label: 'Contacten', icon: Users, path: '/contacten' },
    { id: 'settings', label: 'Instellingen', icon: Settings, path: '/instellingen' }
  ];

  return (
    <div className={cn(
      "border-r bg-background flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-xl font-bold text-primary">meester.app</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Organization/Workspace Switcher */}
      {!collapsed && (
        <div className="p-4 pb-2">
          <WorkspaceOrgSwitcher 
            hasUnsavedChanges={false}
            onSaveChanges={() => {}}
            onDiscardChanges={() => {}}
          />
        </div>
      )}

      <ScrollArea className="flex-1">
        {/* Main Navigation */}
        <div className="px-3 py-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left h-9",
                    collapsed ? "px-2" : "px-3",
                    isActive && "bg-secondary"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  <Icon className={cn("h-4 w-4", collapsed ? "" : "mr-3")} />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.id === 'pending-tasks' && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          0
                        </Badge>
                      )}
                    </>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Support Section */}
        {!collapsed && (
          <div className="mt-auto pt-4">
            <Separator className="mx-3" />
            <div className="mt-4">
              <HelpSupportMenu />
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
