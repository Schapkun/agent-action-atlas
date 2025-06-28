
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2 } from 'lucide-react';
import { DossierStatusUpdate, UPDATE_TYPE_LABELS } from '@/types/dossierStatusUpdates';
import { useToast } from '@/hooks/use-toast';

interface RecentActivitiesProps {
  statusUpdates: DossierStatusUpdate[];
  isLoading: boolean;
}

export const RecentActivities = ({ statusUpdates, isLoading }: RecentActivitiesProps) => {
  const { toast } = useToast();

  const handleEditActivity = (activityId: string) => {
    toast({
      title: "Activiteit bewerken",
      description: "Activiteit bewerk functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  const handleDeleteActivity = (activityId: string) => {
    toast({
      title: "Activiteit verwijderen",
      description: "Activiteit verwijder functionaliteit wordt binnenkort toegevoegd.",
      variant: "destructive"
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const recentActivities = statusUpdates.map(update => ({
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
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="bg-slate-50 rounded-lg p-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-900">Recente activiteiten</h3>
        </div>
        <div className="text-xs text-slate-600">Activiteiten laden...</div>
      </div>
    );
  }

  if (recentActivities.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-2">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-slate-900">Recente activiteiten</h3>
        </div>
        <div className="text-xs text-slate-600">Geen activiteiten gevonden</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900">Recente activiteiten</h3>
      </div>
      <div className="space-y-1">
        {recentActivities.slice(0, 10).map((activity) => (
          <div key={`activity-${activity.id}`} className="flex items-start justify-between p-1.5 bg-white rounded-lg">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <div className="bg-slate-100 p-1 rounded-lg flex-shrink-0">
                <Clock className="h-3 w-3 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">{activity.title}</p>
                <p className="text-xs text-slate-600 mb-0.5">
                  Type: {UPDATE_TYPE_LABELS[activity.update_type] || activity.update_type}
                </p>
                {activity.description && (
                  <p className="text-xs text-slate-700 line-clamp-2">{activity.description}</p>
                )}
                {activity.hours_spent > 0 && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activity.hours_spent}h besteed {activity.is_billable ? '(factureerbaar)' : '(niet factureerbaar)'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-4 flex-shrink-0 ml-4">
              <div className="text-right">
                <span className="text-xs text-slate-500 block">
                  {formatDateTime(activity.date)}
                </span>
                <Badge variant="outline" className={`text-xs mt-0.5 ${getPriorityColor(activity.priority)}`}>
                  {getPriorityLabel(activity.priority)}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-blue-600" onClick={() => handleEditActivity(activity.id)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-red-600" onClick={() => handleDeleteActivity(activity.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
