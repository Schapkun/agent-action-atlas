import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useToast } from '@/hooks/use-toast';

interface ContactLabel {
  id: string;
  name: string;
  color: string;
}

interface Contact {
  id: string;
  name: string;
}

interface ContactLabelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onLabelsUpdated?: () => void;
}

const predefinedColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export const ContactLabelsDialog = ({ isOpen, onClose, contact, onLabelsUpdated }: ContactLabelsDialogProps) => {
  const [allLabels, setAllLabels] = useState<ContactLabel[]>([]);
  const [contactLabels, setContactLabels] = useState<Set<string>>(new Set());
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && contact && selectedOrganization) {
      fetchLabels();
      fetchContactLabels();
    }
  }, [isOpen, contact, selectedOrganization, selectedWorkspace]);

  const fetchLabels = async () => {
    if (!selectedOrganization) return;

    try {
      let query = supabase
        .from('contact_labels')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('name');

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAllLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const fetchContactLabels = async () => {
    if (!contact) return;

    try {
      const { data, error } = await supabase
        .from('contact_label_assignments')
        .select('label_id')
        .eq('contact_id', contact.id);

      if (error) throw error;
      setContactLabels(new Set(data?.map(item => item.label_id) || []));
    } catch (error) {
      console.error('Error fetching contact labels:', error);
    }
  };

  const createLabel = async () => {
    if (!newLabelName.trim() || !selectedOrganization) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_labels')
        .insert([{
          name: newLabelName.trim(),
          color: selectedColor,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id
        }])
        .select()
        .single();

      if (error) throw error;

      setAllLabels(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewLabelName('');
      setSelectedColor(predefinedColors[0]);
      
      toast({
        title: "Label toegevoegd",
        description: `Label "${data.name}" is succesvol toegevoegd`
      });
    } catch (error) {
      console.error('Error creating label:', error);
      toast({
        title: "Fout",
        description: "Label kon niet worden toegevoegd",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLabel = async (labelId: string) => {
    if (!contact) return;

    const isAssigned = contactLabels.has(labelId);
    
    try {
      if (isAssigned) {
        await supabase
          .from('contact_label_assignments')
          .delete()
          .eq('contact_id', contact.id)
          .eq('label_id', labelId);

        setContactLabels(prev => {
          const newSet = new Set(prev);
          newSet.delete(labelId);
          return newSet;
        });
      } else {
        await supabase
          .from('contact_label_assignments')
          .insert([{
            contact_id: contact.id,
            label_id: labelId
          }]);

        setContactLabels(prev => new Set([...prev, labelId]));
      }
    } catch (error) {
      console.error('Error toggling label:', error);
      toast({
        title: "Fout",
        description: "Label kon niet worden toegevoegd/verwijderd",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    onLabelsUpdated?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Labels beheren - {contact?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Create new label */}
          <div className="space-y-2">
            <Label>Nieuw label toevoegen</Label>
            <div className="flex gap-2">
              <Input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label naam"
                onKeyDown={(e) => e.key === 'Enter' && createLabel()}
              />
              <Button 
                size="sm" 
                onClick={createLabel} 
                disabled={!newLabelName.trim() || loading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Color selection */}
            <div className="flex gap-1">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>

          {/* Existing labels */}
          <div className="space-y-2">
            <Label>Bestaande labels</Label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allLabels.length === 0 ? (
                <div className="text-sm text-muted-foreground">Geen labels beschikbaar</div>
              ) : (
                allLabels.map((label) => (
                  <div key={label.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={contactLabels.has(label.id)}
                      onCheckedChange={() => toggleLabel(label.id)}
                    />
                    <Badge 
                      style={{ backgroundColor: label.color, color: 'white' }}
                      className="border-0"
                    >
                      {label.name}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <Button onClick={handleSave}>
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
