
import React from 'react';
import { Clock, Euro, User, AlertCircle } from 'lucide-react';
import { DossierDeadline } from '@/hooks/useDossierDeadlines';
import { useOrganizationSettings } from '@/hooks/useOrganizationSettings';

interface DossierMetricsProps {
  nextDeadline?: DossierDeadline;
}

export const DossierMetrics = ({ nextDeadline }: DossierMetricsProps) => {
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

  const formatDeadlineDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Mock data - in real app this would come from API
  const mockData = {
    hoursSpent: 14.5,
    hoursAvailable: 5.5,
    totalValue: 3500,
    hourlyRate: 175,
    assignedUser: 'Marie van der Berg'
  };

  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="bg-slate-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Uren</span>
        </div>
        <div className="text-base font-semibold text-slate-900">
          {mockData.hoursSpent}h
        </div>
        <div className="text-sm text-slate-600">
          Nog {mockData.hoursAvailable}h beschikbaar
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Euro className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Waarde</span>
        </div>
        <div className="text-base font-semibold text-slate-900">
          €{mockData.totalValue.toLocaleString()}
        </div>
        <div className="text-sm text-slate-600">
          €{mockData.hourlyRate}/uur
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-slate-600" />
          <span className="text-sm font-medium text-slate-700">Toegewezen</span>
        </div>
        <div className="text-sm font-semibold text-slate-900">
          {mockData.assignedUser}
        </div>
        <div className="text-sm text-slate-600">
          Verantwoordelijk
        </div>
      </div>

      <div className={`rounded-lg p-3 ${nextDeadline ? 'bg-orange-50' : 'bg-slate-50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className={`h-4 w-4 ${nextDeadline ? 'text-orange-600' : 'text-slate-600'}`} />
          <span className={`text-sm font-medium ${nextDeadline ? 'text-orange-700' : 'text-slate-700'}`}>Deadline</span>
        </div>
        {nextDeadline ? (
          <>
            <div className={`text-sm font-semibold ${getDeadlineColor(nextDeadline.due_date)}`}>
              {formatDeadlineDateTime(nextDeadline.due_date)}
            </div>
            <div className="text-sm text-orange-600">
              {nextDeadline.title}
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-600">
            Geen deadlines
          </div>
        )}
      </div>
    </div>
  );
};
