
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Trash2 } from 'lucide-react';
import { DossierStatusUpdate, UPDATE_TYPE_LABELS } from '@/types/dossierStatusUpdates';
import { AddStatusUpdateDialog } from '@/components/dossiers/AddStatusUpdateDialog';
import { useToast } from '@/hooks/use-toast';

interface RecentActivitiesProps {
  statusUpdates: DossierStatusUpdate[];
  isLoading: boolean;
}

export const RecentActivities = ({ statusUpdates, isLoading }: RecentActivitiesProps) => {
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedActivities = statusUpdates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isLoading) {
    return (
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Recente activiteiten</h3>
        </div>
        <div className="text-slate-600">Activiteiten laden...</div>
      </div>
    );
  }

  if (sortedActivities.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900">Recente activiteiten</h3>
        </div>
        <div className="text-slate-600">Geen activiteiten gevonden</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Recente activiteiten</h3>
      </div>
      <div className="space-y-2">
        {sortedActivities.slice(0, 10).map((activity) => (
          <div key={`activity-${activity.id}`} className="flex items-start justify-between p-3 bg-white rounded-lg">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="bg-slate-100 p-2 rounded-lg flex-shrink-0">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{activity.status_title}</p>
                <p className="text-slate-600 mb-1">
                  Type: {UPDATE_TYPE_LABELS[activity.update_type] || activity.update_type}
                </p>
                {activity.status_description && (
                  <p className="text-slate-700 line-clamp-2">{activity.status_description}</p>
                )}
                {activity.hours_spent > 0 && (
                  <p className="text-slate-500 mt-1">
                    {activity.hours_spent}h besteed {activity.is_billable ? '(factureerbaar)' : '(niet factureerbaar)'}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 flex-shrink-0 ml-4">
              <div className="text-right">
                <span className="text-slate-500 block">
                  {formatDateTime(activity.created_at)}
                </span>
                <Badge variant="outline" className={`mt-1 ${getPriorityColor(activity.priority)}`}>
                  {getPriorityLabel(activity.priority)}
                </Badge>
              </div>
              <div className="flex gap-1">
                <AddStatusUpdateDialog 
                  dossierId={activity.dossier_id}
                  editMode={true}
                  editActivity={activity}
                >
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-600 hover:text-blue-600">
                    <Edit className="h-4 w-4" />
                  </Button>
                </AddStatusUpdateDialog>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-slate-600 hover:text-red-600"
                  onClick={() => handleDeleteActivity(activity.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
