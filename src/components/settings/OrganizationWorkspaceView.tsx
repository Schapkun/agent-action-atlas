
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { OrganizationSettings } from './OrganizationSettings';
import { WorkspaceSettings } from './WorkspaceSettings';

interface OrganizationWorkspaceViewProps {
  userRole: string;
}

export const OrganizationWorkspaceView = ({ userRole }: OrganizationWorkspaceViewProps) => {
  const [showCreateOrganization, setShowCreateOrganization] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreateOrganization(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Organisatie
        </Button>
      </div>

      <OrganizationSettings userRole={userRole} />
      <WorkspaceSettings userRole={userRole} />
    </div>
  );
};
