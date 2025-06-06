
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Bell, LogOut, ChevronDown, Building, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import type { ViewType } from '@/pages/Index';

interface HeaderProps {
  currentView: ViewType;
  onToggleSidebar: () => void;
}

export const Header = ({ currentView, onToggleSidebar }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { 
    organizations, 
    currentOrganization, 
    workspaces, 
    currentWorkspace, 
    setCurrentOrganization, 
    setCurrentWorkspace 
  } = useOrganization();
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
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {getInitials(user.user_metadata?.full_name || user.email || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    {currentOrganization && (
                      <span className="text-xs text-muted-foreground">
                        {currentOrganization.name}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Organization Selection */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Building className="h-4 w-4 mr-2" />
                    <span>Organisatie</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuLabel>Selecteer Organisatie</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {organizations.map((org) => (
                      <DropdownMenuItem
                        key={org.id}
                        onClick={() => setCurrentOrganization(org)}
                        className={currentOrganization?.id === org.id ? "bg-accent" : ""}
                      >
                        <Building className="h-4 w-4 mr-2" />
                        {org.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Workspace Selection */}
                {workspaces.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Users className="h-4 w-4 mr-2" />
                      <span>Werkruimte</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuLabel>Selecteer Werkruimte</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {workspaces.map((workspace) => (
                        <DropdownMenuItem
                          key={workspace.id}
                          onClick={() => setCurrentWorkspace(workspace)}
                          className={currentWorkspace?.id === workspace.id ? "bg-accent" : ""}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          {workspace.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Uitloggen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
