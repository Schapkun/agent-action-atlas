
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2 } from 'lucide-react';
import { useDocumentTemplateLabels } from '@/hooks/useDocumentTemplateLabels';
import { useDocumentTemplatesWithLabels } from '@/hooks/useDocumentTemplatesWithLabels';
import { DocumentTemplateWithLabels, DocumentTemplateLabel } from '@/types/documentTemplateLabels';

const PRESET_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

interface LabelManagementDialogProps {
  open: boolean;
  onClose: () => void;
  template: DocumentTemplateWithLabels;
}

export const LabelManagementDialog = ({ open, onClose, template }: LabelManagementDialogProps) => {
  const { labels, createLabel, updateLabel } = useDocumentTemplateLabels();
  const { assignLabelToTemplate, removeLabelFromTemplate } = useDocumentTemplatesWithLabels();
  
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [editingLabel, setEditingLabel] = useState<DocumentTemplateLabel | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#3B82F6');

  const templateLabelIds = template.labels?.map(label => label.id) || [];

  const handleLabelToggle = async (labelId: string, isChecked: boolean) => {
    try {
      if (isChecked) {
        await assignLabelToTemplate(template.id, labelId);
      } else {
        await removeLabelFromTemplate(template.id, labelId);
      }
    } catch (error) {
      console.error('Error toggling label:', error);
    }
  };

  const handleCreateLabel = async () => {
    if (newLabelName.trim()) {
      try {
        await createLabel(newLabelName.trim(), newLabelColor);
        setNewLabelName('');
        setNewLabelColor('#3B82F6');
        setIsCreatingLabel(false);
      } catch (error) {
        console.error('Error creating label:', error);
      }
    }
  };

  const handleUpdateLabel = async () => {
    if (editingLabel && newLabelName.trim()) {
      try {
        await updateLabel(editingLabel.id, { name: newLabelName.trim(), color: newLabelColor });
        setEditingLabel(null);
        setNewLabelName('');
        setNewLabelColor('#3B82F6');
      } catch (error) {
        console.error('Error updating label:', error);
      }
    }
  };

  const startEditingLabel = (label: DocumentTemplateLabel) => {
    setEditingLabel(label);
    setNewLabelName(label.name);
    setNewLabelColor(label.color);
    setIsCreatingLabel(false);
  };

  const resetForm = () => {
    setIsCreatingLabel(false);
    setEditingLabel(null);
    setNewLabelName('');
    setNewLabelColor('#3B82F6');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Labels beheren voor "{template.name}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current template labels */}
          {template.labels && template.labels.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Huidige labels:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {template.labels.map((label) => (
                  <Badge
                    key={label.id}
                    style={{ backgroundColor: label.color, color: 'white' }}
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available labels */}
          <div>
            <Label className="text-sm font-medium">Beschikbare labels:</Label>
            <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
              {labels.map((label) => (
                <div key={label.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={templateLabelIds.includes(label.id)}
                      onCheckedChange={(checked) => handleLabelToggle(label.id, checked as boolean)}
                    />
                    <Badge style={{ backgroundColor: label.color, color: 'white' }}>
                      {label.name}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditingLabel(label)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Create/Edit label form */}
          {(isCreatingLabel || editingLabel) && (
            <div className="border-t pt-4 space-y-3">
              <Label className="text-sm font-medium">
                {editingLabel ? 'Label bewerken' : 'Nieuw label'}
              </Label>
              <Input
                placeholder="Label naam"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
              />
              <div>
                <Label className="text-sm">Kleur</Label>
                <div className="flex gap-2 mt-2">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${newLabelColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewLabelColor(color)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={editingLabel ? handleUpdateLabel : handleCreateLabel}>
                  {editingLabel ? 'Bijwerken' : 'Aanmaken'}
                </Button>
                <Button size="sm" variant="outline" onClick={resetForm}>
                  Annuleren
                </Button>
              </div>
            </div>
          )}

          {/* Add new label button */}
          {!isCreatingLabel && !editingLabel && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreatingLabel(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nieuw label aanmaken
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
