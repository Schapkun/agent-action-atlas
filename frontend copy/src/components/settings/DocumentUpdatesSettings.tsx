
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, FileText, AlertCircle } from 'lucide-react';
import { UPDATE_TYPE_LABELS, PRIORITY_LABELS } from '@/types/dossierStatusUpdates';

export const DocumentUpdatesSettings = () => {
  const [selectedDossier, setSelectedDossier] = useState<string>('all');
  const [selectedUpdateType, setSelectedUpdateType] = useState<string>('all');

  // Mock data - in real app this would come from API
  const mockStatusUpdates = [
    {
      id: '1',
      dossier_name: 'Leveringscontract De Korenbloem',
      client_name: 'De Korenbloem B.V.',
      update_type: 'legal_progress',
      status_title: 'Conceptovereenkomst opgesteld',
      status_description: 'Eerste versie van het leveringscontract is opgesteld met specifieke voorwaarden voor biologische producten.',
      hours_spent: 3.5,
      priority: 'high',
      is_billable: true,
      created_at: '2025-06-26T10:30:00Z',
      created_by_name: 'Marie van der Berg'
    },
    {
      id: '2',
      dossier_name: 'Arbeidsrecht Consultatie',
      client_name: 'TechStart Solutions',
      update_type: 'client_contact',
      status_title: 'Telefoongesprek met HR manager',
      status_description: 'Besproken: nieuwe arbeidscontracten en wijzigingen in CAO bepalingen.',
      hours_spent: 1.25,
      priority: 'medium',
      is_billable: true,
      created_at: '2025-06-25T14:15:00Z',
      created_by_name: 'Jan de Vries'
    },
    {
      id: '3',
      dossier_name: 'Leveringscontract De Korenbloem',
      client_name: 'De Korenbloem B.V.',
      update_type: 'document_review',
      status_title: 'Review contractvoorwaarden',
      status_description: 'Juridische review van leveringsvoorwaarden en kwaliteitseisen uitgevoerd.',
      hours_spent: 2.0,
      priority: 'medium',
      is_billable: true,
      created_at: '2025-06-24T09:45:00Z',
      created_by_name: 'Marie van der Berg'
    }
  ];

  const mockDossiers = [
    { id: 'all', name: 'Alle dossiers' },
    { id: '1', name: 'Leveringscontract De Korenbloem' },
    { id: '2', name: 'Arbeidsrecht Consultatie' },
    { id: '3', name: 'Fusie & Overname XYZ' }
  ];

  const filteredUpdates = mockStatusUpdates.filter(update => {
    const dossierMatch = selectedDossier === 'all' || update.dossier_name === mockDossiers.find(d => d.id === selectedDossier)?.name;
    const typeMatch = selectedUpdateType === 'all' || update.update_type === selectedUpdateType;
    return dossierMatch && typeMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Status Updates Overzicht</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Dossier Filter
            </label>
            <Select value={selectedDossier} onValueChange={setSelectedDossier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockDossiers.map((dossier) => (
                  <SelectItem key={dossier.id} value={dossier.id}>
                    {dossier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Update Type Filter
            </label>
            <Select value={selectedUpdateType} onValueChange={setSelectedUpdateType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle types</SelectItem>
                {Object.entries(UPDATE_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Status Updates List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900">
              Status Updates ({filteredUpdates.length})
            </h4>
          </div>

          {filteredUpdates.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p>Geen status updates gevonden voor de geselecteerde filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUpdates.map((update) => (
                <Card key={update.id} className="border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium text-slate-900">{update.status_title}</h5>
                          <Badge variant="outline" className={getPriorityColor(update.priority)}>
                            {PRIORITY_LABELS[update.priority as keyof typeof PRIORITY_LABELS]}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {UPDATE_TYPE_LABELS[update.update_type as keyof typeof UPDATE_TYPE_LABELS]}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-2">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>{update.dossier_name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{update.client_name}</span>
                          </div>
                        </div>

                        {update.status_description && (
                          <p className="text-sm text-slate-600 mb-3">{update.status_description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{update.hours_spent}h besteed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Door: {update.created_by_name}</span>
                          </div>
                          <span>{formatDate(update.created_at)}</span>
                          {update.is_billable && (
                            <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                              Factureerbaar
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
