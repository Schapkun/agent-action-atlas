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
  const [newTypeLabel, setNewTypeLabel] = useState('');
  
  // Mock data - in real app this would come from a context or API
  const [customUpdateTypes, setCustomUpdateTypes] = useState<Array<{ key: string; label: string }>>([
    { key: 'custom_type_1', label: 'Aangepast Type 1' },
    { key: 'custom_type_2', label: 'Aangepast Type 2' }
  ]);

  // Standard types that can now be managed
  const [standardUpdateTypes, setStandardUpdateTypes] = useState<Array<{ key: string; label: string; removable: boolean }>>(
    Object.entries(UPDATE_TYPE_LABELS).map(([key, label]) => ({
      key,
      label,
      removable: true
    }))
  );

  const handleAddType = () => {
    if (!newTypeName.trim() || !newTypeLabel.trim()) {
      toast({
        title: "Fout",
        description: "Vul zowel de naam als het label in",
        variant: "destructive"
      });
      return;
    }

    const newType = {
      key: `custom_${newTypeName.toLowerCase().replace(/\s+/g, '_')}`,
      label: newTypeLabel
    };

    setCustomUpdateTypes(prev => [...prev, newType]);
    setNewTypeName('');
    setNewTypeLabel('');
    
    toast({
      title: "Succes",
      description: `Update type "${newTypeLabel}" toegevoegd`
    });
  };

  const handleRemoveCustomType = (keyToRemove: string) => {
    setCustomUpdateTypes(prev => prev.filter(type => type.key !== keyToRemove));
    toast({
      title: "Verwijderd",
      description: "Aangepast update type verwijderd"
    });
  };

  const handleRemoveStandardType = (keyToRemove: string) => {
    setStandardUpdateTypes(prev => prev.filter(type => type.key !== keyToRemove));
    toast({
      title: "Verwijderd",
      description: "Standaard update type verwijderd"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="type_name" className="text-sm font-medium text-slate-700">
                  Naam
                </Label>
                <Input
                  id="type_name"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="bijv. vergunning"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="type_label" className="text-sm font-medium text-slate-700">
                  Label
                </Label>
                <Input
                  id="type_label"
                  value={newTypeLabel}
                  onChange={(e) => setNewTypeLabel(e.target.value)}
                  placeholder="bijv. Vergunning Aanvraag"
                  className="text-sm"
                />
              </div>
            </div>
            <Button 
              onClick={handleAddType}
              size="sm" 
              className="w-full"
              disabled={!newTypeName.trim() || !newTypeLabel.trim()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Type Toevoegen
            </Button>
          </div>

          {/* Standard types */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Standaard Types</h3>
            {standardUpdateTypes.length === 0 ? (
              <p className="text-sm text-slate-600">Alle standaard types zijn verwijderd</p>
            ) : (
              <div className="space-y-2">
                {standardUpdateTypes.map((type) => (
                  <div key={type.key} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-slate-900">{type.label}</p>
                      <p className="text-xs text-slate-600">{type.key}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveStandardType(type.key)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Existing custom types */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900">Bestaande Aangepaste Types</h3>
            {customUpdateTypes.length === 0 ? (
              <p className="text-sm text-slate-600">Geen aangepaste types gevonden</p>
            ) : (
              <div className="space-y-2">
                {customUpdateTypes.map((type) => (
                  <div key={type.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{type.label}</p>
                      <p className="text-xs text-slate-600">{type.key}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveCustomType(type.key)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
