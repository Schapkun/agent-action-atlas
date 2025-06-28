
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, Plus, Building2, Calendar, Mail, FileText, Phone, AlertCircle, Clock, Euro, User, ExternalLink, Eye, Edit, Trash2 } from 'lucide-react';
import { useDossiers } from '@/hooks/useDossiers';
import { EnhancedCreateDossierDialog } from '@/components/dossiers/EnhancedCreateDossierDialog';
import { DossierDetailDialog } from '@/components/dossiers/DossierDetailDialog';
import { DossierUpdatesSection } from '@/components/dashboard/DossierUpdatesSection';
import { AddStatusUpdateDialog } from '@/components/dossiers/AddStatusUpdateDialog';
import { AddDeadlineDialog } from '@/components/dossiers/AddDeadlineDialog';

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

  const statusUpdateTypes = [
    { type: 'all', label: 'Alle items', icon: Folder, count: 0 },
    { type: 'status_update', label: 'Status Updates', icon: Clock, count: 0 },
    { type: 'deadline', label: 'Deadlines', icon: Calendar, count: 0 }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <EnhancedCreateDossierDialog onDossierCreated={handleDossierCreated} />
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
        <EnhancedCreateDossierDialog onDossierCreated={handleDossierCreated} />
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left side - 1/3 - Dossiers List */}
        <div className="w-1/3 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              Bekijk en beheer dossiers per client
              <Badge variant="outline">
                {activeDossiers.length} actief
              </Badge>
            </h3>
            
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
                      <h4 className="font-semibold text-slate-900 line-clamp-2 flex-1">
                        {dossier.name}
                      </h4>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        <DossierDetailDialog dossier={dossier}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </DossierDetailDialog>
                        <AddStatusUpdateDialog 
                          dossierId={dossier.id}
                          clientName={dossier.client_name || dossier.client?.name}
                        >
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </AddStatusUpdateDialog>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(dossier.status)}
                      >
                        {dossier.status}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={getPriorityColor(dossier.priority)}
                      >
                        {dossier.priority}
                      </Badge>
                    </div>
                    
                    {dossier.description && (
                      <p className="text-slate-600 mb-3 line-clamp-2">
                        {dossier.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {(dossier.client_name || dossier.client) && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          <span className="text-xs">{dossier.client_name || dossier.client?.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-slate-600">
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

        {/* Right side - 2/3 - Dossier Details */}
        <div className="w-2/3 space-y-4">
          {selectedDossier ? (
            <>
              {/* Dossier Header */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{selectedDossier.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-100 text-green-800 border-green-200">Actief</Badge>
                      <span className="text-slate-600">
                        Aangemaakt: {new Date(selectedDossier.created_at).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AddStatusUpdateDialog 
                      dossierId={selectedDossier.id}
                      clientName={selectedDossier.client_name || selectedDossier.client?.name}
                    >
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Status Update
                      </Button>
                    </AddStatusUpdateDialog>
                    <AddDeadlineDialog
                      dossierId={selectedDossier.id}
                      clientName={selectedDossier.client_name || selectedDossier.client?.name}
                    >
                      <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Deadline
                      </Button>
                    </AddDeadlineDialog>
                    <DossierDetailDialog dossier={selectedDossier}>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </DossierDetailDialog>
                  </div>
                </div>

                {selectedDossier.description && (
                  <p className="text-slate-600 mb-4">{selectedDossier.description}</p>
                )}

                {selectedDossier.client_name && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    <span>Client: {selectedDossier.client_name}</span>
                  </div>
                )}
              </div>

              {/* Updates Section */}
              <div className="bg-white rounded-lg border border-slate-200">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-slate-900">Recente activiteiten</h3>
                </div>
                <div className="p-6">
                  <DossierUpdatesSection dossierId={selectedDossier.id} />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 h-full flex items-center justify-center">
              <div className="text-center">
                <Folder className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Selecteer een dossier</h3>
                <p className="text-slate-600">
                  Klik op een dossier links om de details en status updates te bekijken
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
