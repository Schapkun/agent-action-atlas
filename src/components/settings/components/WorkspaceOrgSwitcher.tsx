
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, Building, Users, AlertTriangle } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

interface WorkspaceOrgSwitcherProps {
  hasUnsavedChanges: boolean;
  onSaveChanges: () => void;
  onDiscardChanges: () => void;
}

export const WorkspaceOrgSwitcher = ({ 
  hasUnsavedChanges, 
  onSaveChanges, 
  onDiscardChanges 
}: WorkspaceOrgSwitcherProps) => {
  const { 
    selectedOrganization, 
    selectedWorkspace, 
    organizations, 
    workspaces,
    setSelectedOrganization,
    setSelectedWorkspace 
  } = useOrganization();
  
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingOrgId, setPendingOrgId] = useState<string | null>(null);
  const [pendingWorkspaceId, setPendingWorkspaceId] = useState<string | null>(null);

  const handleOrganizationChange = (orgId: string) => {
    if (hasUnsavedChanges) {
      setPendingOrgId(orgId);
      setShowConfirmDialog(true);
    } else {
      setSelectedOrganization(orgId);
      // Reset workspace when changing org
      setSelectedWorkspace(null);
      setShowSwitcher(false);
    }
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    if (hasUnsavedChanges) {
      setPendingWorkspaceId(workspaceId);
      setShowConfirmDialog(true);
    } else {
      setSelectedWorkspace(workspaceId);
      setShowSwitcher(false);
    }
  };

  const handleSaveAndSwitch = () => {
    onSaveChanges();
    
    if (pendingOrgId) {
      setSelectedOrganization(pendingOrgId);
      setSelectedWorkspace(null);
      setPendingOrgId(null);
    }
    
    if (pendingWorkspaceId) {
      setSelectedWorkspace(pendingWorkspaceId);
      setPendingWorkspaceId(null);
    }
    
    setShowConfirmDialog(false);
    setShowSwitcher(false);
  };

  const handleDiscardAndSwitch = () => {
    onDiscardChanges();
    
    if (pendingOrgId) {
      setSelectedOrganization(pendingOrgId);
      setSelectedWorkspace(null);
      setPendingOrgId(null);
    }
    
    if (pendingWorkspaceId) {
      setSelectedWorkspace(pendingWorkspaceId);
      setPendingWorkspaceId(null);
    }
    
    setShowConfirmDialog(false);
    setShowSwitcher(false);
  };

  const handleCancelSwitch = () => {
    setPendingOrgId(null);
    setPendingWorkspaceId(null);
    setShowConfirmDialog(false);
  };

  const currentOrgWorkspaces = workspaces?.filter(w => w.organization_id === selectedOrganization?.id) || [];

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setShowSwitcher(true)}
        className="flex items-center gap-2 text-sm"
      >
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span className="truncate max-w-32">
            {selectedOrganization?.name || 'Geen organisatie'}
          </span>
          {selectedWorkspace && (
            <>
              <span>/</span>
              <Users className="h-4 w-4" />
              <span className="truncate max-w-32">{selectedWorkspace.name}</span>
            </>
          )}
        </div>
        <ChevronDown className="h-4 w-4" />
        {hasUnsavedChanges && (
          <Badge variant="secondary" className="ml-1">
            Niet opgeslagen
          </Badge>
        )}
      </Button>

      <Dialog open={showSwitcher} onOpenChange={setShowSwitcher}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wissel van Context</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organisatie</label>
              <Select
                value={selectedOrganization?.id || ''}
                onValueChange={handleOrganizationChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer organisatie" />
                </SelectTrigger>
                <SelectContent>
                  {organizations?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {org.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedOrganization && currentOrgWorkspaces.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Workspace</label>
                <Select
                  value={selectedWorkspace?.id || ''}
                  onValueChange={handleWorkspaceChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Alleen organisatie
                      </div>
                    </SelectItem>
                    {currentOrgWorkspaces.map((workspace) => (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {workspace.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowSwitcher(false)}>
                Annuleren
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Niet-opgeslagen wijzigingen
            </AlertDialogTitle>
            <AlertDialogDescription>
              U heeft niet-opgeslagen wijzigingen in uw template. Wat wilt u doen voordat u van context wisselt?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSwitch}>
              Blijven
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardAndSwitch}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Verwijderen
            </AlertDialogAction>
            <AlertDialogAction onClick={handleSaveAndSwitch}>
              Opslaan & Wisselen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
