
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Edit, Trash2 } from 'lucide-react';
import { useUpdateDeadline, useDeleteDeadline, DossierDeadline } from '@/hooks/useDossierDeadlines';
import { useToast } from '@/hooks/use-toast';

interface EditDeadlineDialogProps {
  deadline: DossierDeadline;
  children?: React.ReactNode;
}

export const EditDeadlineDialog = ({ deadline, children }: EditDeadlineDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const updateDeadline = useUpdateDeadline();
  const deleteDeadline = useDeleteDeadline();

  const [formData, setFormData] = useState({
    title: deadline.title,
    description: deadline.description || '',
    due_date: deadline.due_date,
    priority: deadline.priority,
    status: deadline.status
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.due_date) return;

    try {
      await updateDeadline.mutateAsync({
        id: deadline.id,
        ...formData
      });
      
      setOpen(false);
      toast({
        title: "Deadline bijgewerkt",
        description: "De deadline is succesvol bijgewerkt."
      });
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het bijwerken van de deadline.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je deze deadline wilt verwijderen?')) return;

    try {
      await deleteDeadline.mutateAsync(deadline.id);
      setOpen(false);
      toast({
        title: "Deadline verwijderd",
        description: "De deadline is succesvol verwijderd."
      });
    } catch (error) {
      console.error('Error deleting deadline:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verwijderen van de deadline.",
        variant: "destructive"
      });
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Bewerken
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Deadline Bewerken
          </DialogTitle>
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
            <Label htmlFor="status" className="text-sm font-medium text-slate-700 mb-2 block">
              Status
            </Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: any) => updateFormData({ status: value })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span>In behandeling</span>
                  </div>
                </SelectItem>
                <SelectItem value="completed">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Voltooid</span>
                  </div>
                </SelectItem>
                <SelectItem value="overdue">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Verlopen</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleteDeadline.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteDeadline.isPending ? 'Verwijderen...' : 'Verwijderen'}
            </Button>
            
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={updateDeadline.isPending}
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                disabled={updateDeadline.isPending || !formData.title.trim() || !formData.due_date}
                className="bg-slate-800 hover:bg-slate-700"
              >
                {updateDeadline.isPending ? 'Opslaan...' : 'Opslaan'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
