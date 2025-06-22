
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Users,
  FileText,
  Receipt,
  Calendar,
  Settings,
  Phone,
  Mail,
  ClipboardList,
  FolderOpen,
  FolderClosed,
  Zap,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Cliënten', href: '/contacten', icon: Users },
  { name: 'Facturen', href: '/facturen', icon: Receipt },
  { name: 'Offertes', href: '/offertes', icon: FileText },
  { name: 'Documenten', href: '/documenten', icon: FileText },
  { name: 'Acties', href: '/acties', icon: Zap },
  { name: 'Actieve Dossiers', href: '/dossiers', icon: FolderOpen },
  { name: 'Gesloten Dossiers', href: '/dossiers/gesloten', icon: FolderClosed },
  { name: 'Openstaande Taken', href: '/taken', icon: ClipboardList },
  { name: 'Telefoongesprekken', href: '/gesprekken', icon: Phone },
  { name: 'E-mails', href: '/emails', icon: Mail },
  { name: 'Instellingen', href: '/instellingen', icon: Settings },
];

const SidebarContent = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-center h-16 px-4 border-b">
        <h1 className="text-xl font-bold text-primary">InvoiceApp</h1>
      </div>
      
      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
                           (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onMobileToggle }) => {
  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileToggle}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-background">
        <SidebarContent />
      </div>
    </>
  );
};

// Mobile menu button component
export const MobileMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="lg:hidden"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  );
};
