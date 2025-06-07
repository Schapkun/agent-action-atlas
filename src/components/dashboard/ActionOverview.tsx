
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, FileText, Phone, Mail, Receipt, Gavel } from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import type { AIAction, ActionCategory, ActionStatus } from '@/types/dashboard';

interface ActionOverviewProps {
  limit?: number;
  showFilters?: boolean;
}

export const ActionOverview = ({ limit, showFilters = true }: ActionOverviewProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ActionCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ActionStatus | 'all'>('all');
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Empty array - no mock data, will be replaced with real data later
  const actions: AIAction[] = [];

  const getActionIcon = (category: ActionCategory) => {
    switch (category) {
      case 'invoice_created':
      case 'invoice_sent':
      case 'invoice_received':
      case 'invoice_draft':
        return Receipt;
      case 'phone_call_registered':
      case 'phone_call_transcribed':
        return Phone;
      case 'letter_sent':
      case 'email_sent':
        return Mail;
      case 'document_created':
        return FileText;
      case 'automated_decision':
        return Gavel;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: ActionStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const getStatusLabel = (status: ActionStatus) => {
    switch (status) {
      case 'completed':
        return 'Voltooid';
      case 'pending':
        return 'In behandeling';
      case 'failed':
        return 'Mislukt';
      case 'draft':
        return 'Concept';
      default:
        return status;
    }
  };

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const filteredActions = useMemo(() => {
    let filtered = actions;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(action => 
        action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.dossier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(action => action.category === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(action => action.status === statusFilter);
    }

    // Apply limit if specified
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    return filtered;
  }, [actions, searchTerm, categoryFilter, statusFilter, limit]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>AI Acties</span>
          {showFilters && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Exporteren
            </Button>
          )}
        </CardTitle>
        
        {!selectedOrganization && !selectedWorkspace && (
          <div className="text-sm text-muted-foreground">
            Selecteer een organisatie of werkruimte om acties te bekijken
          </div>
        )}

        {(selectedOrganization || selectedWorkspace) && (
          <div className="text-sm text-muted-foreground">
            Data voor: {getContextInfo()}
          </div>
        )}
        
        {showFilters && (selectedOrganization || selectedWorkspace) && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek acties, cliënten, dossiers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as ActionCategory | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle categorieën</SelectItem>
                <SelectItem value="invoice_created">Facturen</SelectItem>
                <SelectItem value="phone_call_transcribed">Telefoongesprekken</SelectItem>
                <SelectItem value="document_created">Documenten</SelectItem>
                <SelectItem value="email_sent">E-mails</SelectItem>
                <SelectItem value="automated_decision">Automatische besluiten</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ActionStatus | 'all')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="completed">Voltooid</SelectItem>
                <SelectItem value="pending">In behandeling</SelectItem>
                <SelectItem value="draft">Concept</SelectItem>
                <SelectItem value="failed">Mislukt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {!selectedOrganization && !selectedWorkspace ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecteer een organisatie of werkruimte om AI acties te bekijken</p>
            </div>
          ) : filteredActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen acties gevonden voor de geselecteerde context</p>
            </div>
          ) : (
            filteredActions.map((action) => {
              const Icon = getActionIcon(action.category);
              return (
                <div key={action.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {action.title}
                      </h4>
                      <Badge className={getStatusColor(action.status)}>
                        {getStatusLabel(action.status)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {action.description}
                    </p>
                    
                    <div className="flex items-center text-xs text-muted-foreground space-x-4">
                      <span className="font-medium">{action.client}</span>
                      <span>•</span>
                      <span>{action.dossier}</span>
                      <span>•</span>
                      <span>{action.timestamp.toLocaleDateString('nl-NL')} {action.timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
