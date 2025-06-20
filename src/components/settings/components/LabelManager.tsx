
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Tags } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

interface LabelFormProps {
  initialName?: string;
  initialColor?: string;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const LabelForm = ({ initialName = '', initialColor = '#3B82F6', onSave, onCancel, isEditing = false }: LabelFormProps) => {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), color);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Label naam</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Voer label naam in"
          required
        />
      </div>
      
      <div>
        <Label>Kleur</Label>
        <div className="flex gap-2 mt-2">
          {PRESET_COLORS.map(presetColor => (
            <button
              key={presetColor}
              type="button"
              className={`w-8 h-8 rounded-full border-2 ${color === presetColor ? 'border-gray-800' : 'border-gray-300'}`}
              style={{ backgroundColor: presetColor }}
              onClick={() => setColor(presetColor)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuleren
        </Button>
        <Button type="submit">
          {isEditing ? 'Bijwerken' : 'Aanmaken'}
        </Button>
      </div>
    </form>
  );
};

export const LabelManager = () => {
  const { labels, loading, createLabel, updateLabel, deleteLabel } = useDocumentTemplateLabels();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<any>(null);

  const handleCreate = async (name: string, color: string) => {
    try {
      await createLabel(name, color);
      setIsCreateOpen(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleUpdate = async (name: string, color: string) => {
    if (editingLabel) {
      try {
        await updateLabel(editingLabel.id, { name, color });
        setEditingLabel(null);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Weet je zeker dat je dit label wilt verwijderen?')) {
      try {
        await deleteLabel(id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  if (loading) {
    return <div>Labels laden...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tags className="h-5 w-5" />
          <h3 className="text-lg font-medium">Template Labels</h3>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nieuw Label
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nieuw Label Aanmaken</DialogTitle>
            </DialogHeader>
            <LabelForm
              onSave={handleCreate}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {labels.map(label => (
          <div key={label.id} className="flex items-center justify-between p-3 border rounded-lg">
            <Badge style={{ backgroundColor: label.color, color: 'white' }}>
              {label.name}
            </Badge>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingLabel(label)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(label.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {labels.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nog geen labels aangemaakt</p>
          <p className="text-sm">Maak je eerste label aan om te beginnen</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingLabel} onOpenChange={() => setEditingLabel(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Label Bewerken</DialogTitle>
          </DialogHeader>
          {editingLabel && (
            <LabelForm
              initialName={editingLabel.name}
              initialColor={editingLabel.color}
              onSave={handleUpdate}
              onCancel={() => setEditingLabel(null)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
