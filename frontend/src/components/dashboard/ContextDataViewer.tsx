
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useContextData } from '@/hooks/useContextData';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  RefreshCw, 
  Copy,
  Users,
  FileText,
  DollarSign,
  CheckSquare,
  Mail,
  Phone,
  Activity
} from 'lucide-react';

export const ContextDataViewer = () => {
  const { contextData, loading, fetchContextData, getContextSummary, getWebhookUrl } = useContextData();
  const { toast } = useToast();

  const handleRefresh = async () => {
    await fetchContextData();
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(getWebhookUrl());
    toast({
      title: "URL Gekopieerd",
      description: "De context API URL is gekopieerd naar je klembord"
    });
  };

  const summary = getContextSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Context Data voor AI Agent</h2>
          <p className="text-muted-foreground">
            Systeem context data voor Make.com AI integratie
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={copyWebhookUrl} variant="outline">
            <Copy className="h-4 w-4 mr-2" />
            API URL
          </Button>
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </Button>
        </div>
      </div>

      {/* API Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Context API Endpoint</h3>
              <p className="text-sm text-blue-700 mb-2">
                Gebruik deze URL in je Make.com scenario om alle context data op te halen:
              </p>
              <code className="block p-2 bg-white rounded border text-sm font-mono">
                {getWebhookUrl()}
              </code>
              <p className="text-xs text-blue-600 mt-2">
                POST body: {`{"organization_id": "uuid", "workspace_id": "uuid"}`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Klanten</span>
              </div>
              <p className="text-xs text-muted-foreground">{summary.clients}</p>
              <p className="text-lg font-bold">{summary.metrics.total_active_clients}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Financieel</span>
              </div>
              <p className="text-xs text-muted-foreground">
                €{summary.metrics.total_outstanding_amount.toFixed(2)} uitstaand
              </p>
              <p className="text-lg font-bold">{summary.metrics.total_outstanding_invoices}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Taken</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.metrics.high_priority_tasks} hoge prioriteit
              </p>
              <p className="text-lg font-bold">{summary.metrics.open_tasks}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Activiteit</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.metrics.unread_emails} ongelezen emails
              </p>
              <p className="text-lg font-bold">{summary.metrics.recent_activities}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Context Data */}
      {contextData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Volledige Context Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Section */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financiële Situatie
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Uitstaande facturen:</strong> {contextData.financial.invoices.outstanding.length}</p>
                  <p><strong>Concept facturen:</strong> {contextData.financial.invoices.drafts}</p>
                  <p><strong>Actieve offertes:</strong> {contextData.financial.quotes.active.length}</p>
                  <p><strong>Totaal uitstaand:</strong> €{contextData.organization.metrics.total_outstanding_amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Projects & Tasks */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Projecten & Taken
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Actieve dossiers:</strong> {contextData.projects.dossiers.length}</p>
                  <p><strong>Openstaande taken:</strong> {contextData.tasks.open_tasks.length}</p>
                  <p><strong>Hoge prioriteit:</strong> {contextData.organization.metrics.high_priority_tasks}</p>
                </div>
              </div>

              {/* Communication */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Communicatie
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Recente emails:</strong> {contextData.communication.recent_emails.length}</p>
                  <p><strong>Ongelezen emails:</strong> {contextData.organization.metrics.unread_emails}</p>
                  <p><strong>Recente calls:</strong> {contextData.communication.recent_calls.length}</p>
                </div>
              </div>

              {/* Data Scope */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data Scope
                </h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Scope:</strong> {contextData.data_scope}</p>
                  <p><strong>Laatste update:</strong> {new Date(contextData.timestamp).toLocaleString('nl-NL')}</p>
                  <p><strong>Klanten:</strong> {contextData.clients.active_clients.length}</p>
                </div>
              </div>
            </div>

            {/* Raw Data Preview */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Context Data Preview (voor Make.com)</h4>
              <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-auto">
                <pre className="text-xs whitespace-pre-wrap">
                  {JSON.stringify(contextData, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!contextData && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">
              Geen context data geladen. Klik op "Vernieuwen" om de data op te halen.
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Context Data Laden
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
