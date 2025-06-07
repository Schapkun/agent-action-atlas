
import { supabase } from '@/integrations/supabase/client';

export const useAutoOwnerMembership = () => {
  const addOwnersToNewOrganization = async (organizationId: string) => {
    try {
      console.log('Adding owners to new organization:', organizationId);
      
      // Get all users with owner role
      const { data: owners, error: ownersError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('user_role', 'owner');

      if (ownersError) {
        console.error('Error fetching owners:', ownersError);
        return;
      }

      if (!owners || owners.length === 0) {
        console.log('No owners found');
        return;
      }

      console.log('Found owners:', owners);

      // Add each owner to the organization
      for (const owner of owners) {
        const { error: membershipError } = await supabase
          .from('organization_members')
          .insert({
            user_id: owner.id,
            organization_id: organizationId,
            role: 'owner'
          });

        if (membershipError) {
          console.error('Error adding owner to organization:', membershipError);
        } else {
          console.log('Successfully added owner to organization:', owner.email);
        }
      }
    } catch (error) {
      console.error('Error in addOwnersToNewOrganization:', error);
    }
  };

  const addOwnersToNewWorkspace = async (workspaceId: string, organizationId: string) => {
    try {
      console.log('Adding owners to new workspace:', workspaceId);
      
      // Get all users with owner role
      const { data: owners, error: ownersError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('user_role', 'owner');

      if (ownersError) {
        console.error('Error fetching owners:', ownersError);
        return;
      }

      if (!owners || owners.length === 0) {
        console.log('No owners found');
        return;
      }

      console.log('Found owners:', owners);

      // Add each owner to the workspace
      for (const owner of owners) {
        const { error: membershipError } = await supabase
          .from('workspace_members')
          .insert({
            user_id: owner.id,
            workspace_id: workspaceId,
            role: 'owner'
          });

        if (membershipError) {
          console.error('Error adding owner to workspace:', membershipError);
        } else {
          console.log('Successfully added owner to workspace:', owner.email);
        }
      }
    } catch (error) {
      console.error('Error in addOwnersToNewWorkspace:', error);
    }
  };

  return {
    addOwnersToNewOrganization,
    addOwnersToNewWorkspace
  };
};
