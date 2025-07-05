
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

interface WorkspaceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace: (workspaceId: string) => void;
  title: string;
  description: string;
}

export const WorkspaceSelector = ({ 
  isOpen, 
  onClose, 
  onSelectWorkspace, 
  title, 
  description 
}: WorkspaceSelectorProps) => {
  const { getFilteredWorkspaces } = useOrganization();
  const workspaces = getFilteredWorkspaces();

  const handleSelectWorkspace = (workspaceId: string) => {
    onSelectWorkspace(workspaceId);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
          {workspaces.map((workspace) => (
            <Button
              key={workspace.id}
              variant="outline"
              className="w-full justify-between h-auto p-4"
              onClick={() => handleSelectWorkspace(workspace.id)}
            >
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{workspace.name}</div>
                  <div className="text-sm text-muted-foreground">{workspace.slug}</div>
                </div>
              </div>
              <Badge variant="secondary">Selecteer</Badge>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
