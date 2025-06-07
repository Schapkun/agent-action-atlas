
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HistoryLogCard } from './HistoryLogCard';

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

interface HistoryLogsListProps {
  logs: HistoryLog[];
}

export const HistoryLogsList = ({ logs }: HistoryLogsListProps) => {
  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Geen geschiedenis gevonden
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <HistoryLogCard key={log.id} log={log} />
      ))}
    </div>
  );
};
