
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useClientsWithDossiers } from '@/hooks/useClientsWithDossiers';

interface EnhancedCreateDossierDialogProps {
  children?: React.ReactNode;
  onDossierCreated?: () => void;
}

export const EnhancedCreateDossierDialog = ({ children, onDossierCreated }: EnhancedCreateDossierDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { clients } = useClientsWithDossiers();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'algemeen',
    client_id: '',
    reference: '',
    priority: 'medium',
    start_date: '',
    end_date: '',
    responsible_user_id: '',
    budget: '',
    is_billable: true,
    tags: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrganization) {
      toast({
        title: "Geen organisatie geselecteerd",
        description: "Selecteer eerst een organisatie",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Naam is verplicht",
        description: "Voer een naam in voor het dossier",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const dossierData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        client_id: formData.client_id || null,
        reference: formData.reference.trim() || null,
        priority: formData.priority,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        responsible_user_id: formData.responsible_user_id || null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        is_billable: formData.is_billable,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : null,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        status: 'active'
      };

      const { error } = await supabase
        .from('dossiers')
        .insert(dossierData);

      if (error) throw error;

      toast({
        title: "Dossier aangemaakt",
        description: `Dossier "${formData.name}" is succesvol aangemaakt`
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'algemeen',
        client_id: '',
        reference: '',
        priority: 'medium',
        start_date: '',
        end_date: '',
        responsible_user_id: '',
        budget: '',
        is_billable: true,
        tags: ''
      });
      
      setOpen(false);
      onDossierCreated?.();
    } catch (error) {
      console.error('Error creating dossier:', error);
      toast({
        title: "Fout bij aanmaken",
        description: "Er is een fout opgetreden bij het aanmaken van het dossier",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Dossier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuw Dossier Aanmaken</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Basisinformatie</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Naam *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Dossiernaam"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="reference">Referentie/Kenmerk</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="Referentienummer of kenmerk"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Beschrijving van het dossier"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categorie</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="algemeen">Algemeen</SelectItem>
                    <SelectItem value="juridisch">Juridisch</SelectItem>
                    <SelectItem value="financieel">Financieel</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="klacht">Klacht</SelectItem>
                    <SelectItem value="onderzoek">Onderzoek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioriteit</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer prioriteit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Laag</SelectItem>
                    <SelectItem value="medium">Normaal</SelectItem>
                    <SelectItem value="high">Hoog</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Client Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Client</h3>
            
            <div>
              <Label htmlFor="client_id">Gekoppelde Client</Label>
              <Select 
                value={formData.client_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een client (optioneel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Geen client gekoppeld</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} {client.email && `(${client.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline & Budget */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Planning & Budget</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Startdatum</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="end_date">Einddatum</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="is_billable"
                  checked={formData.is_billable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_billable: !!checked }))}
                />
                <Label htmlFor="is_billable">Factuurbaar</Label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Tags</h3>
            
            <div>
              <Label htmlFor="tags">Tags (gescheiden door komma's)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="urgent, project, review"
              />
              <p className="text-xs text-gray-500 mt-1">
                Voer tags in gescheiden door komma's
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Bezig...' : 'Dossier Aanmaken'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
