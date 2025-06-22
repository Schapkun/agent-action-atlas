
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { DashboardStats } from '@/types/dashboard';

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalActions: 0,
    pendingActions: 0,
    completedToday: 0,
    totalDocuments: 0,
    activeClients: 0,
    activeDossiers: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    estimatedHoursSaved: 0
  });
  const [loading, setLoading] = useState(true);
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedOrganization) {
        setLoading(false);
        return;
      }

      try {
        console.log('📊 Fetching dashboard statistics...');
        
        // Base query conditions
        const orgCondition = { organization_id: selectedOrganization.id };
        const workspaceCondition = selectedWorkspace 
          ? { ...orgCondition, workspace_id: selectedWorkspace.id }
          : orgCondition;

        // 1. Pending Actions (openstaande acties)
        const { count: pendingActions } = await supabase
          .from('ai_actions')
          .select('*', { count: 'exact', head: true })
          .match({ ...workspaceCondition, status: 'pending' });

        // 2. Total AI Actions + estimated hours saved
        const { count: totalActions } = await supabase
          .from('ai_actions')
          .select('*', { count: 'exact', head: true })
          .match(workspaceCondition);

        // Calculate estimated hours saved (2.5 hours per AI action average)
        const estimatedHoursSaved = (totalActions || 0) * 2.5;

        // 3. Week Revenue (gefactureerde invoices van afgelopen 7 dagen)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: weekInvoices } = await supabase
          .from('invoices')
          .select('total_amount')
          .match({ ...workspaceCondition, status: 'paid' })
          .gte('created_at', weekAgo.toISOString());

        const weekRevenue = weekInvoices?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

        // 4. Month Revenue (gefactureerde invoices van huidige maand)
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);
        
        const { data: monthInvoices } = await supabase
          .from('invoices')
          .select('total_amount')
          .match({ ...workspaceCondition, status: 'paid' })
          .gte('created_at', currentMonth.toISOString());

        const monthRevenue = monthInvoices?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0;

        // 5. Active Clients
        const { count: activeClients } = await supabase
          .from('clients')
          .select('*', { count: 'exact', head: true })
          .match({ ...workspaceCondition, is_active: true });

        // 6. Active Dossiers
        const { count: activeDossiers } = await supabase
          .from('dossiers')
          .select('*', { count: 'exact', head: true })
          .match({ ...workspaceCondition, status: 'active' });

        // Additional stats for compatibility
        const { count: completedTodayCount } = await supabase
          .from('ai_actions')
          .select('*', { count: 'exact', head: true })
          .match({ ...workspaceCondition, status: 'completed' })
          .gte('updated_at', new Date().toISOString().split('T')[0]);

        const { count: totalDocuments } = await supabase
          .from('document_templates')
          .select('*', { count: 'exact', head: true })
          .match(workspaceCondition);

        setStats({
          pendingActions: pendingActions || 0,
          totalActions: totalActions || 0,
          estimatedHoursSaved: Math.round(estimatedHoursSaved * 10) / 10, // Round to 1 decimal
          weekRevenue: weekRevenue,
          monthRevenue: monthRevenue,
          activeClients: activeClients || 0,
          activeDossiers: activeDossiers || 0,
          completedToday: completedTodayCount || 0,
          totalDocuments: totalDocuments || 0
        });

        console.log('📊 Dashboard stats updated:', {
          pendingActions: pendingActions || 0,
          totalActions: totalActions || 0,
          estimatedHoursSaved: Math.round(estimatedHoursSaved * 10) / 10,
          weekRevenue,
          monthRevenue,
          activeClients: activeClients || 0,
          activeDossiers: activeDossiers || 0
        });

      } catch (error) {
        console.error('❌ Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedOrganization, selectedWorkspace]);

  return { stats, loading };
};
