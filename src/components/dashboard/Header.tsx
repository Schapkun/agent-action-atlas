import { Button } from '@/components/ui/button';
import { Menu, Bell, User } from 'lucide-react';
import type { ViewType } from '@/pages/Index';

interface HeaderProps {
  currentView: ViewType;
  onToggleSidebar: () => void;
}

export const Header = ({ currentView, onToggleSidebar }: HeaderProps) => {
  const getTitle = (view: ViewType) => {
    switch (view) {
      case 'overview':
        return 'Dashboard Overzicht';
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
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
