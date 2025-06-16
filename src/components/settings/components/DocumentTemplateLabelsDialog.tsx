import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';

interface DocumentTemplateLabelsDialogProps {
  open: boolean;
  onClose: () => void;
}

const COLOR_OPTIONS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
];

export const DocumentTemplateLabelsDialog = ({ open, onClose }: DocumentTemplateLabelsDialogProps) => {
  const { labels, loading, createLabel, updateLabel, deleteLabel } = useDocumentTemplateLabels();
  const [editingLabel, setEditingLabel] = useState<{ id: string; name: string; color: string } | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;

    try {
      setIsCreating(true);
      await createLabel({
        name: newLabelName.trim(),
        color: selectedColor
      });
      setNewLabelName('');
      setSelectedColor(COLOR_OPTIONS[0]);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel || !editingLabel.name.trim()) return;

    try {
      await updateLabel(editingLabel.id, {
        name: editingLabel.name.trim(),
        color: editingLabel.color
      });
      setEditingLabel(null);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleDeleteLabel = async (id: string) => {
    if (window.confirm('Weet je zeker dat je dit label wilt verwijderen?')) {
      try {
        await deleteLabel(id);
      } catch (error) {
        // Error is handled in the hook
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Document Template Labels Beheren</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create new label */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-medium">Nieuw Label Aanmaken</h3>
            <div className="space-y-3">
              <Input
                placeholder="Label naam..."
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
              />
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Kleur:</span>
                <div className="flex gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreateLabel}
                disabled={!newLabelName.trim() || isCreating}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Aanmaken...' : 'Label Aanmaken'}
              </Button>
            </div>
          </div>

          {/* Existing labels */}
          <div className="space-y-4">
            <h3 className="font-medium">Bestaande Labels</h3>
            
            {loading ? (
              <div className="text-center py-4">Labels laden...</div>
            ) : labels.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                Nog geen labels aangemaakt
              </div>
            ) : (
              <div className="space-y-2">
                {labels.map((label) => (
                  <div key={label.id} className="flex items-center justify-between p-3 border rounded-lg">
                    {editingLabel?.id === label.id ? (
                      <div className="flex-1 space-y-3">
                        <Input
                          value={editingLabel.name}
                          onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateLabel()}
                        />
                        
                        <div className="flex gap-2">
                          {COLOR_OPTIONS.map((color) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border-2 ${
                                editingLabel.color === color ? 'border-gray-400' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditingLabel({ ...editingLabel, color })}
                            />
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleUpdateLabel}>
                            Opslaan
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingLabel(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            style={{ 
                              backgroundColor: label.color, 
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            {label.name}
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingLabel({ 
                              id: label.id, 
                              name: label.name, 
                              color: label.color 
                            })}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteLabel(label.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
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
