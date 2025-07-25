
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Clock, Settings } from 'lucide-react';
import { UPDATE_TYPE_LABELS, PRIORITY_LABELS, CreateStatusUpdateData, DossierStatusUpdate } from '@/types/dossierStatusUpdates';
import { ManageUpdateTypesDialog } from './ManageUpdateTypesDialog';
import { useCreateStatusUpdate } from '@/hooks/useDossierStatusUpdates';
import { useToast } from '@/hooks/use-toast';

interface AddStatusUpdateDialogProps {
  dossierId: string;
  clientName?: string;
  children?: React.ReactNode;
  editMode?: boolean;
  editActivity?: DossierStatusUpdate;
}

export const AddStatusUpdateDialog = ({ 
  dossierId, 
  clientName, 
  children, 
  editMode = false, 
  editActivity 
}: AddStatusUpdateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [manageTypesOpen, setManageTypesOpen] = useState(false);
  const { toast } = useToast();
  const createStatusUpdate = useCreateStatusUpdate();

  const getInitialFormData = (): CreateStatusUpdateData => {
    if (editMode && editActivity) {
      return {
        dossier_id: dossierId,
        update_type: editActivity.update_type,
        status_title: editActivity.status_title,
        status_description: editActivity.status_description || '',
        hours_spent: editActivity.hours_spent || 0,
        notes: editActivity.notes || '',
        priority: editActivity.priority,
        is_billable: editActivity.is_billable,
        source_type: editActivity.source_type || 'manual',
        is_ai_generated: editActivity.is_ai_generated || false
      };
    }
    
    return {
      dossier_id: dossierId,
      update_type: 'general',
      status_title: '',
      status_description: '',
      hours_spent: 0,
      notes: '',
      priority: 'medium',
      is_billable: true,
      source_type: 'manual',
      is_ai_generated: false
    };
  };

  const [formData, setFormData] = useState<CreateStatusUpdateData>(getInitialFormData());

  // Reset form when dialog opens or editActivity changes
  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData());
    }
  }, [open, editMode, editActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status_title.trim()) return;

    try {
      if (editMode) {
        // In real app, this would call update API instead of create
        console.log('Updating activity:', { id: editActivity?.id, ...formData });
        toast({
          title: "Activiteit bijgewerkt",
          description: "De activiteit is succesvol bijgewerkt."
        });
      } else {
        await createStatusUpdate.mutateAsync(formData);
        toast({
          title: "Activiteit toegevoegd",
          description: "De activiteit is succesvol opgeslagen."
        });
      }
      
      // Reset form only if not in edit mode
      if (!editMode) {
        setFormData(getInitialFormData());
      }
      
      setOpen(false);
    } catch (error) {
      console.error('Error saving activity:', error);
      toast({
        title: "Fout",
        description: `Er is een fout opgetreden bij het ${editMode ? 'bijwerken' : 'opslaan'} van de activiteit.`,
        variant: "destructive"
      });
    }
  };

  const updateFormData = (updates: Partial<CreateStatusUpdateData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const dialogTitle = editMode ? 'Activiteit Bewerken' : 'Activiteit Toevoegen';
  const submitButtonText = editMode ? 'Activiteit Bijwerken' : 'Activiteit Toevoegen';
  const loadingText = editMode ? 'Bijwerken...' : 'Toevoegen...';

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Activiteit Toevoegen
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {dialogTitle}
            </DialogTitle>
            {clientName && (
              <p className="text-sm text-slate-600">
                Voor client: <span className="font-medium">{clientName}</span>
              </p>
            )}
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="update_type" className="text-sm font-medium text-slate-700">
                  Type Activiteit
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setManageTypesOpen(true)}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
              <Select 
                value={formData.update_type} 
                onValueChange={(value: any) => updateFormData({ update_type: value })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UPDATE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status_title" className="text-sm font-medium text-slate-700 mb-2 block">
                Activiteit Titel *
              </Label>
              <Input
                id="status_title"
                value={formData.status_title}
                onChange={(e) => updateFormData({ status_title: e.target.value })}
                placeholder="Korte beschrijving van de activiteit"
                required
                className="text-sm"
              />
            </div>

            <div>
              <Label htmlFor="status_description" className="text-sm font-medium text-slate-700 mb-2 block">
                Beschrijving
              </Label>
              <Textarea
                id="status_description"
                value={formData.status_description}
                onChange={(e) => updateFormData({ status_description: e.target.value })}
                placeholder="Uitgebreide beschrijving van de voortgang..."
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours_spent" className="text-sm font-medium text-slate-700 mb-2 block">
                  Bestede Uren
                </Label>
                <Input
                  id="hours_spent"
                  type="number"
                  step="0.25"
                  min="0"
                  value={formData.hours_spent}
                  onChange={(e) => updateFormData({ hours_spent: parseFloat(e.target.value) || 0 })}
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="priority" className="text-sm font-medium text-slate-700 mb-2 block">
                  Prioriteit
                </Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: any) => updateFormData({ priority: value })}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            value === 'low' ? 'bg-green-500' :
                            value === 'medium' ? 'bg-yellow-500' :
                            value === 'high' ? 'bg-orange-500' : 'bg-red-500'
                          }`}></div>
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm font-medium text-slate-700 mb-2 block">
                Notities
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData({ notes: e.target.value })}
                placeholder="Aanvullende notities..."
                rows={2}
                className="text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_billable"
                checked={formData.is_billable}
                onCheckedChange={(checked) => updateFormData({ is_billable: checked })}
              />
              <Label htmlFor="is_billable" className="text-sm font-medium text-slate-700">
                Factureerbaar
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={createStatusUpdate.isPending}
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                disabled={createStatusUpdate.isPending || !formData.status_title.trim()}
                className="bg-slate-800 hover:bg-slate-700"
              >
                {createStatusUpdate.isPending ? loadingText : submitButtonText}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ManageUpdateTypesDialog 
        open={manageTypesOpen} 
        onOpenChange={setManageTypesOpen} 
      />
    </>
  );
};
