
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Calendar } from 'lucide-react';

interface Deadline {
  id: string;
  title: string;
  description: string;
  due_date: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface MultipleDeadlinesDialogProps {
  children: React.ReactNode;
  onDeadlinesAdd: (deadlines: Deadline[]) => void;
}

export const MultipleDeadlinesDialog = ({ children, onDeadlinesAdd }: MultipleDeadlinesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [deadlines, setDeadlines] = useState<Deadline[]>([
    {
      id: '1',
      title: '',
      description: '',
      due_date: '',
      priority: 'medium'
    }
  ]);

  const addDeadline = () => {
    const newDeadline: Deadline = {
      id: Date.now().toString(),
      title: '',
      description: '',
      due_date: '',
      priority: 'medium'
    };
    setDeadlines([...deadlines, newDeadline]);
  };

  const removeDeadline = (id: string) => {
    if (deadlines.length > 1) {
      setDeadlines(deadlines.filter(d => d.id !== id));
    }
  };

  const updateDeadline = (id: string, field: keyof Deadline, value: string) => {
    setDeadlines(deadlines.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const handleSave = () => {
    const validDeadlines = deadlines.filter(d => d.title.trim() && d.due_date);
    if (validDeadlines.length > 0) {
      onDeadlinesAdd(validDeadlines);
      setOpen(false);
      // Reset deadlines
      setDeadlines([{
        id: '1',
        title: '',
        description: '',
        due_date: '',
        priority: 'medium'
      }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Meerdere Deadlines Toevoegen
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {deadlines.map((deadline, index) => (
            <div key={deadline.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Deadline {index + 1}</h4>
                {deadlines.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDeadline(deadline.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Titel *</Label>
                  <Input
                    value={deadline.title}
                    onChange={(e) => updateDeadline(deadline.id, 'title', e.target.value)}
                    placeholder="Deadline titel..."
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <Label className="text-sm">Datum *</Label>
                  <Input
                    type="date"
                    value={deadline.due_date}
                    onChange={(e) => updateDeadline(deadline.id, 'due_date', e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm">Prioriteit</Label>
                <Select 
                  value={deadline.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'urgent') => 
                    updateDeadline(deadline.id, 'priority', value)
                  }
                >
                  <SelectTrigger className="text-sm">
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
                <Label className="text-sm">Beschrijving</Label>
                <Textarea
                  value={deadline.description}
                  onChange={(e) => updateDeadline(deadline.id, 'description', e.target.value)}
                  placeholder="Optionele beschrijving..."
                  className="text-sm"
                  rows={2}
                />
              </div>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addDeadline}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nog een deadline toevoegen
          </Button>
        </div>
        
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
            Annuleren
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Deadlines Toevoegen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
