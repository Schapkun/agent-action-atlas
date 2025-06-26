
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FolderClosed, Calendar, User, Users } from 'lucide-react';
import { useDossiers } from '@/hooks/useDossiers';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

export const ClosedDossiers = () => {
  const { closedDossiers, loading } = useDossiers();
  const { selectedMember } = useOrganization();
  const { members } = useOrganizationMembers();

  const getMemberName = (userId: string) => {
    const member = members.find(m => m.user_id === userId);
    return member?.account_name || member?.email || 'Onbekend';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderClosed className="h-5 w-5" />
            Gesloten Dossiers
            {selectedMember && (
              <Badge variant="outline" className="ml-2">
                <User className="h-3 w-3 mr-1" />
                {getMemberName(selectedMember.user_id)}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderClosed className="h-5 w-5" />
          Gesloten Dossiers
          <Badge variant="secondary">{closedDossiers.length}</Badge>
          {selectedMember && (
            <Badge variant="outline" className="ml-2">
              <User className="h-3 w-3 mr-1" />
              {getMemberName(selectedMember.user_id)}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {selectedMember 
            ? `Gesloten dossiers voor ${getMemberName(selectedMember.user_id)}`
            : 'Overzicht van alle gesloten dossiers'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {closedDossiers.length === 0 ? (
          <div className="text-center py-8">
            <FolderClosed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {selectedMember 
                ? `Geen gesloten dossiers voor ${getMemberName(selectedMember.user_id)}`
                : 'Geen gesloten dossiers gevonden'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {closedDossiers.slice(0, 5).map((dossier) => (
              <div key={dossier.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 truncate flex-1">
                    {dossier.title}
                  </h3>
                  <Badge className="bg-gray-100 text-gray-800">
                    Gesloten
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {dossier.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    {dossier.client && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{dossier.client.name}</span>
                      </div>
                    )}
                    
                    {dossier.assigned_users && dossier.assigned_users.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>
                          {dossier.assigned_users.length === 1 
                            ? getMemberName(dossier.assigned_users[0])
                            : `${dossier.assigned_users.length} medewerkers`
                          }
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Gesloten: {new Date(dossier.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {closedDossiers.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  Bekijk alle {closedDossiers.length} gesloten dossiers
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
