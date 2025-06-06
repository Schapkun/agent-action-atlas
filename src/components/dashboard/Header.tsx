
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { OrganizationSelector } from './OrganizationSelector';
import type { ViewType } from '@/pages/Index';

interface HeaderProps {
  currentView: ViewType;
  onToggleSidebar: () => void;
}

export const Header = ({ currentView, onToggleSidebar }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Uitgelogd",
        description: "U bent succesvol uitgelogd.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Er is iets misgegaan bij het uitloggen.",
        variant: "destructive",
      });
    }
  };

  const getTitle = (view: ViewType) => {
    switch (view) {
      case 'overview':
        return 'Dashboard Overzicht';
      case 'pending-tasks':
        return 'Openstaande Taken';
      case 'actions':
        return 'AI Acties';
      case 'documents':
        return 'Documentbeheer';
      case 'active-dossiers':
        return 'Actieve Dossiers';
      case 'closed-dossiers':
        return 'Gesloten Dossiers';
      case 'invoices':
        return 'Facturen';
      case 'phone-calls':
        return 'Telefoongesprekken';
      case 'emails':
        return 'E-mails';
      case 'contacts':
        return 'Contacten';
      case 'settings':
        return 'Instellingen';
      default:
        return 'Dashboard';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">
            {getTitle(currentView)}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <OrganizationSelector />
          
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          
          {user && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {getInitials(user.user_metadata?.full_name || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground hidden md:block">
                {user.user_metadata?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
