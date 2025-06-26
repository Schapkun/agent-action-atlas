
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Folder, Plus, Building2, Calendar } from 'lucide-react';
import { useDossiers } from '@/hooks/useDossiers';
import { EnhancedCreateDossierDialog } from '@/components/dossiers/EnhancedCreateDossierDialog';
import { DossierDetailDialog } from '@/components/dossiers/DossierDetailDialog';

export const ActiveDossiers = () => {
  const { dossiers, loading } = useDossiers();

  const activeDossiers = dossiers.filter(dossier => dossier.status === 'active');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Actieve Dossiers</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mx-auto"></div>
          <p className="text-slate-600 mt-2">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-slate-800 rounded-lg p-2">
            <Folder className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Actieve Dossiers</h1>
          <Badge variant="outline" className="text-sm">
            {activeDossiers.length} actief
          </Badge>
        </div>
        
        <EnhancedCreateDossierDialog />
      </div>

      {activeDossiers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Geen actieve dossiers</h3>
            <p className="text-slate-600 text-center mb-6">
              Maak je eerste dossier aan om te beginnen
            </p>
            <EnhancedCreateDossierDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Dossier
              </Button>
            </EnhancedCreateDossierDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDossiers.map((dossier) => (
            <DossierDetailDialog key={dossier.id} dossier={dossier}>
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      {dossier.name}
                    </CardTitle>
                    <div className="flex gap-1 flex-shrink-0 ml-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(dossier.status)}`}
                      >
                        {dossier.status}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(dossier.priority)}`}
                      >
                        {dossier.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dossier.description && (
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {dossier.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {(dossier.client_name || dossier.client) && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4 text-slate-400" />
                        <span>{dossier.client_name || dossier.client?.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <span>
                        {new Date(dossier.created_at).toLocaleDateString('nl-NL')}
                      </span>
                    </div>
                  </div>
                  
                  {dossier.category && (
                    <Badge variant="outline" className="text-xs">
                      {dossier.category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            </DossierDetailDialog>
          ))}
        </div>
      )}
    </div>
  );
};
