
import { supabase } from '@/integrations/supabase/client';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  hasOrgAccess?: boolean;
  workspaceAccess?: { [workspaceId: string]: boolean };
}

export const useWorkspaceOperations = () => {
  const handleAddWorkspace = async (
    item: Organization,
    workspaceName: string,
    setWorkspaces: any,
    setUsers: any,
    toast: any
  ) => {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name: workspaceName,
          slug: workspaceName.toLowerCase().replace(/\s+/g, '-'),
          organization_id: item.id
        })
        .select()
        .single();

      if (error) throw error;

      setWorkspaces((prev: Workspace[]) => [...prev, data]);
      
      setUsers((prev: User[]) => prev.map(user => ({
        ...user,
        workspaceAccess: {
          ...user.workspaceAccess,
          [data.id]: false
        }
      })));

      toast({
        title: "Succes",
        description: "Werkruimte succesvol toegevoegd",
      });
    } catch (error) {
      console.error('Error adding workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet toevoegen",
        variant: "destructive",
      });
    }
  };

  const handleEditWorkspace = async (workspaceId: string, newName: string, setWorkspaces: any, toast: any) => {
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: newName,
          slug: newName.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', workspaceId);

      if (error) throw error;

      setWorkspaces((prev: Workspace[]) => prev.map(ws => 
        ws.id === workspaceId 
          ? { ...ws, name: newName }
          : ws
      ));

      toast({
        title: "Succes",
        description: "Werkruimte naam bijgewerkt",
      });
    } catch (error) {
      console.error('Error updating workspace name:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte naam niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkspace = async (
    workspaceId: string, 
    workspaceName: string, 
    setWorkspaces: any, 
    setUsers: any, 
    toast: any
  ) => {
    if (!confirm(`Weet je zeker dat je werkruimte "${workspaceName}" wilt verwijderen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);

      if (error) throw error;

      setWorkspaces((prev: Workspace[]) => prev.filter(ws => ws.id !== workspaceId));
      
      setUsers((prev: User[]) => prev.map(user => {
        const newWorkspaceAccess = { ...user.workspaceAccess };
        delete newWorkspaceAccess[workspaceId];
        return {
          ...user,
          workspaceAccess: newWorkspaceAccess
        };
      }));

      toast({
        title: "Succes",
        description: `Werkruimte "${workspaceName}" verwijderd`,
      });
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "Kon werkruimte niet verwijderen",
        variant: "destructive",
      });
    }
  };

  return {
    handleAddWorkspace,
    handleEditWorkspace,
    handleDeleteWorkspace
  };
};
