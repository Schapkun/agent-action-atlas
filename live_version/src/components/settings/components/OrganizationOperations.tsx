
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

export const useOrganizationOperations = () => {
  const handleEditOrganization = async (item: Organization, newName: string, toast: any) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: newName,
          slug: newName.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Organisatie naam bijgewerkt",
      });
    } catch (error) {
      console.error('Error updating organization name:', error);
      toast({
        title: "Error",
        description: "Kon organisatie naam niet bijwerken",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrganization = async (item: Organization, toast: any, refreshData: any, setOpen: any, onSaved: any) => {
    if (!confirm(`Weet je zeker dat je organisatie "${item.name}" wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Organisatie "${item.name}" verwijderd`,
      });

      await refreshData();
      setOpen(false);
      onSaved();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: "Error",
        description: "Kon organisatie niet verwijderen",
        variant: "destructive",
      });
    }
  };

  const performBackgroundUpdates = async (
    item: Organization,
    name: string,
    users: User[],
    workspaces: Workspace[],
    refreshData: any
  ) => {
    if (!item || !name.trim()) return;

    try {
      // Update organization name first
      const { error: updateError } = await supabase
        .from('organizations')
        .update({
          name: name.trim(),
          slug: name.toLowerCase().replace(/\s+/g, '-')
        })
        .eq('id', item.id);

      if (updateError) throw updateError;

      // Handle organization membership changes
      const currentOrgUsers = users.filter(u => u.hasOrgAccess);
      const removedOrgUsers = users.filter(u => !u.hasOrgAccess);

      // Remove users from organization (and all workspaces automatically via triggers)
      for (const user of removedOrgUsers) {
        await supabase
          .from('organization_members')
          .delete()
          .eq('organization_id', item.id)
          .eq('user_id', user.id);
      }

      // Add users to organization
      for (const user of currentOrgUsers) {
        const { error: orgMemberError } = await supabase
          .from('organization_members')
          .upsert({
            organization_id: item.id,
            user_id: user.id,
            role: 'member'
          }, {
            onConflict: 'organization_id,user_id'
          });

        if (orgMemberError) {
          console.error('Error managing organization member:', orgMemberError);
        }
      }

      // Handle workspace membership changes
      for (const workspace of workspaces) {
        const workspaceUsers = users.filter(u => u.workspaceAccess?.[workspace.id]);
        const removedWorkspaceUsers = users.filter(u => !u.workspaceAccess?.[workspace.id]);

        // Remove users from workspace
        for (const user of removedWorkspaceUsers) {
          await supabase
            .from('workspace_members')
            .delete()
            .eq('workspace_id', workspace.id)
            .eq('user_id', user.id);
        }

        // Add users to workspace
        for (const user of workspaceUsers) {
          if (user.hasOrgAccess) {
            const { error: workspaceMemberError } = await supabase
              .from('workspace_members')
              .upsert({
                workspace_id: workspace.id,
                user_id: user.id,
                role: 'member'
              }, {
                onConflict: 'workspace_id,user_id'
              });

            if (workspaceMemberError) {
              console.error('Error managing workspace member:', workspaceMemberError);
            }
          }
        }
      }

      await refreshData();
    } catch (error) {
      console.error('Error in background updates:', error);
    }
  };

  return {
    handleEditOrganization,
    handleDeleteOrganization,
    performBackgroundUpdates
  };
};
