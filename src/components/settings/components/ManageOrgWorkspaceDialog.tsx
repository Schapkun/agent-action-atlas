
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useManageOrgWorkspaceDialog } from '../hooks/useManageOrgWorkspaceDialog';
import { useOrganizationOperations } from './OrganizationOperations';
import { useWorkspaceOperations } from './WorkspaceOperations';
import { DialogHeader } from './DialogHeader';
import { DialogFooter } from './DialogFooter';
import { TabsContainer } from './TabsContainer';

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

  // Fetch data immediately when dialog opens, don't wait
  useEffect(() => {
    if (open && item) {
      // Start fetching data in background immediately
      fetchData();
    }
  }, [open, item, fetchData]);

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
        <DialogHeader title="Organisatie Beheren" />

        <TabsContainer
          organization={item}
          users={users}
          workspaces={workspaces}
          loading={loading}
          onEditOrganization={(newName) => handleEditOrganization(item, newName, toast)}
          onDeleteOrganization={() => handleDeleteOrganization(item, toast, refreshData, setOpen, onSaved)}
          onOrgUserToggle={handleOrgUserToggle}
          onAddWorkspace={(workspaceName) => handleAddWorkspace(item, workspaceName, setWorkspaces, setUsers, toast)}
          onEditWorkspace={(workspaceId, newName) => handleEditWorkspace(workspaceId, newName, setWorkspaces, toast)}
          onDeleteWorkspace={(workspaceId, workspaceName) => handleDeleteWorkspace(workspaceId, workspaceName, setWorkspaces, setUsers, toast)}
          onWorkspaceUserToggle={handleWorkspaceUserToggle}
        />

        <DialogFooter
          onCancel={() => setOpen(false)}
          onSave={handleSave}
          saving={saving}
        />
      </DialogContent>
    </Dialog>
  );
};
