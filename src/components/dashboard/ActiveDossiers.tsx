
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, Plus, Building2, Calendar, Mail, FileText, Phone, AlertCircle } from 'lucide-react';
import { useDossiers } from '@/hooks/useDossiers';
import { EnhancedCreateDossierDialog } from '@/components/dossiers/EnhancedCreateDossierDialog';
import { DossierDetailDialog } from '@/components/dossiers/DossierDetailDialog';

export const ActiveDossiers = () => {
  const { dossiers, loading, refreshDossiers } = useDossiers();
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const activeDossiers = dossiers.filter(dossier => dossier.status === 'active');

  const handleDossierCreated = () => {
    refreshDossiers();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Mock status updates data - in real app this would come from API
  const getStatusUpdates = (dossierId: string) => [
    {
      id: '1',
      type: 'email',
      title: 'E-mail ontvangen',
      description: 'Van: marie@dekorenbloem.nl - Onderwerp: Vraag over nieuwe leveringscontract',
      date: 'Vandaag 14:23',
      icon: Mail,
      color: 'text-blue-500'
    },
    {
      id: '2',
      type: 'document',
      title: 'Contract opstellen',
      description: 'Leveringscontract Biologisch Meel Q1-Q2 2025',
      date: 'Gisteren 16:45',
      icon: FileText,
      color: 'text-green-500'
    },
    {
      id: '3',
      type: 'phone',
      title: 'Telefoongesprek',
      description: 'Intake gesprek nieuwe leveringscontract (15 min)',
      date: '1 week geleden',
      icon: Phone,
      color: 'text-purple-500'
    },
    {
      id: '4',
      type: 'invoice',
      title: 'Factuur verzonden',
      description: 'Factuur #2025-001 - Juridisch advies december € 1.250,00 (excl. BTW)',
      date: '3 dagen geleden',
      icon: AlertCircle,
      color: 'text-yellow-500'
    }
  ];

  const statusUpdateTypes = [
    { type: 'all', label: 'Alle items', icon: Folder, count: 4 },
    { type: 'email', label: 'E-mails', icon: Mail, count: 1 },
    { type: 'document', label: 'Documenten', icon: FileText, count: 1 },
    { type: 'phone', label: 'Gesprekken', icon: Phone, count: 1 },
    { type: 'invoice', label: 'Facturen', icon: AlertCircle, count: 1 }
  ];

  const filteredStatusUpdates = selectedDossier 
    ? getStatusUpdates(selectedDossier.id).filter(update => 
        statusFilter === 'all' || update.type === statusFilter
      )
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Actieve Dossiers</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto"></div>
          <p className="text-slate-600 mt-2">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <Folder className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Actieve Dossiers</h1>
          <Badge variant="outline" className="text-sm">
            {activeDossiers.length} actief
          </Badge>
        </div>
        
        <EnhancedCreateDossierDialog onDossierCreated={handleDossierCreated} />
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left side - 1/3 - Dossiers List */}
        <div className="w-1/3 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Bekijk en beheer dossiers per client</h3>
            
            {activeDossiers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Folder className="h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Geen actieve dossiers</h3>
                <p className="text-slate-600 text-center mb-6">
                  Maak je eerste dossier aan om te beginnen
                </p>
                <EnhancedCreateDossierDialog onDossierCreated={handleDossierCreated}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuw Dossier
                  </Button>
                </EnhancedCreateDossierDialog>
              </div>
            ) : (
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {activeDossiers.map((dossier) => (
                  <div
                    key={dossier.id} 
                    className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                      selectedDossier?.id === dossier.id 
                        ? 'border-slate-800 bg-slate-50 shadow-md' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedDossier(dossier)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">
                        {dossier.name}
                      </h4>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(dossier.status)}`}
                        >
                          {dossier.status}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(dossier.priority)}`}
                        >
                          {dossier.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    {dossier.description && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {dossier.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {(dossier.client_name || dossier.client) && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span className="text-xs">{dossier.client_name || dossier.client?.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span className="text-xs">
                          {new Date(dossier.created_at).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </div>
                    
                    {dossier.category && (
                      <Badge variant="outline" className="text-xs mt-2">
                        {dossier.category}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side - 2/3 - Status Updates */}
        <div className="w-2/3 space-y-4">
          {selectedDossier ? (
            <>
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{selectedDossier.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">Actief</Badge>
                      <span className="text-sm text-slate-600">
                        3 actieve dossiers • Laatste activiteit: vandaag
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Filter Icons */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-sm font-medium text-slate-700 mr-2">Filter:</span>
                  {statusUpdateTypes.map((filterType) => {
                    const Icon = filterType.icon;
                    return (
                      <button
                        key={filterType.type}
                        onClick={() => setStatusFilter(filterType.type)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          statusFilter === filterType.type
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{filterType.label}</span>
                        <Badge variant="outline" className="text-xs bg-white">
                          {filterType.count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Updates List */}
              <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto">
                {filteredStatusUpdates.map((update) => {
                  const Icon = update.icon;
                  return (
                    <div key={update.id} className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-slate-100`}>
                          <Icon className={`h-4 w-4 ${update.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900">{update.title}</h4>
                            <span className="text-sm text-slate-500">{update.date}</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{update.description}</p>
                          {update.type === 'document' && (
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" className="text-xs">
                                Downloaden
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                Bewerken
                              </Button>
                            </div>
                          )}
                          {update.type === 'email' && (
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" className="text-xs">
                                Bekijken
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs">
                                Beantwoorden
                              </Button>
                            </div>
                          )}
                          {update.type === 'invoice' && (
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                PDF bekijken
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Betaald
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 h-full flex items-center justify-center">
              <div className="text-center">
                <Folder className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Selecteer een dossier</h3>
                <p className="text-slate-600">
                  Klik op een dossier links om de status updates te bekijken
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
