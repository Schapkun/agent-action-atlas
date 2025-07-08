
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UPDATE_TYPE_LABELS } from '@/types/dossierStatusUpdates';

interface ManageUpdateTypesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ManageUpdateTypesDialog = ({ open, onOpenChange }: ManageUpdateTypesDialogProps) => {
  const { toast } = useToast();
  const [newTypeName, setNewTypeName] = useState('');
  
  // Combine all types into one list - start with standard types converted to the same format
  const [allUpdateTypes, setAllUpdateTypes] = useState<Array<{ key: string; label: string }>>([
    ...Object.entries(UPDATE_TYPE_LABELS).map(([key, label]) => ({ key, label })),
    { key: 'custom_type_1', label: 'Aangepast Type 1' },
    { key: 'custom_type_2', label: 'Aangepast Type 2' }
  ]);

  // Auto-generate label from name
  const generateLabel = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const handleAddType = () => {
    if (!newTypeName.trim()) {
      toast({
        title: "Fout",
        description: "Vul de naam in",
        variant: "destructive"
      });
      return;
    }

    const generatedLabel = generateLabel(newTypeName);
    const newType = {
      key: `custom_${newTypeName.toLowerCase().replace(/\s+/g, '_')}`,
      label: generatedLabel
    };

    setAllUpdateTypes(prev => [...prev, newType]);
    setNewTypeName('');
    
    toast({
      title: "Succes",
      description: `Update type "${generatedLabel}" toegevoegd`
    });
  };

  const handleRemoveType = (keyToRemove: string) => {
    setAllUpdateTypes(prev => prev.filter(type => type.key !== keyToRemove));
    toast({
      title: "Verwijderd",
      description: "Update type verwijderd"
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Update Types Beheren
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add new type */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Nieuw Update Type Toevoegen</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="type_name" className="text-sm font-medium text-slate-700">
                  Naam
                </Label>
                <Input
                  id="type_name"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="bijv. vergunning aanvraag"
                  className="text-sm"
                />
                {newTypeName && (
                  <p className="text-xs text-slate-500 mt-1">
                    Label wordt: "{generateLabel(newTypeName)}"
                  </p>
                )}
              </div>
            </div>
            <Button 
              onClick={handleAddType}
              size="sm" 
              className="w-full"
              disabled={!newTypeName.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Type Toevoegen
            </Button>
          </div>

          {/* All update types */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Alle Update Types</h3>
            {allUpdateTypes.length === 0 ? (
              <p className="text-sm text-slate-600">Geen update types gevonden</p>
            ) : (
              <div className="space-y-2">
                {allUpdateTypes.map((type, index) => (
                  <div key={type.key} className={`flex items-center justify-between p-3 rounded-lg border ${
                    Object.keys(UPDATE_TYPE_LABELS).includes(type.key) 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <p className="font-medium text-slate-900">{type.label}</p>
                      <p className="text-xs text-slate-600">{type.key}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveType(type.key)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
