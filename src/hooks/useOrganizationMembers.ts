
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

interface OrganizationMember {
  user_id: string;
  email: string;
  account_name?: string;
  role: string;
}

export const useOrganizationMembers = () => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!selectedOrganization) {
      console.log('📋 No organization selected, clearing members');
      setMembers([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('📋 Fetching organization members for:', selectedOrganization.id);

      // Fetch organization members
      const { data: orgMembers, error: orgError } = await supabase
        .from('organization_members')
        .select('user_id, email, account_name, role')
        .eq('organization_id', selectedOrganization.id);

      if (orgError) throw orgError;

      // If workspace is selected, also get workspace members
      let workspaceMembers: OrganizationMember[] = [];
      if (selectedWorkspace) {
        const { data: wsMembers, error: wsError } = await supabase
          .from('workspace_members')
          .select('user_id, email, account_name, role')
          .eq('workspace_id', selectedWorkspace.id);

        if (wsError) throw wsError;
        workspaceMembers = wsMembers || [];
      }

      // Combine and deduplicate members
      const allMembers = [...(orgMembers || []), ...workspaceMembers];
      const uniqueMembers = allMembers.filter((member, index, self) => 
        index === self.findIndex(m => m.user_id === member.user_id)
      );

      console.log('📋 Members fetched successfully:', uniqueMembers.length);
      setMembers(uniqueMembers);
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('📋 Error fetching members:', error);
      setError(errorMessage);
      
      toast({
        title: "Database Fout",
        description: `Kon leden niet ophalen: ${errorMessage}`,
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
    error,
    refreshMembers: fetchMembers
  };
};
