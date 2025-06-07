
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

const formatLogDetails = (details: any, action: string) => {
  if (!details) return null;

  // Handle different types of actions
  if (action.toLowerCase().includes('uitnodiging')) {
    if (details.invitation_ids && Array.isArray(details.invitation_ids)) {
      return `${details.invitation_ids.length} uitnodiging(en) verstuurd`;
    }
    if (details.email) {
      return `Uitnodiging verstuurd naar: ${details.email}`;
    }
    return 'Uitnodiging verwerkt';
  }

  if (action.toLowerCase().includes('gebruiker')) {
    if (details.user_email) {
      return `Gebruiker: ${details.user_email}`;
    }
    if (details.user_name) {
      return `Gebruiker: ${details.user_name}`;
    }
  }

  if (action.toLowerCase().includes('organisatie')) {
    if (details.organization_name) {
      return `Organisatie: ${details.organization_name}`;
    }
  }

  if (action.toLowerCase().includes('werkruimte')) {
    if (details.workspace_name) {
      return `Werkruimte: ${details.workspace_name}`;
    }
  }

  if (action.toLowerCase().includes('document')) {
    if (details.document_name) {
      return `Document: ${details.document_name}`;
    }
    if (details.file_name) {
      return `Bestand: ${details.file_name}`;
    }
  }

  if (action.toLowerCase().includes('login') || action.toLowerCase().includes('ingelogd')) {
    return 'Gebruiker heeft ingelogd';
  }

  if (action.toLowerCase().includes('logout') || action.toLowerCase().includes('uitgelogd')) {
    return 'Gebruiker heeft uitgelogd';
  }

  // If we have an object with meaningful keys, try to extract useful info
  if (typeof details === 'object') {
    const keys = Object.keys(details);
    
    // Look for common meaningful fields
    if (details.name) return `Naam: ${details.name}`;
    if (details.title) return `Titel: ${details.title}`;
    if (details.email) return `E-mail: ${details.email}`;
    if (details.role) return `Rol: ${details.role}`;
    
    // If it's just IDs or technical data, show a generic message
    if (keys.every(key => key.includes('_id') || key.includes('id'))) {
      return 'Systeem actie uitgevoerd';
    }
  }

  return null;
};

export const HistoryLogCard = ({ log }: HistoryLogCardProps) => {
  const formattedDetails = formatLogDetails(log.details, log.action);

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
      {formattedDetails && (
        <CardContent>
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm">{formattedDetails}</p>
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
