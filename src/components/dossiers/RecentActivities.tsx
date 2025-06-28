
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Edit, Trash2, Save, X } from 'lucide-react';
import { DossierStatusUpdate, UPDATE_TYPE_LABELS } from '@/types/dossierStatusUpdates';
import { useToast } from '@/hooks/use-toast';

interface RecentActivitiesProps {
  statusUpdates: DossierStatusUpdate[];
  isLoading: boolean;
}

export const RecentActivities = ({ statusUpdates, isLoading }: RecentActivitiesProps) => {
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [activities, setActivities] = useState(statusUpdates);
  const [editData, setEditData] = useState<{title: string, description: string}>({title: '', description: ''});

  React.useEffect(() => {
    setActivities(statusUpdates);
  }, [statusUpdates]);

  const handleEditActivity = (update: DossierStatusUpdate) => {
    setEditingActivity(update.id);
    setEditData({
      title: update.status_title,
      description: update.status_description || ''
    });
  };

  const handleSaveActivity = (activityId: string) => {
    // In real app, this would save to API
    setActivities(prev => prev.map(activity => 
      activity.id === activityId 
        ? { ...activity, status_title: editData.title, status_description: editData.description }
        : activity
    ));
    setEditingActivity(null);
    toast({
      title: "Activiteit bijgewerkt",
      description: "De activiteit is succesvol bijgewerkt.",
    });
  };

  const handleCancelEdit = () => {
    setEditingActivity(null);
    setEditData({title: '', description: ''});
  };

  const handleDeleteActivity = (activityId: string) => {
    // In real app, this would delete from API
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
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

  const sortedActivities = activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (isLoading) {
    return (
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Recente activiteiten</h3>
        </div>
        <div className="text-sm text-slate-600">Activiteiten laden...</div>
      </div>
    );
  }

  if (sortedActivities.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">Recente activiteiten</h3>
        </div>
        <div className="text-sm text-slate-600">Geen activiteiten gevonden</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Recente activiteiten</h3>
      </div>
      <div className="space-y-2">
        {sortedActivities.slice(0, 10).map((activity) => (
          <div key={`activity-${activity.id}`} className="flex items-start justify-between p-3 bg-white rounded-lg">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="bg-slate-100 p-2 rounded-lg flex-shrink-0">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                {editingActivity === activity.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editData.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="h-6 text-sm font-medium"
                      placeholder="Titel"
                    />
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      className="min-h-[60px] resize-none text-sm"
                      placeholder="Beschrijving"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-900 truncate">{activity.status_title}</p>
                    <p className="text-sm text-slate-600 mb-1">
                      Type: {UPDATE_TYPE_LABELS[activity.update_type] || activity.update_type}
                    </p>
                    {activity.status_description && (
                      <p className="text-sm text-slate-700 line-clamp-2">{activity.status_description}</p>
                    )}
                    {activity.hours_spent > 0 && (
                      <p className="text-sm text-slate-500 mt-1">
                        {activity.hours_spent}h besteed {activity.is_billable ? '(factureerbaar)' : '(niet factureerbaar)'}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex items-start gap-6 flex-shrink-0 ml-4">
              <div className="text-right">
                <span className="text-sm text-slate-500 block">
                  {formatDateTime(activity.created_at)}
                </span>
                <Badge variant="outline" className={`text-xs mt-1 ${getPriorityColor(activity.priority)}`}>
                  {getPriorityLabel(activity.priority)}
                </Badge>
              </div>
              <div className="flex gap-1">
                {editingActivity === activity.id ? (
                  <>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-600 hover:text-green-700" onClick={() => handleSaveActivity(activity.id)}>
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 hover:text-red-600" onClick={handleCancelEdit}>
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 hover:text-blue-600" onClick={() => handleEditActivity(activity)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 hover:text-red-600" onClick={() => handleDeleteActivity(activity.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
