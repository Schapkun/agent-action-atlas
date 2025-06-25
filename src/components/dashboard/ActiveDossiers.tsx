
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  User, 
  Building2,
  Mail,
  FileText,
  Phone,
  Calendar,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useClientsWithDossiers } from '@/hooks/useClientsWithDossiers';
import { useDossierTimeline } from '@/hooks/useDossierTimeline';
import { createExampleClients } from '@/data/exampleClients';
import { useToast } from '@/hooks/use-toast';

export const ActiveDossiers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { clients, loading: clientsLoading, error: clientsError, refreshClients } = useClientsWithDossiers();
  const { timelineItems, loading: timelineLoading, error: timelineError } = useDossierTimeline(selectedClient);
  const { toast } = useToast();

  const createExamples = async () => {
    if (!selectedOrganization) return;
    
    try {
      await createExampleClients(selectedOrganization.id, selectedWorkspace?.id);
      toast({
        title: "Succes",
        description: "Voorbeeldklanten aangemaakt"
      });
      refreshClients();
    } catch (error) {
      toast({
        title: "Fout",
        description: "Kon voorbeeldklanten niet aanmaken",
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
      case 'email': return <Mail className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'phone_call': return <Phone className="h-5 w-5" />;
      case 'invoice': return <CreditCard className="h-5 w-5" />;
      case 'quote': return <FileCheck className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-600';
      case 'document': return 'bg-green-100 text-green-600';
      case 'phone_call': return 'bg-purple-100 text-purple-600';
      case 'invoice': return 'bg-yellow-100 text-yellow-600';
      case 'quote': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTimelineCardBorder = (type: string) => {
    switch (type) {
      case 'email': return 'border-blue-200';
      case 'document': return 'border-green-200';
      case 'phone_call': return 'border-purple-200';
      case 'invoice': return 'border-yellow-200';
      case 'quote': return 'border-indigo-200';
      default: return 'border-gray-200';
    }
  };

  const formatTimelineDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return `Vandaag ${date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return 'Gisteren';
    if (diffDays <= 7) return `${diffDays} dagen geleden`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weken geleden`;
    return date.toLocaleDateString('nl-NL');
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Actieve Dossiers</h1>
          <p className="text-sm text-gray-600">Bekijk en beheer dossiers per client • {getContextInfo()}</p>
        </div>

        {/* Main Container: Two Panel Layout */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[800px] flex">
          
          {/* LEFT PANEL: Clients List with Search */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek clients met actieve dossiers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm"
                />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} met actieve dossiers gevonden
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshClients}
                  disabled={clientsLoading}
                  className="h-auto p-1"
                >
                  <RefreshCw className={`h-3 w-3 ${clientsLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              
              {clientsError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {clientsError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Scrollable Clients List */}
            <div className="flex-1 overflow-y-auto">
              {!selectedOrganization && !selectedWorkspace ? (
                <div className="p-8 text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Selecteer een organisatie of werkruimte</p>
                </div>
              ) : clientsLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                  <p className="text-sm">Klanten laden...</p>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm mb-4">
                    {clientsError ? 'Er ging iets mis bij het laden van klanten' : 'Geen klanten met actieve dossiers gevonden'}
                  </p>
                  <Button onClick={createExamples} variant="outline" size="sm">
                    Voorbeeldklanten aanmaken
                  </Button>
                </div>
              ) : (
                filteredClients.map((client) => (
                  <div 
                    key={client.id} 
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedClient === client.id 
                        ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedClient(client.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {client.type === 'zakelijk' ? (
                            <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          ) : (
                            <User className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                          <h3 className="font-semibold text-gray-900 text-sm truncate">{client.name}</h3>
                        </div>
                        
                        {client.contact_person && (
                          <p className="text-xs text-gray-600 mb-1 truncate">
                            {client.contact_person}
                          </p>
                        )}
                        
                        {client.email && (
                          <p className="text-xs text-gray-500 mb-2 truncate">
                            {client.email}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                            {client.dossier_count} actieve
                          </Badge>
                          <Badge variant="outline" className={`text-xs ${
                            client.type === 'zakelijk' 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-purple-100 text-purple-800 border-purple-200'
                          }`}>
                            {client.type === 'zakelijk' ? 'Zakelijk' : 'Privé'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT PANEL: Dossier Timeline */}
          <div className="flex-1 flex flex-col">
            {/* Timeline Header with Filter */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              {selectedClientData ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedClientData.name}</h2>
                      <p className="text-sm text-gray-600">
                        {selectedClientData.dossier_count} actieve dossier{selectedClientData.dossier_count !== 1 ? 's' : ''} • 
                        Laatste activiteit: {filteredTimeline.length > 0 ? formatTimelineDate(filteredTimeline[0].date) : 'onbekend'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">Actief</Badge>
                    </div>
                  </div>
                  
                  {/* Filter Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Filter:</label>
                      <select 
                        value={timelineFilter} 
                        onChange={(e) => setTimelineFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Alle items</option>
                        <option value="email">E-mails</option>
                        <option value="document">Documenten</option>
                        <option value="phone_call">Telefoongesprekken</option>
                        <option value="invoice">Facturen</option>
                        <option value="quote">Offertes</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-gray-700">Periode:</label>
                      <select 
                        value={periodFilter} 
                        onChange={(e) => setPeriodFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Alle tijd</option>
                        <option value="today">Vandaag</option>
                        <option value="week">Deze week</option>
                        <option value="month">Deze maand</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Selecteer een client</h2>
                  <p className="text-sm text-gray-600">Kies een client uit de lijst om de dossier tijdlijn te bekijken</p>
                </div>
              )}
              
              {timelineError && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Timeline fout: {timelineError}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Scrollable Timeline Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {!selectedClient ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Selecteer een client</p>
                    <p className="text-sm">Kies een client uit de lijst om de dossier tijdlijn te bekijken</p>
                  </div>
                </div>
              ) : timelineLoading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
                    <p>Tijdlijn laden...</p>
                  </div>
                </div>
              ) : filteredTimeline.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Geen activiteiten gevonden</p>
                    <p className="text-sm">
                      {timelineError ? 'Er ging iets mis bij het laden van de tijdlijn' : 'Geen communicatie of documenten gevonden voor de geselecteerde filters'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredTimeline.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-4">
                      {/* Timeline Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTimelineColor(item.type)}`}>
                        {getTimelineIcon(item.type)}
                      </div>
                      
                      {/* Timeline Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`bg-white border rounded-lg p-4 shadow-sm ${getTimelineCardBorder(item.type)}`}>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{item.title}</h4>
                            <span className="text-xs text-gray-500">{formatTimelineDate(item.date)}</span>
                          </div>
                          
                          {item.description && (
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          )}
                          
                          {item.from_email && (
                            <p className="text-sm text-gray-600 mb-2">Van: {item.from_email}</p>
                          )}
                          
                          {item.subject && (
                            <p className="text-sm text-gray-800 mb-2">Onderwerp: {item.subject}</p>
                          )}
                          
                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {item.type === 'email' ? 'E-mail' : 
                               item.type === 'document' ? 'Document' : 
                               item.type === 'phone_call' ? 'Gesprek' :
                               item.type === 'invoice' ? 'Factuur' :
                               item.type === 'quote' ? 'Offerte' : 'Activiteit'}
                            </Badge>
                            
                            {item.status && (
                              <div className="flex items-center gap-1">
                                {item.status === 'completed' ? (
                                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-200">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Voltooid
                                  </Badge>
                                ) : item.status === 'pending' ? (
                                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                                    <Clock className="h-3 w-3 mr-1" />
                                    In behandeling
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Fout
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="ml-auto flex gap-1">
                              <Button variant="ghost" size="sm" className="text-xs h-auto px-2 py-1">
                                Bekijken
                              </Button>
                              {item.type === 'email' && (
                                <Button variant="ghost" size="sm" className="text-xs h-auto px-2 py-1">
                                  Beantwoorden
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
