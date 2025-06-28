import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'currency';
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

interface SectionEditorDialogProps {
  children: React.ReactNode;
  sectionName: string;
  fields: FieldDefinition[];
  onFieldsUpdate: (fields: FieldDefinition[]) => void;
}

export const SectionEditorDialog = ({ 
  children, 
  sectionName, 
  fields, 
  onFieldsUpdate 
}: SectionEditorDialogProps) => {
  const [open, setOpen] = useState(false);
  const [editingFields, setEditingFields] = useState<FieldDefinition[]>([]);
  const [newField, setNewField] = useState<Partial<FieldDefinition>>({
    type: 'text',
    required: false
  });
  const { toast } = useToast();

  React.useEffect(() => {
    if (open) {
      setEditingFields([...fields]);
    }
  }, [open, fields]);

  const handleAddField = () => {
    if (!newField.name) {
      toast({
        title: "Naam verplicht",
        description: "Voer een naam in voor het veld",
        variant: "destructive"
      });
      return;
    }

    const field: FieldDefinition = {
      id: `field_${Date.now()}`,
      name: newField.name,
      type: newField.type || 'text',
      placeholder: newField.placeholder,
      options: newField.type === 'select' ? newField.options : undefined,
      required: newField.required || false
    };

    setEditingFields([...editingFields, field]);
    setNewField({ type: 'text', required: false });
  };

  const handleRemoveField = (fieldId: string) => {
    setEditingFields(editingFields.filter(f => f.id !== fieldId));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FieldDefinition>) => {
    setEditingFields(editingFields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    ));
  };

  const handleSave = () => {
    onFieldsUpdate(editingFields);
    setOpen(false);
    toast({
      title: "Sectie bijgewerkt",
      description: `De ${sectionName} sectie is succesvol bijgewerkt`
    });
  };

  const fieldTypeOptions = [
    { value: 'text', label: 'Tekst' },
    { value: 'textarea', label: 'Grote tekst' },
    { value: 'select', label: 'Dropdown' },
    { value: 'date', label: 'Datum' },
    { value: 'number', label: 'Getal' },
    { value: 'currency', label: 'Valuta' }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bewerk {sectionName} Sectie</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-6 p-1">
          {/* Existing Fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Bestaande Velden</h3>
            {editingFields.map((field) => (
              <div key={field.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Input
                    value={field.name}
                    onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                    className="font-medium"
                    placeholder="Veldnaam"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveField(field.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Type</Label>
                    <Select 
                      value={field.type} 
                      onValueChange={(value: FieldDefinition['type']) => 
                        handleUpdateField(field.id, { type: value })
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypeOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-xs">Placeholder</Label>
                    <Input
                      value={field.placeholder || ''}
                      onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                      placeholder="Placeholder tekst"
                      className="text-sm"
                    />
                  </div>
                </div>

                {field.type === 'select' && (
                  <div>
                    <Label className="text-xs">Opties (gescheiden door komma's)</Label>
                    <Input
                      value={field.options?.join(', ') || ''}
                      onChange={(e) => handleUpdateField(field.id, { 
                        options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })}
                      placeholder="Optie 1, Optie 2, Optie 3"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add New Field */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Nieuw Veld Toevoegen</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Naam *</Label>
                  <Input
                    value={newField.name || ''}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="Veldnaam"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select 
                    value={newField.type} 
                    onValueChange={(value: FieldDefinition['type']) => 
                      setNewField({ ...newField, type: value })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-xs">Placeholder</Label>
                <Input
                  value={newField.placeholder || ''}
                  onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                  placeholder="Placeholder tekst"
                  className="text-sm"
                />
              </div>

              {newField.type === 'select' && (
                <div>
                  <Label className="text-xs">Opties (gescheiden door komma's)</Label>
                  <Input
                    value={newField.options?.join(', ') || ''}
                    onChange={(e) => setNewField({ 
                      ...newField, 
                      options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="Optie 1, Optie 2, Optie 3"
                    className="text-sm"
                  />
                </div>
              )}

              <Button onClick={handleAddField} size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Veld Toevoegen
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            <X className="h-4 w-4 mr-2" />
            Annuleren
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Opslaan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
