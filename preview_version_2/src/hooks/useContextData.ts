
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

interface ContextData {
  organization: {
    settings: any;
    metrics: {
      total_active_clients: number;
      total_outstanding_invoices: number;
      total_outstanding_amount: number;
      overdue_invoices: number;
      pending_quotes: number;
      active_dossiers: number;
      open_tasks: number;
      high_priority_tasks: number;
      unread_emails: number;
      recent_activities: number;
    };
  };
  clients: {
    active_clients: any[];
    summary: string;
  };
  financial: {
    invoices: {
      outstanding: any[];
      drafts: number;
    };
    quotes: {
      active: any[];
    };
    summary: string;
  };
  projects: {
    dossiers: any[];
    summary: string;
  };
  tasks: {
    open_tasks: any[];
    summary: string;
  };
  communication: {
    recent_emails: any[];
    recent_calls: any[];
    summary: string;
  };
  timestamp: string;
  data_scope: string;
}

export const useContextData = () => {
  const [loading, setLoading] = useState(false);
  const [contextData, setContextData] = useState<ContextData | null>(null);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchContextData = async () => {
    if (!selectedOrganization) {
      toast({
        title: "Fout",
        description: "Geen organisatie geselecteerd",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      console.log('🔄 Fetching context data for:', selectedOrganization.id);

      const { data, error } = await supabase.functions.invoke('get-context-data', {
        body: {
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id || null
        }
      });

      if (error) throw error;

      if (data.success) {
        setContextData(data.context);
        console.log('✅ Context data loaded successfully');
        return data.context;
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('❌ Context data fetch error:', error);
      toast({
        title: "Fout",
        description: `Kon context data niet ophalen: ${error.message}`,
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getContextSummary = () => {
    if (!contextData) return null;

    return {
      clients: contextData.clients.summary,
      financial: contextData.financial.summary,
      projects: contextData.projects.summary,
      tasks: contextData.tasks.summary,
      communication: contextData.communication.summary,
      metrics: contextData.organization.metrics
    };
  };

  const getWebhookUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/functions/v1/get-context-data`;
  };

  return {
    contextData,
    loading,
    fetchContextData,
    getContextSummary,
    getWebhookUrl
  };
};
