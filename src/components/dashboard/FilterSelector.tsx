
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Briefcase, Star } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

export const FilterSelector = () => {
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
        <SelectContent className="w-64 max-h-80">
          {/* Show all data option */}
          <SelectItem value="all" className="py-2 pl-8 pr-12 relative">
            <div className="flex items-center w-full">
              <span className="text-sm font-medium">Alle gegevens</span>
            </div>
            <Star 
              className={`h-3.5 w-3.5 cursor-pointer hover:text-yellow-500 transition-colors absolute right-4 top-1/2 transform -translate-y-1/2 ${favoriteFilter === 'all' ? 'fill-current text-yellow-500' : 'text-gray-400'}`}
              onClick={(e) => handleSetFavorite('all', e)}
            />
          </SelectItem>

          {groupedOptions.map((group) => (
            <div key={group.organization.id}>
              {/* Organization option */}
              <SelectItem value={`org:${group.organization.id}`} className="py-2 pl-8 pr-12 border-t border-border relative">
                <div className="flex items-center gap-2 w-full">
                  <Building2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">{group.organization.name}</span>
                    <span className="text-xs text-muted-foreground">Hele organisatie</span>
                  </div>
                </div>
                <Star 
                  className={`h-3.5 w-3.5 cursor-pointer hover:text-yellow-500 transition-colors absolute right-4 top-1/2 transform -translate-y-1/2 ${favoriteFilter === `org:${group.organization.id}` ? 'fill-current text-yellow-500' : 'text-gray-400'}`}
                  onClick={(e) => handleSetFavorite(`org:${group.organization.id}`, e)}
                />
              </SelectItem>
              
              {/* Workspaces under this organization */}
              {group.workspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={`workspace:${workspace.id}`} className="py-2 pl-10 pr-12 relative">
                  <div className="flex items-center gap-2 w-full">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{workspace.name}</span>
                  </div>
                  <Star 
                    className={`h-3.5 w-3.5 cursor-pointer hover:text-yellow-500 transition-colors absolute right-4 top-1/2 transform -translate-y-1/2 ${favoriteFilter === `workspace:${workspace.id}` ? 'fill-current text-yellow-500' : 'text-gray-400'}`}
                    onClick={(e) => handleSetFavorite(`workspace:${workspace.id}`, e)}
                  />
                </SelectItem>
              ))}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
