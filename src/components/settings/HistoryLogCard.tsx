
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, User } from 'lucide-react';

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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">{log.action}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{log.user_name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(log.created_at).toLocaleString('nl-NL')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      {log.details && (
        <CardContent>
          <div className="bg-muted p-3 rounded-md">
            <pre className="text-sm">{JSON.stringify(log.details, null, 2)}</pre>
          </div>
          {log.organization_name && (
            <p className="text-sm text-muted-foreground mt-2">
              Organisatie: {log.organization_name}
            </p>
          )}
          {log.workspace_name && (
            <p className="text-sm text-muted-foreground">
              Werkruimte: {log.workspace_name}
            </p>
          )}
        </CardContent>
      )}
    </Card>
  );
};
