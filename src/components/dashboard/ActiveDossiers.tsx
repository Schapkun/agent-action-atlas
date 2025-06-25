import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User, 
  Building2,
  Mail,
  FileText,
  Phone,
  Calendar,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useClientsWithDossiers } from '@/hooks/useClientsWithDossiers';
import { useDossierTimeline } from '@/hooks/useDossierTimeline';
import { createExampleClients } from '@/data/exampleClients';
import { createExampleDossiers } from '@/data/exampleDossiers';
import { useToast } from '@/hooks/use-toast';

export const ActiveDossiers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { clients, loading: clientsLoading, refreshClients } = useClientsWithDossiers();
  const { timelineItems, loading: timelineLoading } = useDossierTimeline(selectedClient);
  const { toast } = useToast();

  const createExamples = async () => {
    if (!selectedOrganization) return;
    
    try {
      // First create clients
      await createExampleClients(selectedOrganization.id, selectedWorkspace?.id);
      
      // Then create dossiers for those clients
      await createExampleDossiers(selectedOrganization.id, selectedWorkspace?.id);
      
      toast({
        title: "Succes",
        description: "Voorbeeldklanten en dossiers aangemaakt"
      });
      refreshClients();
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon voorbeelddata niet aanmaken",
        variant: "destructive"
      });
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

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTimeline = timelineItems.filter(item => {
    if (timelineFilter !== 'all' && item.type !== timelineFilter) return false;
    
    if (periodFilter !== 'all') {
      const itemDate = new Date(item.date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (periodFilter) {
        case 'today':
          return diffDays === 0;
        case 'week':
          return diffDays <= 7;
        case 'month':
          return diffDays <= 30;
        default:
          return true;
      }
    }
    
    return true;
  });

  const selectedClientData = clients.find(c => c.id === selectedClient);

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'phone_call': return <Phone className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'email': return 'border-blue-200 bg-blue-50';
      case 'document': return 'border-green-200 bg-green-50';
      case 'phone_call': return 'border-orange-200 bg-orange-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Clients Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Klanten</CardTitle>
          <div className="text-sm text-muted-foreground">
            {getContextInfo()}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek klanten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {!selectedOrganization && !selectedWorkspace ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Selecteer een organisatie of werkruimte</p>
            </div>
          ) : clientsLoading ? (
            <div className="text-center py-8">Klanten laden...</div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm mb-4">Geen klanten gevonden</p>
              <Button onClick={createExamples} variant="outline" size="sm">
                Voorbeelddata aanmaken
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredClients.map((client) => (
                <div 
                  key={client.id} 
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedClient === client.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                  onClick={() => setSelectedClient(client.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {client.type === 'zakelijk' ? (
                          <Building2 className="h-4 w-4 text-blue-600" />
                        ) : (
                          <User className="h-4 w-4 text-green-600" />
                        )}
                        <h3 className="font-medium text-sm truncate">{client.name}</h3>
                      </div>
                      
                      {client.contact_person && (
                        <p className="text-xs text-muted-foreground mb-1">
                          {client.contact_person}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {client.city}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {client.dossier_count} dossier{client.dossier_count !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dossier Timeline */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {selectedClientData ? `Dossier Tijdlijn - ${selectedClientData.name}` : 'Selecteer een klant'}
              </CardTitle>
              {selectedClientData && (
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedClientData.email} • {selectedClientData.dossier_count} actieve dossier{selectedClientData.dossier_count !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            {selectedClient && (
              <div className="flex items-center gap-2">
                <select 
                  value={timelineFilter} 
                  onChange={(e) => setTimelineFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">Alle types</option>
                  <option value="email">E-mails</option>
                  <option value="document">Documenten</option>
                  <option value="phone_call">Telefoongesprekken</option>
                </select>
                
                <select 
                  value={periodFilter} 
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">Alle periodes</option>
                  <option value="today">Vandaag</option>
                  <option value="week">Deze week</option>
                  <option value="month">Deze maand</option>
                </select>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {!selectedClient ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecteer een klant om de dossier tijdlijn te bekijken</p>
            </div>
          ) : timelineLoading ? (
            <div className="text-center py-8">Tijdlijn laden...</div>
          ) : filteredTimeline.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Geen communicatie of documenten gevonden</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {filteredTimeline.map((item) => (
                <div key={item.id} className={`p-4 rounded-lg border ${getTimelineColor(item.type)}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getTimelineIcon(item.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {item.type === 'email' ? 'E-mail' : 
                             item.type === 'document' ? 'Document' : 'Gesprek'}
                          </Badge>
                          {item.status && (
                            <div className="flex items-center gap-1">
                              {item.status === 'completed' ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : item.status === 'pending' ? (
                                <Clock className="h-3 w-3 text-yellow-600" />
                              ) : (
                                <AlertCircle className="h-3 w-3 text-red-600" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {item.description}
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleString('nl-NL')}
                      </p>
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
