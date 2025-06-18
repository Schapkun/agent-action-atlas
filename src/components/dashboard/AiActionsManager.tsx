
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Activity, 
  Plus, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle 
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

  const updateActionStatus = async (actionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('ai_actions')
        .update({ status: newStatus })
        .eq('id', actionId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Actie status bijgewerkt"
      });

      fetchActions();
    } catch (error) {
      console.error('Error updating action status:', error);
      toast({
        title: "Fout",
        description: "Kon actie status niet bijwerken",
        variant: "destructive"
      });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Voltooid</Badge>;
      case 'failed':
        return <Badge variant="outline" className="text-red-600"><AlertCircle className="h-3 w-3 mr-1" />Gefaald</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      'invoice_created': 'bg-blue-100 text-blue-800',
      'document_created': 'bg-purple-100 text-purple-800',
      'email_sent': 'bg-green-100 text-green-800',
      'phone_call_registered': 'bg-yellow-100 text-yellow-800',
      'automated_decision': 'bg-gray-100 text-gray-800'
    };
    
    return <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">AI Acties</h1>
          <p className="text-muted-foreground">Overzicht van alle AI uitgevoerde acties</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Actie
        </Button>
      </div>

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
                <option value="pending">Pending</option>
                <option value="completed">Voltooid</option>
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
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActions.map((action) => (
                <div key={action.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{action.title}</h3>
                        {getStatusBadge(action.status)}
                        {getCategoryBadge(action.category)}
                      </div>
                      
                      {action.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {action.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {action.client_name && (
                          <span>Klant: {action.client_name}</span>
                        )}
                        {action.dossier_name && (
                          <span>Dossier: {action.dossier_name}</span>
                        )}
                        <span>
                          Aangemaakt: {new Date(action.created_at).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {action.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateActionStatus(action.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Voltooien
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
