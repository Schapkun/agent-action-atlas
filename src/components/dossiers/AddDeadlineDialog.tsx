
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus } from 'lucide-react';
import { useCreateDeadline, CreateDeadlineData } from '@/hooks/useDossierDeadlines';
import { useToast } from '@/hooks/use-toast';

interface AddDeadlineDialogProps {
  dossierId: string;
  clientName?: string;
  children?: React.ReactNode;
}

export const AddDeadlineDialog = ({ dossierId, clientName, children }: AddDeadlineDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const createDeadline = useCreateDeadline();

  const [formData, setFormData] = useState<CreateDeadlineData>({
    dossier_id: dossierId,
    title: '',
    description: '',
    due_date: '',
    priority: 'medium'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.due_date) return;

    try {
      await createDeadline.mutateAsync(formData);
      
      // Reset form
      setFormData({
        dossier_id: dossierId,
        title: '',
        description: '',
        due_date: '',
        priority: 'medium'
      });
      
      setOpen(false);
      toast({
        title: "Deadline toegevoegd",
        description: "De deadline is succesvol opgeslagen."
      });
    } catch (error) {
      console.error('Error adding deadline:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan van de deadline.",
        variant: "destructive"
      });
    }
  };

  const updateFormData = (updates: Partial<CreateDeadlineData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Deadline
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Deadline Toevoegen
          </DialogTitle>
          {clientName && (
            <p className="text-sm text-slate-600">
              Voor client: <span className="font-medium">{clientName}</span>
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-slate-700 mb-2 block">
              Deadline Titel *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              placeholder="Wat moet er gedaan worden?"
              required
              className="text-sm"
            />
          </div>

          <div>
            <Label htmlFor="due_date" className="text-sm font-medium text-slate-700 mb-2 block">
              Datum *
            </Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => updateFormData({ due_date: e.target.value })}
              required
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
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Laag</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>Normaal</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Hoog</span>
                  </div>
                </SelectItem>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Urgent</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-slate-700 mb-2 block">
              Beschrijving
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
              placeholder="Aanvullende details..."
              rows={3}
              className="text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={createDeadline.isPending}
            >
              Annuleren
            </Button>
            <Button 
              type="submit" 
              disabled={createDeadline.isPending || !formData.title.trim() || !formData.due_date}
              className="bg-slate-800 hover:bg-slate-700"
            >
              {createDeadline.isPending ? 'Toevoegen...' : 'Deadline Toevoegen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
