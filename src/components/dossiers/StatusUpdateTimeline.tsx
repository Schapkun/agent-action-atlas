
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Building2, Filter, Bot, UserRound } from 'lucide-react';
import { DossierStatusUpdate, UPDATE_TYPE_LABELS, PRIORITY_LABELS } from '@/types/dossierStatusUpdates';
import { AddStatusUpdateDialog } from './AddStatusUpdateDialog';
import { useDossierStatusUpdates } from '@/hooks/useDossierStatusUpdates';

interface StatusUpdateTimelineProps {
  dossierId: string;
}

export const StatusUpdateTimeline = ({ dossierId }: StatusUpdateTimelineProps) => {
  const { statusUpdates, createStatusUpdate, loading } = useDossierStatusUpdates(dossierId);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  const filteredUpdates = statusUpdates.filter(update => {
    if (typeFilter !== 'all' && update.update_type !== typeFilter) return false;
    if (sourceFilter === 'manual' && update.is_ai_generated) return false;
    if (sourceFilter === 'ai' && !update.is_ai_generated) return false;
    return true;
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

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'legal_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'client_contact': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'court_hearing': return 'bg-red-100 text-red-800 border-red-200';
      case 'research': return 'bg-green-100 text-green-800 border-green-200';
      case 'consultation': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Status Updates</h3>
          <Badge variant="outline" className="text-xs">
            {filteredUpdates.length} updates
          </Badge>
        </div>
        
        <AddStatusUpdateDialog 
          dossierId={dossierId} 
          onStatusUpdate={createStatusUpdate}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-600">Filters:</span>
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48 h-8 text-xs">
            <SelectValue placeholder="Filter op type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle types</SelectItem>
            {Object.entries(UPDATE_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="Bron" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="manual">Handmatig</SelectItem>
            <SelectItem value="ai">AI Gegenereerd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p>Nog geen status updates toegevoegd</p>
            <p className="text-sm">Voeg de eerste status update toe om te beginnen</p>
          </div>
        ) : (
          filteredUpdates.map((update, index) => (
            <div key={update.id} className="relative">
              {/* Timeline line */}
              {index < filteredUpdates.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-slate-200"></div>
              )}
              
              <div className="flex gap-4">
                {/* Timeline dot */}
                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  update.is_ai_generated 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'bg-slate-100 border-slate-300'
                }`}>
                  {update.is_ai_generated ? (
                    <Bot className="h-5 w-5 text-blue-600" />
                  ) : (
                    <UserRound className="h-5 w-5 text-slate-600" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 bg-slate-50 rounded-lg p-4 border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-slate-900">{update.status_title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getUpdateTypeColor(update.update_type)}`}
                      >
                        {UPDATE_TYPE_LABELS[update.update_type]}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(update.priority)}`}
                      >
                        {PRIORITY_LABELS[update.priority]}
                      </Badge>
                      {update.is_ai_generated && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          AI
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-slate-500 text-right">
                      {new Date(update.created_at).toLocaleDateString('nl-NL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>

                  {update.status_description && (
                    <p className="text-sm text-slate-700 mb-3">{update.status_description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                    {update.client && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{update.client.name}</span>
                        {update.client.contact_number && (
                          <span className="text-slate-400">#{update.client.contact_number}</span>
                        )}
                      </div>
                    )}
                    
                    {update.hours_spent > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{update.hours_spent}h</span>
                        {update.is_billable && (
                          <span className="text-green-600">(factureerbaar)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {update.notes && (
                    <div className="text-sm text-slate-600 bg-white p-3 rounded border border-slate-200">
                      <strong className="text-xs text-slate-500 uppercase tracking-wide">Notities:</strong>
                      <p className="mt-1">{update.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
