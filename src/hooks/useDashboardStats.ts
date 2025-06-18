
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

export interface DashboardStats {
  totalActions: number;
  pendingActions: number;
  completedToday: number;
  totalDocuments: number;
  activeClients: number;
  activeDossiers: number;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalActions: 0,
    pendingActions: 0,
    completedToday: 0,
    totalDocuments: 0,
    activeClients: 0,
    activeDossiers: 0
  });
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const fetchStats = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📊 Fetching dashboard stats for organization:', selectedOrganization.id);

      // Build base queries with organization filter
      let baseFilter = { organization_id: selectedOrganization.id };
      if (selectedWorkspace) {
        baseFilter = { ...baseFilter, workspace_id: selectedWorkspace.id };
      }

      // Fetch all stats in parallel
      const [
        { count: totalActions },
        { count: pendingActions },
        { count: completedToday },
        { count: totalDocuments },
        { count: activeClients },
        { count: activeDossiers }
      ] = await Promise.all([
        // Total AI Actions
        supabase
          .from('ai_actions')
          .select('*', { count: 'exact', head: true })
          .match(baseFilter),
        
        // Pending Actions
        supabase
          .from('ai_actions')
          .select('*', { count: 'exact', head: true })
          .match({ ...baseFilter, status: 'pending' }),
        
        // Completed Today
        supabase
          .from('ai_actions')
          .select('*', { count: 'exact', head: true })
          .match({ ...baseFilter, status: 'completed' })
          .gte('updated_at', new Date().toISOString().split('T')[0]),
        
        // Total Documents (templates)
        supabase
          .from('document_templates')
          .select('*', { count: 'exact', head: true })
          .match(baseFilter),
        
        // Active Clients
        supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .match({ ...baseFilter, is_active: true }),
        
        // Active Dossiers
        supabase
          .from('dossiers')
          .select('*', { count: 'exact', head: true })
          .match({ ...baseFilter, status: 'active' })
      ]);

      const newStats = {
        totalActions: totalActions || 0,
        pendingActions: pendingActions || 0,
        completedToday: completedToday || 0,
        totalDocuments: totalDocuments || 0,
        activeClients: activeClients || 0,
        activeDossiers: activeDossiers || 0
      };

      setStats(newStats);
      console.log('📊 Dashboard stats updated:', newStats);
    } catch (error) {
      console.error('📊 Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedOrganization, selectedWorkspace]);

  return { stats, loading, refreshStats: fetchStats };
};
