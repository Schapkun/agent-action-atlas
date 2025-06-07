
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useOrganizationOperations } from './hooks/useOrganizationOperations';
import { usePermissions } from './hooks/usePermissions';
import { CreateOrganizationForm } from './components/CreateOrganizationForm';
import { OrganizationCard } from './components/OrganizationCard';
import type { Organization } from './types/organization';

interface OrganizationWorkspaceViewProps {
  userRole: string;
}

export const OrganizationWorkspaceView = ({ userRole }: OrganizationWorkspaceViewProps) => {
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateOrgForm, setShowCreateOrgForm] = useState(false);

  const {
    organizations,
    loading,
    fetchOrganizations,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace
  } = useOrganizationOperations();

  const { canCreateContent } = usePermissions(userRole);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    // Filter organizations and workspaces based on search term
    if (!searchTerm.trim()) {
      setFilteredOrganizations(organizations);
    } else {
      const filtered = organizations.map(org => {
        const orgMatches = org.name.toLowerCase().includes(searchTerm.toLowerCase());
        const hasMatchingWorkspace = org.workspaces.some(workspace =>
          workspace.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        return {
          ...org,
          workspaces: (orgMatches || hasMatchingWorkspace) ? org.workspaces : []
        };
      }).filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.workspaces.some(workspace => workspace.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredOrganizations(filtered);
    }
  }, [searchTerm, organizations]);

  const handleCreateOrganization = async (name: string) => {
    await createOrganization(name);
    setShowCreateOrgForm(false);
  };

  if (loading) {
    return <div>Laden...</div>;
  }

  const canCreate = canCreateContent();

  return (
    <div>
      {/* Search and Create Button Row */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Zoek organisaties en werkruimtes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateOrgForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nieuwe Organisatie
          </Button>
        )}
      </div>

      {/* Create Organization Form */}
      {showCreateOrgForm && (
        <CreateOrganizationForm
          onCreateOrganization={handleCreateOrganization}
          onCancel={() => setShowCreateOrgForm(false)}
        />
      )}

      {/* Organizations List */}
      {filteredOrganizations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          {searchTerm ? 'Geen organisaties of werkruimtes gevonden voor uw zoekopdracht' : 'Geen organisaties gevonden'}
        </p>
      ) : (
        <div className="space-y-4">
          {filteredOrganizations.map((org) => (
            <OrganizationCard
              key={org.id}
              organization={org}
              canCreate={canCreate}
              onUpdateOrganization={updateOrganization}
              onDeleteOrganization={(orgId, name) => deleteOrganization(orgId, name)}
              onCreateWorkspace={createWorkspace}
              onUpdateWorkspace={updateWorkspace}
              onDeleteWorkspace={(workspaceId, name) => deleteWorkspace(workspaceId, name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
