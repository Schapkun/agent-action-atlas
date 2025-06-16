import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { DocumentTemplateLabel } from '@/types/documentLabels';

interface DocumentTemplateLabelsDialogProps {
  open: boolean;
  onClose: () => void;
}

const predefinedColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export const DocumentTemplateLabelsDialog = ({ open, onClose }: DocumentTemplateLabelsDialogProps) => {
  const { labels, createLabel, updateLabel, deleteLabel, loading } = useDocumentTemplateLabels();
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(predefinedColors[0]);
  const [editingLabel, setEditingLabel] = useState<DocumentTemplateLabel | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    
    setIsCreating(true);
    try {
      await createLabel({
        name: newLabelName.trim(),
        color: newLabelColor
      });
      setNewLabelName('');
      setNewLabelColor(predefinedColors[0]);
    } catch (error) {
      console.error('Error creating label:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditLabel = (label: DocumentTemplateLabel) => {
    setEditingLabel(label);
    setEditName(label.name);
    setEditColor(label.color);
  };

  const handleSaveEdit = async () => {
    if (!editingLabel || !editName.trim()) return;
    
    try {
      await updateLabel(editingLabel.id, {
        name: editName.trim(),
        color: editColor
      });
      setEditingLabel(null);
      setEditName('');
      setEditColor('');
    } catch (error) {
      console.error('Error updating label:', error);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (!window.confirm('Weet je zeker dat je dit label wilt verwijderen?')) return;
    
    try {
      await deleteLabel(labelId);
    } catch (error) {
      console.error('Error deleting label:', error);
    }
  };

  const handleClose = () => {
    setEditingLabel(null);
    setEditName('');
    setEditColor('');
    setNewLabelName('');
    setNewLabelColor(predefinedColors[0]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Label beheren</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create new label section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium mb-3">Nieuw label aanmaken</h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="new-label-name">Label naam</Label>
                <Input
                  id="new-label-name"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Voer label naam in..."
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateLabel()}
                />
              </div>
              
              <div>
                <Label>Kleur kiezen</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newLabelColor === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewLabelColor(color)}
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
                {isCreating ? 'Aanmaken...' : 'Label aanmaken'}
              </Button>
            </div>
          </div>

          {/* Existing labels section */}
          <div>
            <h4 className="font-medium mb-3">Bestaande labels ({labels.length})</h4>
            
            {loading ? (
              <div className="text-center py-4 text-gray-500">Laden...</div>
            ) : labels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nog geen labels aangemaakt
              </div>
            ) : (
              <div className="space-y-2">
                {labels.map((label) => (
                  <div key={label.id} className="flex items-center justify-between p-3 border rounded-lg">
                    {editingLabel?.id === label.id ? (
                      <div className="flex-1 flex items-center gap-3">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                        />
                        <div className="flex gap-1">
                          {predefinedColors.map((color) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-full border ${
                                editColor === color ? 'border-gray-800' : 'border-gray-300'
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => setEditColor(color)}
                            />
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" onClick={handleSaveEdit}>
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingLabel(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <Badge
                            style={{ 
                              backgroundColor: label.color, 
                              color: 'white',
                              border: 'none'
                            }}
                          >
                            {label.name}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Aangemaakt: {new Date(label.created_at).toLocaleDateString('nl-NL')}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditLabel(label)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteLabel(label.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
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

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={handleClose}>
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
