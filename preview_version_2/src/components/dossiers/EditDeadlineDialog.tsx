
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Edit, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import { toast } from 'sonner';
import { useUpdateDeadline, useDeleteDeadline, DossierDeadline } from '@/hooks/useDossierDeadlines';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface EditDeadlineDialogProps {
  deadline: DossierDeadline;
  children?: React.ReactNode;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

export const EditDeadlineDialog = ({ 
  deadline, 
  children, 
  showEditButton = true, 
  showDeleteButton = true 
}: EditDeadlineDialogProps) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(deadline.title);
  const [description, setDescription] = useState(deadline.description || '');
  const [dueDate, setDueDate] = useState<Date>(new Date(deadline.due_date));
  const [dueTime, setDueTime] = useState(() => {
    const date = new Date(deadline.due_date);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  });
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>(deadline.priority);
  const [status, setStatus] = useState<'pending' | 'completed' | 'overdue'>(deadline.status);

  const updateDeadline = useUpdateDeadline();
  const deleteDeadline = useDeleteDeadline();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Titel is verplicht');
      return;
    }

    try {
      // Combine date and time
      const [hours, minutes] = dueTime.split(':');
      const dueDateWithTime = new Date(dueDate);
      dueDateWithTime.setHours(parseInt(hours), parseInt(minutes));

      await updateDeadline.mutateAsync({
        id: deadline.id,
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: dueDateWithTime.toISOString(),
        priority,
        status,
      });

      toast.success('Deadline succesvol bijgewerkt');
      setOpen(false);
    } catch (error) {
      console.error('Error updating deadline:', error);
      toast.error('Er is een fout opgetreden bij het bijwerken van de deadline');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDeadline.mutateAsync(deadline.id);
      toast.success('Deadline succesvol verwijderd');
    } catch (error) {
      console.error('Error deleting deadline:', error);
      toast.error('Er is een fout opgetreden bij het verwijderen van de deadline');
    }
  };

  return (
    <div className="flex gap-1">
      {showEditButton && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            {children || (
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 hover:text-blue-600">
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Deadline Bewerken</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vervaldatum *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(dueDate, 'PPP', { locale: nl })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => date && setDueDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="dueTime">Tijd</Label>
                  <Input
                    id="dueTime"
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prioriteit</Label>
                  <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Laag</SelectItem>
                      <SelectItem value="medium">Normaal</SelectItem>
                      <SelectItem value="high">Hoog</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(value: 'pending' | 'completed' | 'overdue') => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">In behandeling</SelectItem>
                      <SelectItem value="completed">Voltooid</SelectItem>
                      <SelectItem value="overdue">Verlopen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={updateDeadline.isPending} className="flex-1">
                  {updateDeadline.isPending ? 'Bijwerken...' : 'Bijwerken'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuleren
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {showDeleteButton && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-600 hover:text-red-600">
              <Trash2 className="h-3 w-3" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deadline verwijderen</AlertDialogTitle>
              <AlertDialogDescription>
                Weet je zeker dat je deze deadline wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuleren</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteDeadline.isPending}
              >
                {deleteDeadline.isPending ? 'Verwijderen...' : 'Verwijderen'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};
