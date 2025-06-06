
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Building, Users } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

export const OrganizationSelector = () => {
  const {
    organizations,
    currentOrganization,
    workspaces,
    currentWorkspace,
    setCurrentOrganization,
    setCurrentWorkspace,
    loading
  } = useOrganization();

  if (loading || !currentOrganization) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Building className="h-4 w-4" />
        <span>Laden...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Organization Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center space-x-2">
            <Building className="h-4 w-4" />
            <span className="max-w-[150px] truncate">{currentOrganization.name}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Organisaties</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => setCurrentOrganization(org)}
              className={currentOrganization.id === org.id ? "bg-accent" : ""}
            >
              <Building className="h-4 w-4 mr-2" />
              {org.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Workspace Selector */}
      {workspaces.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="max-w-[150px] truncate">
                {currentWorkspace ? currentWorkspace.name : 'Selecteer werkruimte'}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[200px]">
            <DropdownMenuLabel>Werkruimtes</DropdownMenuLabel>
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
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
