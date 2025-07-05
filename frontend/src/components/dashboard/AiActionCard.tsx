
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Eye,
  ExternalLink,
  FileText
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

interface AiActionCardProps {
  action: AiAction;
  onActionUpdate: () => void;
}

export const AiActionCard = ({ action, onActionUpdate }: AiActionCardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    setLoading(true);
    try {
      console.log('🟢 Actie goedkeuren:', action.id);

      // Update status naar approved
      const { error: updateError } = await supabase
        .from('ai_actions')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', action.id);

      if (updateError) throw updateError;

      // Verstuur status update naar Make.com als webhook beschikbaar is
      if (action.webhook_url) {
        const response = await fetch('/functions/v1/make-webhook-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action_id: action.id,
            status: 'approved',
            webhook_url: action.webhook_url,
            execution_data: action.action_data
          })
        });

        if (!response.ok) {
          console.warn('⚠️ Webhook status update failed, but action was approved');
        }
      }

      toast({
        title: "Actie Goedgekeurd",
        description: "De AI actie is goedgekeurd en wordt uitgevoerd door Make.com"
      });

      onActionUpdate();
    } catch (error: any) {
      console.error('❌ Fout bij goedkeuren:', error);
      toast({
        title: "Fout",
        description: `Kon actie niet goedkeuren: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      console.log('🔴 Actie afwijzen:', action.id);

      const { error: updateError } = await supabase
        .from('ai_actions')
        .update({ 
          status: 'rejected',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', action.id);

      if (updateError) throw updateError;

      // Verstuur afwijzing naar Make.com
      if (action.webhook_url) {
        await fetch('/functions/v1/make-webhook-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action_id: action.id,
            status: 'rejected',
            webhook_url: action.webhook_url
          })
        });
      }

      toast({
        title: "Actie Afgewezen",
        description: "De AI actie is afgewezen en wordt niet uitgevoerd"
      });

      onActionUpdate();
    } catch (error: any) {
      console.error('❌ Fout bij afwijzen:', error);
      toast({
        title: "Fout",
        description: `Kon actie niet afwijzen: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-600"><Clock className="h-3 w-3 mr-1" />Wacht op Goedkeuring</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-blue-600"><ExternalLink className="h-3 w-3 mr-1" />Goedgekeurd - Uitvoering</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Voltooid</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />Afgewezen</Badge>;
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
      'automated_decision': 'bg-gray-100 text-gray-800',
      'legal_document': 'bg-indigo-100 text-indigo-800',
      'client_communication': 'bg-teal-100 text-teal-800'
    };
    
    return <Badge className={colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{category}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {action.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getStatusBadge(action.status)}
              {getCategoryBadge(action.category)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {action.description && (
          <p className="text-sm text-muted-foreground mb-3">
            {action.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          {action.client_name && (
            <div>
              <span className="font-medium text-gray-600">Klant:</span>
              <p>{action.client_name}</p>
            </div>
          )}
          {action.dossier_name && (
            <div>
              <span className="font-medium text-gray-600">Dossier:</span>
              <p>{action.dossier_name}</p>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mb-4">
          <p>Aangemaakt: {formatDate(action.created_at)}</p>
          {action.approved_at && (
            <p>Goedgekeurd: {formatDate(action.approved_at)}</p>
          )}
          {action.executed_at && (
            <p>Uitgevoerd: {formatDate(action.executed_at)}</p>
          )}
        </div>

        {/* Action Data Preview */}
        {action.action_data && (
          <div className="bg-gray-50 p-3 rounded-md mb-4">
            <h5 className="text-sm font-medium mb-2">Actie Details:</h5>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              {JSON.stringify(action.action_data, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {action.status === 'pending' && (
            <>
              <Button
                onClick={handleApprove}
                disabled={loading}
                size="sm"
                className="flex items-center gap-1"
              >
                <CheckCircle className="h-4 w-4" />
                Goedkeuren
              </Button>
              <Button
                onClick={handleReject}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" />
                Afwijzen
              </Button>
            </>
          )}
          
          <Button size="sm" variant="outline" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Details
          </Button>

          {action.make_scenario_id && (
            <Badge variant="outline" className="text-xs">
              Make.com: {action.make_scenario_id}
            </Badge>
          )}
        </div>

        {/* Execution Result */}
        {action.execution_result && (
          <div className="mt-4 p-3 bg-green-50 rounded-md">
            <h5 className="text-sm font-medium text-green-800 mb-1">Uitvoering Resultaat:</h5>
            <p className="text-sm text-green-700">
              {typeof action.execution_result === 'string' 
                ? action.execution_result 
                : JSON.stringify(action.execution_result)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
