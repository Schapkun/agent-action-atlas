
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const InternalNotes = () => {
  const { toast } = useToast();

  const handleEditNotes = () => {
    toast({
      title: "Notities bewerken",
      description: "Notities bewerk functionaliteit wordt binnenkort toegevoegd.",
    });
  };

  // Mock data - in real app this would come from API
  const mockInternalNotes = 'Cliënt wacht nog op aangepaste conceptovereenkomst';

  return (
    <div className="bg-slate-50 rounded-lg p-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-slate-900">Interne Notities</h3>
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-slate-600 hover:text-blue-600" onClick={handleEditNotes}>
          <Edit className="h-3 w-3" />
        </Button>
      </div>
      <p className="text-xs text-slate-700">{mockInternalNotes}</p>
    </div>
  );
};
