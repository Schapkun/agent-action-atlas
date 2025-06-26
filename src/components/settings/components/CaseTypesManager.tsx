
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { useCaseTypes } from '@/hooks/useCaseTypes';

export const CaseTypesManager = () => {
  const { caseTypes, loading } = useCaseTypes();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Zaaktypen</h3>
          <p className="text-sm text-slate-600">Beheer de beschikbare zaaktypen voor juridische procedures</p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nieuw Zaaktype
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {caseTypes.map((caseType) => (
          <div key={caseType.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-slate-900">{caseType.name}</h4>
              
              <div className="flex gap-1">
                <Button variant="ghost" size="sm">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {caseType.description && (
              <p className="text-sm text-slate-600">{caseType.description}</p>
            )}
            
            <Badge variant={caseType.is_active ? "default" : "secondary"}>
              {caseType.is_active ? 'Actief' : 'Inactief'}
            </Badge>
          </div>
        ))}
      </div>

      {caseTypes.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-slate-500">Geen zaaktypen gevonden.</p>
        </div>
      )}
    </div>
  );
};
