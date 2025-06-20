
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export const useDocumentTemplatesAccess = () => {
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Enhanced access check with better error messages
  const checkUserAccess = async () => {
    try {
      console.log('[useDocumentTemplatesAccess] Starting access check...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('[useDocumentTemplatesAccess] User check result:', { user: !!user, error: userError });
      
      if (userError || !user) {
        throw new Error('Je bent niet ingelogd');
      }

      if (!selectedOrganization) {
        throw new Error('Geen organisatie geselecteerd');
      }

      console.log('[useDocumentTemplatesAccess] Checking organization membership for:', {
        userId: user.id,
        orgId: selectedOrganization.id
      });

      // Check organization membership
      const { data: membership, error: membershipError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', selectedOrganization.id)
        .eq('user_id', user.id)
        .single();

      console.log('[useDocumentTemplatesAccess] Membership check result:', { membership, error: membershipError });

      if (membershipError || !membership) {
        throw new Error('Geen toegang tot deze organisatie');
      }

      console.log('[useDocumentTemplatesAccess] Access check successful');
      return { user, organization: selectedOrganization, workspace: selectedWorkspace };
    } catch (error) {
      console.error('[useDocumentTemplatesAccess] Access check failed:', error);
      throw error;
    }
  };

  return { checkUserAccess };
};
