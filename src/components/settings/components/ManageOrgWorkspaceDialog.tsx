import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Edit, Trash2, Plus, Users } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
}

interface ManageOrgWorkspaceDialogProps {
  type: 'organization' | 'workspace';
  item?: Organization | Workspace | null;
  trigger: React.ReactNode;
  onSaved: () => void;
}

export const ManageOrgWorkspaceDialog = ({ type, item, trigger, onSaved }: ManageOrgWorkspaceDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item?.name || '');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const { organizations } = useOrganization();
  const { toast } = useToast();
  const { refreshData } = useOrganization();

  useEffect(() => {
    if (item) {
      setName(item.name || '');
    } else {
      setName('');
    }
  }, [item]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Fout",
        description: "Naam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      if (type === 'organization') {
        if (item) {
          // Update organization
          const { error } = await supabase
            .from('organizations')
            .update({ 
              name: name.trim(),
              slug: name.toLowerCase().replace(/\s+/g, '-')
            })
            .eq('id', item.id);

          if (error) throw error;
          
          toast({
            title: "Succes",
            description: "Organisatie bijgewerkt"
          });
        } else {
          // Create organization
          const { error } = await supabase
            .from('organizations')
            .insert([{ 
              name: name.trim(),
              slug: name.toLowerCase().replace(/\s+/g, '-')
            }]);

          if (error) throw error;
          
          toast({
            title: "Succes",
            description: "Organisatie aangemaakt"
          });
        }
      } else {
        if (item) {
          // Update workspace
          const { error } = await supabase
            .from('workspaces')
            .update({ 
              name: name.trim(),
              slug: name.toLowerCase().replace(/\s+/g, '-')
            })
            .eq('id', item.id);

          if (error) throw error;
          
          toast({
            title: "Succes",
            description: "Werkruimte bijgewerkt"
          });
        } else {
          // Create workspace
          if (!selectedOrganizationId) {
            toast({
              title: "Fout",
              description: "Selecteer een organisatie",
              variant: "destructive"
            });
            return;
          }

          const { error } = await supabase
            .from('workspaces')
            .insert([{ 
              name: name.trim(),
              slug: name.toLowerCase().replace(/\s+/g, '-'),
              organization_id: selectedOrganizationId
            }]);

          if (error) throw error;
          
          toast({
            title: "Succes",
            description: "Werkruimte aangemaakt"
          });
        }
      }

      // Refresh the organization context data
      await refreshData();
      
      setOpen(false);
      onSaved();
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{type === 'organization' ? (item ? 'Organisatie bewerken' : 'Organisatie aanmaken') : (item ? 'Werkruimte bewerken' : 'Werkruimte aanmaken')}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Naam
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          {type === 'workspace' && !item && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="organization" className="text-right">
                Organisatie
              </Label>
              <Select onValueChange={setSelectedOrganizationId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecteer een organisatie" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Button type="submit" onClick={handleSave} disabled={saving}>
          {saving ? 'Opslaan...' : 'Opslaan'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
