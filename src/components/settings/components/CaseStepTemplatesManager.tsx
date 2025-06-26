
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Clock } from 'lucide-react';

export const CaseStepTemplatesManager = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Procedure Templates</h3>
          <p className="text-sm text-slate-600">Beheer de standaard procedure stappen per zaaktype</p>
        </div>
        
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Template
        </Button>
      </div>

      <div className="text-center py-8">
        <p className="text-slate-500">Procedure templates beheer komt binnenkort beschikbaar.</p>
      </div>
    </div>
  );
};
