
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { useDossierStatusUpdates } from '@/hooks/useDossierStatusUpdates';
import { useDossierDeadlines } from '@/hooks/useDossierDeadlines';
import { DossierDetailHeader } from './DossierDetailHeader';
import { DossierMetrics } from './DossierMetrics';
import { ClientInformation } from './ClientInformation';
import { InternalNotes } from './InternalNotes';
import { DeadlinesSection } from './DeadlinesSection';
import { RecentActivities } from './RecentActivities';
import { DossierTabs } from './DossierTabs';

interface DossierDetailDialogProps {
  dossier: {
    id: string;
    name: string;
    description?: string;
    status: string;
    category?: string;
    priority?: string;
    client_name?: string;
    created_at: string;
    client?: {
      id?: string;
      name: string;
    };
  };
  children: React.ReactNode;
}

export const DossierDetailDialog = ({ dossier, children }: DossierDetailDialogProps) => {
  const [open, setOpen] = useState(false);
  const { statusUpdates, isLoading: statusLoading } = useDossierStatusUpdates(dossier.id);
  const { deadlines, isLoading: deadlinesLoading } = useDossierDeadlines(dossier.id);

  const upcomingDeadlines = deadlines.filter(d => d.status === 'pending').slice(0, 3);
  const nextDeadline = upcomingDeadlines[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DossierDetailHeader dossier={dossier} />
        </DialogHeader>
        
        <DossierTabs>
          {/* Key Metrics Grid */}
          <DossierMetrics nextDeadline={nextDeadline} />

          {/* Client Information */}
          <ClientInformation clientName={dossier.client_name || dossier.client?.name} />

          {/* Internal Notes */}
          <InternalNotes />

          {/* Deadlines */}
          <DeadlinesSection 
            deadlines={deadlines}
            isLoading={deadlinesLoading}
            showUpcoming={false}
            title="Deadlines"
          />

          {/* Recent Activities */}
          <RecentActivities 
            statusUpdates={statusUpdates}
            isLoading={statusLoading}
          />

          {/* Description */}
          {dossier.description && (
            <div className="bg-slate-50 rounded-lg p-2">
              <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Beschrijving
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">{dossier.description}</p>
            </div>
          )}
        </DossierTabs>
      </DialogContent>
    </Dialog>
  );
};
