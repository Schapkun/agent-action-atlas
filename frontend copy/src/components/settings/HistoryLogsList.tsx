
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { HistoryLogCard } from './HistoryLogCard';
import { HistoryLog } from './types/HistoryLog';

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
