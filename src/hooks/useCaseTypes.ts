
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

interface CaseType {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}

export const useCaseTypes = () => {
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchCaseTypes = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      let query = supabase
        .from('case_types')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .eq('is_active', true)
        .order('name');

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setCaseTypes(data || []);
    } catch (error) {
      console.error('Error fetching case types:', error);
      toast({
        title: "Fout",
        description: "Kon zaaktypen niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseTypes();
  }, [selectedOrganization, selectedWorkspace]);

  return {
    caseTypes,
    loading,
    refreshCaseTypes: fetchCaseTypes
  };
};
