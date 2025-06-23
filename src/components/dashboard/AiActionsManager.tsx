
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { AiActionCard } from './AiActionCard';
import { 
  Search, 
  Activity, 
  Plus, 
  Webhook,
  Settings
} from 'lucide-react';

interface AiAction {
  id: string;
  title: string;
  description?: string;
  category: string;
  client_name?: string;
  dossier_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
  make_scenario_id?: string;
  webhook_url?: string;
  action_data?: any;
  approved_at?: string;
  approved_by?: string;
  executed_at?: string;
  execution_result?: any;
}

export const AiActionsManager = () => {
  const [actions, setActions] = useState<AiAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchActions = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('🤖 Fetching AI actions for organization:', selectedOrganization.id);

      let query = supabase
        .from('ai_actions')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('🤖 AI actions fetched:', data?.length || 0);
      setActions(data || []);
    } catch (error) {
      console.error('Error fetching AI actions:', error);
      toast({
        title: "Fout",
        description: "Kon acties niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [selectedOrganization, selectedWorkspace, statusFilter]);

  const filteredActions = actions.filter(action =>
    action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    action.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWebhookEndpoint = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/functions/v1/make-webhook-receive`;
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(getWebhookEndpoint());
    toast({
      title: "Webhook URL Gekopieerd",
      description: "De webhook URL is gekopieerd naar je klembord"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Acties</h1>
          <p className="text-muted-foreground">Beheer en goedkeur AI uitgevoerde acties van Make.com</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={copyWebhookUrl} variant="outline">
            <Webhook className="h-4 w-4 mr-2" />
            Webhook URL
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Handmatige Actie
          </Button>
        </div>
      </div>

      {/* Webhook Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Webhook className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Make.com Webhook Endpoint</h3>
              <p className="text-sm text-blue-700 mb-2">
                Gebruik deze URL in je Make.com scenario om AI acties naar dit systeem te versturen:
              </p>
              <code className="block p-2 bg-white rounded border text-sm font-mono">
                {getWebhookEndpoint()}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Acties Overzicht
            </CardTitle>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="all">Alle statussen</option>
                <option value="pending">Wacht op Goedkeuring</option>
                <option value="approved">Goedgekeurd</option>
                <option value="completed">Voltooid</option>
                <option value="rejected">Afgewezen</option>
                <option value="failed">Gefaald</option>
              </select>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek acties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-center py-8">Acties laden...</div>
          ) : filteredActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen acties gevonden</p>
              <p className="text-sm mt-2">
                AI acties van Make.com verschijnen hier automatisch
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActions.map((action) => (
                <AiActionCard 
                  key={action.id} 
                  action={action} 
                  onActionUpdate={fetchActions}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
