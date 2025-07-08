
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DialogTitle } from '@/components/ui/dialog';
import { Scale, Plus } from 'lucide-react';
import { AddStatusUpdateDialog } from './AddStatusUpdateDialog';
import { AddDeadlineDialog } from './AddDeadlineDialog';

interface DossierDetailHeaderProps {
  dossier: {
    id: string;
    name: string;
    status: string;
    priority?: string;
    category?: string;
    client_name?: string;
    client?: {
      id?: string;
      name: string;
    };
  };
}

export const DossierDetailHeader = ({ dossier }: DossierDetailHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'pending': return 'In Behandeling';
      case 'completed': return 'Voltooid';
      case 'cancelled': return 'Geannuleerd';
      default: return status;
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

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="bg-slate-800 rounded-lg p-2">
          <Scale className="h-4 w-4 text-white" />
        </div>
        <div>
          <DialogTitle className="font-semibold text-slate-900">{dossier.name}</DialogTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={getStatusColor(dossier.status)}>
              {getStatusLabel(dossier.status)}
            </Badge>
            {dossier.priority && (
              <Badge variant="outline" className={getPriorityColor(dossier.priority)}>
                {getPriorityLabel(dossier.priority)}
              </Badge>
            )}
            {dossier.category && (
              <Badge variant="outline" className="capitalize">
                {dossier.category}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <AddStatusUpdateDialog 
          dossierId={dossier.id}
          clientName={dossier.client_name || dossier.client?.name}
        >
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Activiteit
          </Button>
        </AddStatusUpdateDialog>
        <AddDeadlineDialog
          dossierId={dossier.id}
          clientName={dossier.client_name || dossier.client?.name}
        >
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Deadline
          </Button>
        </AddDeadlineDialog>
      </div>
    </div>
  );
};
