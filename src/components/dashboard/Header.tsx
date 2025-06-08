
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Menu, Bell, LogOut, Building2, Users, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import type { ViewType } from '@/components/dashboard/Sidebar';

interface HeaderProps {
  currentView: ViewType;
  onToggleSidebar: () => void;
}

export const Header = ({ currentView, onToggleSidebar }: HeaderProps) => {
  const { signOut } = useAuth();
  const { 
    organizations, 
    workspaces, 
    selectedOrganization, 
    selectedWorkspace, 
    setSelectedOrganization, 
    setSelectedWorkspace,
    isLoadingOrganizations 
  } = useOrganization();
  const { toast } = useToast();
  const [favoriteFilter, setFavoriteFilter] = useState<string | null>(null);

  // Load favorite filter from localStorage on component mount
  useEffect(() => {
    const savedFavorite = localStorage.getItem('favoriteFilter');
    if (savedFavorite) {
      setFavoriteFilter(savedFavorite);
      // Apply the favorite filter if it exists
      handleSelectionChange(savedFavorite);
    }
  }, [organizations, workspaces]);

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

  const handleSelectionChange = (value: string) => {
    if (value === 'all') {
      // Show all data - reset selections
      setSelectedOrganization(null);
      setSelectedWorkspace(null);
    } else if (value.startsWith('org:')) {
      const orgId = value.substring(4);
      const organization = organizations.find(org => org.id === orgId);
      if (organization) {
        setSelectedOrganization(organization);
        setSelectedWorkspace(null);
      }
    } else if (value.startsWith('workspace:')) {
      const workspaceId = value.substring(10);
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        const organization = organizations.find(org => org.id === workspace.organization_id);
        setSelectedOrganization(organization || null);
        setSelectedWorkspace(workspace);
      }
    }
  };

  const handleSetFavorite = (value: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setFavoriteFilter(value);
    localStorage.setItem('favoriteFilter', value);
    toast({
      title: "Favoriet ingesteld",
      description: "Deze filter wordt nu standaard geladen.",
    });
  };

  const getCurrentSelectionValue = () => {
    if (selectedWorkspace) {
      return `workspace:${selectedWorkspace.id}`;
    } else if (selectedOrganization) {
      return `org:${selectedOrganization.id}`;
    }
    return 'all';
  };

  const getCurrentSelectionLabel = () => {
    if (selectedWorkspace) {
      return selectedWorkspace.name;
    } else if (selectedOrganization) {
      return `${selectedOrganization.name} (hele organisatie)`;
    }
    return 'Alle gegevens';
  };

  // Group workspaces by organization for better display
  const groupedOptions = organizations.map(org => ({
    organization: org,
    workspaces: workspaces.filter(w => w.organization_id === org.id)
  }));

  return (
    <header className="bg-card border-b border-border px-6" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
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
          {/* Filter Label and Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Filter</span>
            <Select
              value={getCurrentSelectionValue()}
              onValueChange={handleSelectionChange}
              disabled={isLoadingOrganizations}
            >
              <SelectTrigger className="w-64 border-2 border-foreground">
                <SelectValue>
                  {isLoadingOrganizations ? 'Laden...' : getCurrentSelectionLabel()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-64">
                {/* Show all data option */}
                <SelectItem value="all" className="py-3">
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">Alle gegevens</span>
                    <Star 
                      className={`h-4 w-4 cursor-pointer hover:text-yellow-500 transition-colors ${favoriteFilter === 'all' ? 'fill-current text-yellow-500' : 'text-gray-400'}`}
                      onClick={(e) => handleSetFavorite('all', e)}
                    />
                  </div>
                </SelectItem>

                {groupedOptions.map((group) => (
                  <div key={group.organization.id} className="border-t border-border mt-1 pt-1">
                    {/* Organization header */}
                    <SelectItem value={`org:${group.organization.id}`} className="py-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{group.organization.name}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">hele organisatie</span>
                        </div>
                        <Star 
                          className={`h-4 w-4 cursor-pointer hover:text-yellow-500 transition-colors ${favoriteFilter === `org:${group.organization.id}` ? 'fill-current text-yellow-500' : 'text-gray-400'}`}
                          onClick={(e) => handleSetFavorite(`org:${group.organization.id}`, e)}
                        />
                      </div>
                    </SelectItem>
                    
                    {/* Workspaces under this organization */}
                    {group.workspaces.map((workspace) => (
                      <SelectItem key={workspace.id} value={`workspace:${workspace.id}`} className="py-2.5 pl-8">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm">{workspace.name}</span>
                          </div>
                          <Star 
                            className={`h-4 w-4 cursor-pointer hover:text-yellow-500 transition-colors ${favoriteFilter === `workspace:${workspace.id}` ? 'fill-current text-yellow-500' : 'text-gray-400'}`}
                            onClick={(e) => handleSetFavorite(`workspace:${workspace.id}`, e)}
                          />
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
