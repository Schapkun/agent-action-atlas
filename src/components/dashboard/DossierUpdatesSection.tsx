
import React from 'react';
import { Clock, Calendar, AlertCircle, Edit, Trash2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDossierStatusUpdates } from '@/hooks/useDossierStatusUpdates';
import { useDossierDeadlines } from '@/hooks/useDossierDeadlines';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';
import { EditDeadlineDialog } from '@/components/dossiers/EditDeadlineDialog';
import { UPDATE_TYPE_LABELS } from '@/types/dossierStatusUpdates';

interface DossierUpdatesSectionProps {
  dossierId?: string;
}

export const DossierUpdatesSection = ({ dossierId }: DossierUpdatesSectionProps) => {
  const { statusUpdates, isLoading: statusLoading } = useDossierStatusUpdates(dossierId);
  const { deadlines, isLoading: deadlinesLoading } = useDossierDeadlines(dossierId);
  const { settings } = useOrganizationSettings();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Laag';
      case 'medium': return 'Normaal';
      case 'high': return 'Hoog';
      case 'urgent': return 'Urgent';
      default: return priority;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'In behandeling';
      case 'completed': return 'Voltooid';
      case 'overdue': return 'Verlopen';
      default: return status;
    }
  };

  const getDeadlineColor = (dueDate: string) => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diffInHours = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours <= settings.deadline_red_hours) {
      return 'text-red-600';
    } else if (diffInDays <= settings.deadline_orange_days) {
      return 'text-orange-600';
    } else {
      return 'text-green-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeadlineDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mock documents data (would normally come from API)
  const mockDocuments = [
    {
      id: '1',
      name: 'Leveringscontract Biologisch Meel Q1-Q2 2025',
      type: 'Contract',
      size: '245 KB',
      uploadDate: 'Gisteren 16:45',
      uploadedBy: 'Marie van der Berg'
    },
    {
      id: '2',
      name: 'Intake Notities - Eerste Gesprek',
      type: 'Notitie',
      size: '89 KB',
      uploadDate: '1 week geleden',
      uploadedBy: 'Marie van der Berg'
    }
  ];

  // Combine and sort all updates
  const allUpdates = [
    ...statusUpdates.map(update => ({
      id: update.id,
      type: 'status_update' as const,
      title: update.status_title,
      description: update.status_description,
      date: update.created_at,
      priority: update.priority,
      update_type: update.update_type,
      hours_spent: update.hours_spent,
      is_billable: update.is_billable,
      dossier_id: update.dossier_id
    })),
    ...deadlines.map(deadline => ({
      id: deadline.id,
      type: 'deadline' as const,
      title: deadline.title,
      description: deadline.description,
      date: deadline.due_date,
      createdDate: deadline.created_at,
      priority: deadline.priority,
      status: deadline.status,
      dossier_id: deadline.dossier_id,
      deadline: deadline
    })),
    ...mockDocuments.map(doc => ({
      id: doc.id,
      type: 'document' as const,
      title: doc.name,
      description: `${doc.type} • ${doc.size}`,
      date: doc.uploadDate,
      uploadedBy: doc.uploadedBy
    }))
  ].sort((a, b) => {
    const dateA = a.type === 'deadline' ? new Date(a.createdDate || a.date) : new Date(a.date);
    const dateB = b.type === 'deadline' ? new Date(b.createdDate || b.date) : new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  if (statusLoading || deadlinesLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg p-4 border">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (allUpdates.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Geen recente activiteiten gevonden</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allUpdates.slice(0, 10).map((update) => (
        <div key={`${update.type}-${update.id}`} className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-slate-100 p-2 rounded-lg">
                {update.type === 'status_update' && <Clock className="h-4 w-4 text-blue-600" />}
                {update.type === 'deadline' && <Calendar className="h-4 w-4 text-green-600" />}
                {update.type === 'document' && <FileText className="h-4 w-4 text-purple-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-slate-900">{update.title}</h4>
                  <Badge variant="outline" className={getPriorityColor(update.priority)}>
                    {getPriorityLabel(update.priority)}
                  </Badge>
                  {update.type === 'deadline' && (
                    <Badge variant="outline" className={getStatusColor(update.status!)}>
                      {getStatusLabel(update.status!)}
                    </Badge>
                  )}
                </div>
                
                {update.type === 'status_update' && (
                  <div className="text-sm text-slate-600 mb-1">
                    <span className="font-medium">
                      {UPDATE_TYPE_LABELS[update.update_type as keyof typeof UPDATE_TYPE_LABELS] || update.update_type}
                    </span>
                    {update.hours_spent > 0 && (
                      <span className="ml-2">
                        • {update.hours_spent}h {update.is_billable ? '(factureerbaar)' : '(niet factureerbaar)'}
                      </span>
                    )}
                  </div>
                )}
                
                {update.type === 'deadline' && (
                  <div className="text-sm text-slate-600 mb-1">
                    <span className="font-medium">Deadline</span>
                  </div>
                )}

                {update.type === 'document' && update.uploadedBy && (
                  <div className="text-sm text-slate-600 mb-1">
                    <span className="font-medium">Document geüpload door {update.uploadedBy}</span>
                  </div>
                )}
                
                {update.description && (
                  <p className="text-sm text-slate-700 mb-2">{update.description}</p>
                )}

                <div className="flex items-center gap-2">
                  {(update.type === 'status_update' || update.type === 'document') && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 hover:text-blue-600">
                      <Edit className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {update.type === 'deadline' && (
                    <EditDeadlineDialog deadline={update.deadline!} />
                  )}

                  {update.type !== 'deadline' && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 hover:text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-right text-sm">
              <div className="text-slate-500">
                {update.type === 'deadline' ? formatDate(update.createdDate || update.date) : (
                  update.type === 'document' ? update.date : formatDate(update.date)
                )}
              </div>
              {update.type === 'deadline' && (
                <div className={`font-medium ${getDeadlineColor(update.date)}`}>
                  Vervalt: {formatDeadlineDate(update.date)}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
