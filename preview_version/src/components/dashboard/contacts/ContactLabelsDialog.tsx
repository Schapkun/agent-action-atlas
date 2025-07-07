
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Contact {
  id: string;
  name: string;
  labels?: Array<{ id: string; name: string; color: string; }>;
}

interface ContactLabel {
  id: string;
  name: string;
  color: string;
}

interface ContactLabelsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onLabelsUpdated: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
];

export const ContactLabelsDialog = ({ isOpen, onClose, contact, onLabelsUpdated }: ContactLabelsDialogProps) => {
  const [availableLabels, setAvailableLabels] = useState<ContactLabel[]>([]);
  const [contactLabels, setContactLabels] = useState<string[]>([]);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && contact && selectedOrganization) {
      fetchLabels();
      setContactLabels(contact.labels?.map(l => l.id) || []);
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
      setAvailableLabels(data || []);
    } catch (error) {
      console.error('Error fetching labels:', error);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !selectedOrganization) return;

    try {
      const { data, error } = await supabase
        .from('contact_labels')
        .insert({
          name: newLabelName.trim(),
          color: selectedColor,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id || null
        })
        .select()
        .single();

      if (error) throw error;

      setAvailableLabels(prev => [...prev, data]);
      setNewLabelName('');
      setSelectedColor(PRESET_COLORS[0]);
      
      toast({
        title: "Label aangemaakt",
        description: `Label "${data.name}" is succesvol aangemaakt`
      });
    } catch (error) {
      console.error('Error creating label:', error);
      toast({
        title: "Fout",
        description: "Kon label niet aanmaken",
        variant: "destructive"
      });
    }
  };

  const handleToggleLabel = async (labelId: string, checked: boolean) => {
    if (!contact) return;

    try {
      if (checked) {
        const { error } = await supabase
          .from('contact_label_assignments')
          .insert({
            contact_id: contact.id,
            label_id: labelId
          });
        if (error) throw error;
        setContactLabels(prev => [...prev, labelId]);
      } else {
        const { error } = await supabase
          .from('contact_label_assignments')
          .delete()
          .eq('contact_id', contact.id)
          .eq('label_id', labelId);
        if (error) throw error;
        setContactLabels(prev => prev.filter(id => id !== labelId));
      }
    } catch (error) {
      console.error('Error toggling label:', error);
      toast({
        title: "Fout",
        description: "Kon label niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    onLabelsUpdated();
    toast({
      title: "Labels bijgewerkt",
      description: `Labels voor ${contact?.name} zijn bijgewerkt`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Labels beheren - {contact?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Nieuw label toevoegen */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Nieuw label toevoegen</Label>
            
            <div className="flex gap-2">
              <Input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label naam"
                className="flex-1"
              />
              <Button 
                onClick={handleCreateLabel} 
                disabled={!newLabelName.trim()}
                size="sm"
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Kleur selectie */}
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Bestaande labels */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Bestaande labels</Label>
            
            {availableLabels.length === 0 ? (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Geen labels beschikbaar
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableLabels.map((label) => (
                  <div key={label.id} className="flex items-center space-x-3 p-2 rounded-lg border">
                    <Checkbox
                      checked={contactLabels.includes(label.id)}
                      onCheckedChange={(checked) => handleToggleLabel(label.id, checked as boolean)}
                    />
                    <Badge
                      style={{ backgroundColor: label.color, color: 'white' }}
                      className="border-0"
                    >
                      {label.name}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
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
