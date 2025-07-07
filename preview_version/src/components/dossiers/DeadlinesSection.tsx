import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { DossierDeadline } from '@/hooks/useDossierDeadlines';
import { EditDeadlineDialog } from './EditDeadlineDialog';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';

interface DeadlinesSectionProps {
  deadlines: DossierDeadline[];
  isLoading: boolean;
  showUpcoming?: boolean;
  title?: string;
}

export const DeadlinesSection = ({ 
  deadlines, 
  isLoading, 
  showUpcoming = false,
  title = "Deadlines"
}: DeadlinesSectionProps) => {
  const { settings } = useOrganizationSettings();

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

  const formatDeadlineDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const displayDeadlines = showUpcoming 
    ? deadlines.filter(d => d.status === 'pending').slice(0, 3)
    : deadlines.slice(0, 5);

  if (isLoading) {
    return (
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {title}
          </h3>
        </div>
        <div className="text-slate-600">Deadlines laden...</div>
      </div>
    );
  }

  if (displayDeadlines.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {title}
          </h3>
        </div>
        <div className="text-slate-600">
          {showUpcoming ? "Geen komende deadlines" : "Geen deadlines gevonden"}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {title}
        </h3>
      </div>
      <div className="space-y-2">
        {displayDeadlines.map((deadline) => (
          <div key={deadline.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${getDeadlineColor(deadline.due_date)}`}>
                {formatDeadlineDateTime(deadline.due_date)}
              </p>
              <p className="font-medium text-slate-900">{deadline.title}</p>
              {deadline.description && (
                <p className="text-slate-700 line-clamp-1">{deadline.description}</p>
              )}
            </div>
            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
              {!showUpcoming && (
                <span className="text-slate-500">
                  {formatDateTime(deadline.created_at)}
                </span>
              )}
              <Badge variant="outline" className={getPriorityColor(deadline.priority)}>
                {getPriorityLabel(deadline.priority)}
              </Badge>
              <EditDeadlineDialog deadline={deadline} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
