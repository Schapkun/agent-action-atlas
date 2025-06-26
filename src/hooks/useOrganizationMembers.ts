
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

interface OrganizationMember {
  id: string;
  user_id: string;
  email: string;
  account_name: string;
  role: string;
}

export const useOrganizationMembers = () => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      // First get organization members
      const { data: orgMembers, error: orgError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', selectedOrganization.id);

      if (orgError) throw orgError;

      let allMembers = orgMembers || [];

      // If workspace is selected, also get workspace-specific members
      if (selectedWorkspace) {
        const { data: workspaceMembers, error: workspaceError } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', selectedWorkspace.id);

        if (workspaceError) throw workspaceError;

        // Combine and deduplicate members
        const workspaceMemberIds = new Set(workspaceMembers?.map(m => m.user_id) || []);
        allMembers = allMembers.filter(m => workspaceMemberIds.has(m.user_id));
      }

      setMembers(allMembers);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "Fout",
        description: "Kon medewerkers niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedOrganization, selectedWorkspace]);

  return {
    members,
    loading,
    refreshMembers: fetchMembers
  };
};
