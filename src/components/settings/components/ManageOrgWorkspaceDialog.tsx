
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationTab } from './OrganizationTab';
import { WorkspacesTab } from './WorkspacesTab';
import { useManageOrgWorkspaceDialog } from '../hooks/useManageOrgWorkspaceDialog';
import { useOrganizationOperations } from './OrganizationOperations';
import { useWorkspaceOperations } from './WorkspaceOperations';

interface Organization {
  id: string;
  name: string;
  slug: string;
  workspaces?: Workspace[];
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
}

interface ManageOrgWorkspaceDialogProps {
  type: 'organization';
  item?: Organization | null;
  trigger: React.ReactNode;
  onSaved: () => void;
}

export const ManageOrgWorkspaceDialog = ({ type, item, trigger, onSaved }: ManageOrgWorkspaceDialogProps) => {
  const [open, setOpen] = useState(false);
  
  const {
    name,
    setName,
    users,
    setUsers,
    workspaces,
    setWorkspaces,
    saving,
    setSaving,
    loading,
    fetchData,
    handleOrgUserToggle,
    handleWorkspaceUserToggle,
    toast,
    refreshData
  } = useManageOrgWorkspaceDialog(item);

  const { handleEditOrganization, handleDeleteOrganization, performBackgroundUpdates } = useOrganizationOperations();
  const { handleAddWorkspace, handleEditWorkspace, handleDeleteWorkspace } = useWorkspaceOperations();

  useEffect(() => {
    if (open && item) {
      fetchData();
    }
  }, [open, item]);

  const handleSave = async () => {
    if (!item || !name.trim()) {
      toast({
        title: "Fout",
        description: "Naam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    
    // Close dialog immediately and show success toast
    setOpen(false);
    toast({
      title: "Succes",
      description: "Organisatie wordt bijgewerkt...",
    });
    
    // Perform updates in background
    await performBackgroundUpdates(item, name, users, workspaces, refreshData);
    
    setSaving(false);
    onSaved();
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg">
            Organisatie Beheren
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="organisatie" className="w-full h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
              <TabsTrigger value="organisatie">Organisatie</TabsTrigger>
              <TabsTrigger value="werkruimtes">Werkruimtes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="organisatie" className="flex-1 overflow-hidden">
              <OrganizationTab
                organization={item}
                users={users}
                loading={loading}
                onEditOrganization={(newName) => handleEditOrganization(item, newName, toast)}
                onDeleteOrganization={() => handleDeleteOrganization(item, toast, refreshData, setOpen, onSaved)}
                onUserToggle={handleOrgUserToggle}
              />
            </TabsContent>
            
            <TabsContent value="werkruimtes" className="flex-1 overflow-hidden">
              <WorkspacesTab
                workspaces={workspaces}
                users={users}
                loading={loading}
                onAddWorkspace={(workspaceName) => handleAddWorkspace(item, workspaceName, setWorkspaces, setUsers, toast)}
                onEditWorkspace={(workspaceId, newName) => handleEditWorkspace(workspaceId, newName, setWorkspaces, toast)}
                onDeleteWorkspace={(workspaceId, workspaceName) => handleDeleteWorkspace(workspaceId, workspaceName, setWorkspaces, setUsers, toast)}
                onUserToggle={handleWorkspaceUserToggle}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex-shrink-0 flex justify-end space-x-2 pt-4 border-t bg-background">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
