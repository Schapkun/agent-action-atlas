
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Clock, Settings } from 'lucide-react';
import { UPDATE_TYPE_LABELS, PRIORITY_LABELS, DossierStatusUpdate } from '@/types/dossierStatusUpdates';
import { ManageUpdateTypesDialog } from './ManageUpdateTypesDialog';
import { useToast } from '@/hooks/use-toast';

interface EditActivityDialogProps {
  activity: DossierStatusUpdate;
  dossierId: string;
  children: React.ReactNode;
}

export const EditActivityDialog = ({ activity, dossierId, children }: EditActivityDialogProps) => {
  const [open, setOpen] = useState(false);
  const [manageTypesOpen, setManageTypesOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    update_type: activity.update_type,
    status_title: activity.status_title,
    status_description: activity.status_description || '',
    hours_spent: activity.hours_spent,
    notes: activity.notes || '',
    priority: activity.priority,
    is_billable: activity.is_billable
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.status_title.trim()) return;

    try {
      // In real app, this would update the activity via API
      console.log('Updating activity:', { id: activity.id, ...formData });
      
      setOpen(false);
      toast({
        title: "Activiteit bijgewerkt",
        description: "De activiteit is succesvol bijgewerkt."
      });
    } catch (error) {
      console.error('Error updating activity:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de activiteit.",
        variant: "destructive"
      });
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Activiteit Bewerken
            </DialogTitle>
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
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.status_title.trim()}
                className="bg-slate-800 hover:bg-slate-700"
              >
                Activiteit Bijwerken
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
