
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatLogDetails } from './utils/logDetailsFormatter';
import { HistoryLogHeader } from './components/HistoryLogHeader';
import { HistoryLogDetails } from './components/HistoryLogDetails';
import { HistoryLogContext } from './components/HistoryLogContext';

interface HistoryLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_id: string;
  organization_id?: string;
  workspace_id?: string;
  user_name?: string;
  user_email?: string;
  organization_name?: string;
  workspace_name?: string;
}

interface HistoryLogCardProps {
  log: HistoryLog;
}

export const HistoryLogCard = ({ log }: HistoryLogCardProps) => {
  const formattedDetails = formatLogDetails(log.details, log.action);

  return (
    <Card>
      <CardHeader>
        <HistoryLogHeader
          action={log.action}
          userName={log.user_name || ''}
          userEmail={log.user_email || ''}
          createdAt={log.created_at}
        />
      </CardHeader>
      <CardContent>
        <HistoryLogDetails formattedDetails={formattedDetails} />
        <HistoryLogContext
          organizationName={log.organization_name}
          workspaceName={log.workspace_name}
        />
      </CardContent>
    </Card>
  );
};
