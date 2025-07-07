
import React from 'react';
import { Activity, Calendar, User } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';

interface HistoryLogHeaderProps {
  action: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export const HistoryLogHeader = ({ action, userName, userEmail, createdAt }: HistoryLogHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <Activity className="h-5 w-5 text-primary" />
        <div>
          <CardTitle className="text-lg">{action}</CardTitle>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Door: {userName || userEmail}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(createdAt).toLocaleString('nl-NL')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
