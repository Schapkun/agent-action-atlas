
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2, Calendar } from 'lucide-react';
import { useDossierStatusUpdates } from '@/hooks/useDossierStatusUpdates';
import { useDossierDeadlines } from '@/hooks/useDossierDeadlines';
import { UPDATE_TYPE_LABELS } from '@/types/dossierStatusUpdates';
import { EditDeadlineDialog } from '@/components/dossiers/EditDeadlineDialog';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';
import { AddStatusUpdateDialog } from '@/components/dossiers/AddStatusUpdateDialog';
import { useToast } from '@/hooks/use-toast';

interface DossierUpdatesSectionProps {
  dossierId: string;
}

export const DossierUpdatesSection = ({ dossierId }: DossierUpdatesSectionProps) => {
  const { statusUpdates, isLoading: updatesLoading } = useDossierStatusUpdates(dossierId);
  const { deadlines, isLoading: deadlinesLoading } = useDossierDeadlines(dossierId);
  const { settings } = useOrganizationSettings();
  const { toast } = useToast();

  const handleDeleteActivity = (activityId: string) => {
    // In real app, this would delete from API
    toast({
      title: "Activiteit verwijderd",
      description: "De activiteit is succesvol verwijderd."
    });
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Laag';
      case 'medium': return 'Normaal';
      case 'high': return 'Hoog';
      case 'urgent': return 'Urgent';
      default: return priority;
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDeadlineDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Combine and sort all items by date
  const allItems = [
    ...statusUpdates.map(update => ({
      ...update,
      type: 'status_update' as const,
      date: update.created_at
    })),
    ...deadlines.map(deadline => ({
      ...deadline,
      type: 'deadline' as const,
      date: deadline.created_at
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (updatesLoading || deadlinesLoading) {
    return <div className="text-slate-600">Laden...</div>;
  }

  if (allItems.length === 0) {
    return <div className="text-slate-600">Geen activiteiten gevonden</div>;
  }

  return (
    <div className="space-y-3">
      {allItems.slice(0, 10).map((item, index) => (
        <div key={`${item.type}-${item.id}-${index}`} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="bg-white p-2 rounded-lg flex-shrink-0">
              {item.type === 'status_update' ? (
                <Clock className="h-4 w-4 text-blue-600" />
              ) : (
                <Calendar className="h-4 w-4 text-orange-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {item.type === 'status_update' ? (
                <>
                  <p className="font-medium text-slate-900 truncate">{item.status_title}</p>
                  <p className="text-slate-600 mb-1">
                    Type: {UPDATE_TYPE_LABELS[item.update_type] || item.update_type}
                  </p>
                  {item.status_description && (
                    <p className="text-slate-700 line-clamp-2">{item.status_description}</p>
                  )}
                  {item.hours_spent > 0 && (
                    <p className="text-slate-500 mt-1">
                      {item.hours_spent}h besteed {item.is_billable ? '(factureerbaar)' : '(niet factureerbaar)'}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className={`font-medium ${getDeadlineColor(item.due_date)}`}>
                    {formatDeadlineDateTime(item.due_date)}
                  </p>
                  <p className="font-medium text-slate-900">{item.title}</p>
                  {item.description && (
                    <p className="text-slate-700 line-clamp-1">{item.description}</p>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 ml-4 flex-shrink-0">
            <div className="text-right">
              <span className="text-slate-500 block">
                {formatDateTime(item.date)}
              </span>
              <Badge variant="outline" className={`mt-1 ${getPriorityColor(item.priority)}`}>
                {getPriorityLabel(item.priority)}
              </Badge>
            </div>
            <div className="flex gap-1">
              {item.type === 'deadline' ? (
                <EditDeadlineDialog deadline={item} />
              ) : (
                <>
                  <AddStatusUpdateDialog 
                    dossierId={dossierId}
                    editMode={true}
                    editActivity={item}
                  >
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </AddStatusUpdateDialog>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                    onClick={() => handleDeleteActivity(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
