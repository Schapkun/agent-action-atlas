
import { useState } from 'react';
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
      await createExampleClients(selectedOrganization.id, selectedWorkspace?.id);
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
      case 'email': return <Mail className="h-5 w-5 text-blue-600" />;
      case 'document': return <FileText className="h-5 w-5 text-green-600" />;
      case 'phone_call': return <Phone className="h-5 w-5 text-purple-600" />;
      case 'invoice': return <CreditCard className="h-5 w-5 text-yellow-600" />;
      case 'quote': return <FileCheck className="h-5 w-5 text-indigo-600" />;
      default: return <Calendar className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTimelineIconBg = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100';
      case 'document': return 'bg-green-100';
      case 'phone_call': return 'bg-purple-100';
      case 'invoice': return 'bg-yellow-100';
      case 'quote': return 'bg-indigo-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Actieve Dossiers</h1>
        <p className="text-sm text-gray-600">Bekijk en beheer dossiers per client</p>
        <div className="text-sm text-gray-500 mt-1">{getContextInfo()}</div>
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
                className="pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {filteredClients.length} clients met actieve dossiers gevonden
            </div>
          </div>

          {/* Scrollable Clients List */}
          <div className="flex-1 overflow-y-auto">
            {!selectedOrganization && !selectedWorkspace ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecteer een organisatie of werkruimte</p>
              </div>
            ) : clientsLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">Klanten laden...</div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm mb-4">Geen klanten gevonden</p>
                <Button onClick={createExamples} variant="outline" size="sm">
                  Voorbeelddata aanmaken
                </Button>
              </div>
            ) : (
              filteredClients.map((client) => (
                <div 
                  key={client.id} 
                  className={`p-4 border-b border-gray-100 cursor-pointer ${
                    selectedClient === client.id 
                      ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedClient(client.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{client.name}</h3>
                      {client.contact_person && (
                        <p className="text-xs text-gray-600 mt-1">{client.contact_person}</p>
                      )}
                      <p className="text-xs text-gray-500">{client.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                          {client.dossier_count} actief{client.dossier_count !== 1 ? 'e' : ''}
                        </span>
                        <Badge variant="outline" className={`text-xs ${
                          client.type === 'zakelijk' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
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

        {/* RIGHT PANEL: Dossier Details with Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Dossier Header with Filter */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            {selectedClientData ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedClientData.name}</h2>
                    <p className="text-sm text-gray-600">
                      {selectedClientData.dossier_count} actieve dossier{selectedClientData.dossier_count !== 1 ? 's' : ''} • 
                      {selectedClientData.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">Actief</span>
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
                <h2 className="text-xl font-bold text-gray-900">Selecteer een klant</h2>
                <p className="text-sm text-gray-600">Kies een klant uit de lijst om de dossier tijdlijn te bekijken</p>
              </div>
            )}
          </div>

          {/* Scrollable Timeline Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!selectedClient ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecteer een klant om de dossier tijdlijn te bekijken</p>
              </div>
            ) : timelineLoading ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">Tijdlijn laden...</div>
              </div>
            ) : filteredTimeline.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Geen communicatie of documenten gevonden</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredTimeline.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 ${getTimelineIconBg(item.type)} rounded-full flex items-center justify-center`}>
                      {getTimelineIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(item.date).toLocaleString('nl-NL')}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        {item.status && (
                          <div className="flex items-center gap-1 mb-2">
                            {item.status === 'completed' ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : item.status === 'pending' ? (
                              <Clock className="h-3 w-3 text-yellow-600" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span className="text-xs text-gray-500 capitalize">{item.status}</span>
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <button className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100">
                            Bekijken
                          </button>
                          {item.type === 'email' && (
                            <button className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
                              Beantwoorden
                            </button>
                          )}
                          {item.type === 'document' && (
                            <button className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded hover:bg-green-100">
                              Downloaden
                            </button>
                          )}
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
  );
};
