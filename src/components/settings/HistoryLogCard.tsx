
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, User, Mail } from 'lucide-react';

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

  console.log('Formatting log details:', { details, action });

  // Handle invitation actions - show the invited email
  if (action.toLowerCase().includes('uitnodiging')) {
    // Check for email in details
    if (details.email) {
      return `Uitgenodigd: ${details.email}`;
    }
    // Check for invitation_ids array
    if (details.invitation_ids && Array.isArray(details.invitation_ids)) {
      return `${details.invitation_ids.length} uitnodiging(en) verzonden`;
    }
    // Check for invited_email
    if (details.invited_email) {
      return `Uitgenodigd: ${details.invited_email}`;
    }
    // Check for user_email in invitation context
    if (details.user_email) {
      return `Uitgenodigd: ${details.user_email}`;
    }
    return 'Uitnodiging verwerkt';
  }

  // Handle user actions - show affected user
  if (action.toLowerCase().includes('gebruiker')) {
    if (details.user_email) {
      return `Betreft gebruiker: ${details.user_email}`;
    }
    if (details.user_name) {
      return `Betreft gebruiker: ${details.user_name}`;
    }
    if (details.email) {
      return `Betreft gebruiker: ${details.email}`;
    }
    // Handle role changes
    if (details.role) {
      return `Rol gewijzigd naar: gebruiker`;
    }
  }

  // Handle organization actions
  if (action.toLowerCase().includes('organisatie')) {
    if (details.organization_name) {
      return `Organisatie: ${details.organization_name}`;
    }
    if (details.name) {
      return `Organisatie: ${details.name}`;
    }
  }

  // Handle workspace actions
  if (action.toLowerCase().includes('werkruimte')) {
    if (details.workspace_name) {
      return `Werkruimte: ${details.workspace_name}`;
    }
    if (details.name) {
      return `Werkruimte: ${details.name}`;
    }
  }

  // Handle document actions
  if (action.toLowerCase().includes('document')) {
    if (details.document_name) {
      return `Document: ${details.document_name}`;
    }
    if (details.file_name) {
      return `Bestand: ${details.file_name}`;
    }
    if (details.name) {
      return `Document: ${details.name}`;
    }
  }

  // Handle login/logout
  if (action.toLowerCase().includes('login') || action.toLowerCase().includes('ingelogd')) {
    return 'Gebruiker heeft ingelogd';
  }

  if (action.toLowerCase().includes('logout') || action.toLowerCase().includes('uitgelogd')) {
    return 'Gebruiker heeft uitgelogd';
  }

  // Handle profile updates
  if (action.toLowerCase().includes('profiel')) {
    if (details.email) {
      return `Profiel bijgewerkt voor: ${details.email}`;
    }
    return 'Profiel bijgewerkt';
  }

  // Generic handling for objects with meaningful data
  if (typeof details === 'object' && details !== null) {
    const keys = Object.keys(details);
    
    // Look for email addresses first (most important for invitations)
    if (details.email) return `E-mail: ${details.email}`;
    if (details.invited_email) return `Uitgenodigd: ${details.invited_email}`;
    if (details.user_email) return `Betreft: ${details.user_email}`;
    
    // Look for other meaningful fields
    if (details.name) return `Naam: ${details.name}`;
    if (details.title) return `Titel: ${details.title}`;
    if (details.role) {
      return `Rol: gebruiker`;
    }
    
    // If it's just IDs or technical data, show a generic message
    if (keys.length > 0 && keys.every(key => key.includes('_id') || key.includes('id'))) {
      return 'Systeem actie uitgevoerd';
    }

    // If we have any meaningful content, try to show something useful
    if (keys.length > 0) {
      // Look for any field that might contain useful information
      for (const key of keys) {
        if (details[key] && typeof details[key] === 'string' && !key.includes('id')) {
          return `${key}: ${details[key]}`;
        }
      }
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
                  <span>Door: {log.user_name || log.user_email}</span>
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
            <div className="flex items-start space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm">{formattedDetails}</p>
            </div>
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
