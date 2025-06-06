
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Menu, 
  Bell, 
  User,
  LogOut,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationSelector } from './OrganizationSelector';
import type { ViewType } from '@/pages/Index';

interface HeaderProps {
  currentView: ViewType;
  onToggleSidebar: () => void;
  onAccountView: () => void;
}

const getViewTitle = (view: ViewType): string => {
  const titles: Record<ViewType, string> = {
    'overview': 'Dashboard',
    'pending-tasks': 'Openstaande Taken',
    'actions': 'AI Acties',
    'documents': 'Documenten',
    'active-dossiers': 'Actieve Dossiers',
    'closed-dossiers': 'Gesloten Dossiers',
    'invoices': 'Facturen',
    'phone-calls': 'Telefoongesprekken',
    'emails': 'E-mails',
    'contacts': 'Contacten',
    'settings': 'Instellingen',
    'my-account': 'Mijn Account',
  };
  return titles[view] || 'Dashboard';
};

export const Header = ({ currentView, onToggleSidebar, onAccountView }: HeaderProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user?.email) return 'Gebruiker';
    return user.email.split('@')[0];
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getViewTitle(currentView)}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Organization Selector - only show if user has organizations */}
          <div className="hidden md:block">
            <OrganizationSelector />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onAccountView}>
                <User className="mr-2 h-4 w-4" />
                <span>Mijn Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Instellingen</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Uitloggen</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Organization Selector */}
      <div className="md:hidden mt-4">
        <OrganizationSelector />
      </div>
    </header>
  );
};
