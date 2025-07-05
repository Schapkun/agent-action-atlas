
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export const useDocumentTemplatesAccess = () => {
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Memoize the access check function to prevent unnecessary re-renders
  const checkUserAccess = useMemo(() => {
    return async () => {
      try {
        console.log('[useDocumentTemplatesAccess] Starting access check...');
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('[useDocumentTemplatesAccess] User check result:', { user: !!user, error: userError });
        
        if (userError || !user) {
          throw new Error('Je bent niet ingelogd');
        }

        if (!selectedOrganization?.id) {
          throw new Error('Geen organisatie geselecteerd');
        }

        console.log('[useDocumentTemplatesAccess] Checking organization membership for:', {
          userId: user.id,
          orgId: selectedOrganization.id
        });

        // Check organization membership with proper UUID validation
        const { data: membership, error: membershipError } = await supabase
          .from('organization_members')
          .select('role')
          .eq('organization_id', selectedOrganization.id)
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors when no data found

        console.log('[useDocumentTemplatesAccess] Membership check result:', { membership, error: membershipError });

        if (membershipError) {
          console.error('[useDocumentTemplatesAccess] Membership query error:', membershipError);
          throw new Error('Fout bij toegangscontrole');
        }

        if (!membership) {
          throw new Error('Geen toegang tot deze organisatie');
        }

        console.log('[useDocumentTemplatesAccess] Access check successful');
        return { user, organization: selectedOrganization, workspace: selectedWorkspace };
      } catch (error) {
        console.error('[useDocumentTemplatesAccess] Access check failed:', error);
        throw error;
      }
    };
  }, [selectedOrganization?.id, selectedWorkspace?.id]); // Only depend on IDs to prevent loops

  return { checkUserAccess };
};
