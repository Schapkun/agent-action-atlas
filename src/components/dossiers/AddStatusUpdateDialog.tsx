
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Clock, Settings } from 'lucide-react';
import { UPDATE_TYPE_LABELS, PRIORITY_LABELS, CreateStatusUpdateData } from '@/types/dossierStatusUpdates';
import { ManageUpdateTypesDialog } from './ManageUpdateTypesDialog';
import { useCreateStatusUpdate } from '@/hooks/useDossierStatusUpdates';
import { useToast } from '@/hooks/use-toast';

interface AddStatusUpdateDialogProps {
  dossierId: string;
  clientName?: string;
  children?: React.ReactNode;
}

export const AddStatusUpdateDialog = ({ dossierId, clientName, children }: AddStatusUpdateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [manageTypesOpen, setManageTypesOpen] = useState(false);
  const { toast } = useToast();
  const createStatusUpdate = useCreateStatusUpdate();

  const [formData, setFormData] = useState<CreateStatusUpdateData>({
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
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status_title.trim()) return;

    try {
      await createStatusUpdate.mutateAsync(formData);
      
      // Reset form
      setFormData({
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
      });
      
      setOpen(false);
      toast({
        title: "Status update toegevoegd",
        description: "De status update is succesvol opgeslagen."
      });
    } catch (error) {
      console.error('Error adding status update:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan van de status update.",
        variant: "destructive"
      });
    }
  };

  const updateFormData = (updates: Partial<CreateStatusUpdateData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Status Update Toevoegen
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Status Update Toevoegen
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
                  Type Update
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
                Status Titel *
              </Label>
              <Input
                id="status_title"
                value={formData.status_title}
                onChange={(e) => updateFormData({ status_title: e.target.value })}
                placeholder="Korte beschrijving van de status update"
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
                {createStatusUpdate.isPending ? 'Toevoegen...' : 'Status Update Toevoegen'}
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
