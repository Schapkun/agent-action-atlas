
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar, User, Building2, FolderPlus, Tag, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAllClients } from '@/hooks/useAllClients';
import { ContactSelector } from '@/components/contacts/ContactSelector';

interface EnhancedCreateDossierDialogProps {
  children?: React.ReactNode;
  onDossierCreated?: () => void;
}

export const EnhancedCreateDossierDialog = ({ children, onDossierCreated }: EnhancedCreateDossierDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { clients } = useAllClients();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'algemeen',
    client_id: 'no_client',
    reference: '',
    priority: 'medium',
    start_date: '',
    end_date: '',
    responsible_user_id: '',
    budget: '',
    is_billable: true,
    tags: ''
  });

  const [selectedContact, setSelectedContact] = useState(null);

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    if (contact) {
      setFormData(prev => ({ ...prev, client_id: contact.id }));
    } else {
      setFormData(prev => ({ ...prev, client_id: 'no_client' }));
    }
  };

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
        client_id: formData.client_id === 'no_client' ? null : formData.client_id,
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
        client_id: 'no_client',
        reference: '',
        priority: 'medium',
        start_date: '',
        end_date: '',
        responsible_user_id: '',
        budget: '',
        is_billable: true,
        tags: ''
      });
      setSelectedContact(null);
      
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
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg">
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Dossier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden p-0">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                <FolderPlus className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">Nieuw Dossier Aanmaken</DialogTitle>
                <p className="text-blue-100 mt-1">Maak een nieuw dossier aan voor uw organisatie</p>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 rounded-lg p-2">
                  <User className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900">Basisinformatie</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="name" className="text-blue-900 font-medium">Naam *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Dossiernaam"
                    required
                    className="mt-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reference" className="text-blue-900 font-medium">Referentie/Kenmerk</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Referentienummer of kenmerk"
                    className="mt-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-blue-900 font-medium">Categorie</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
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
              </div>

              <div className="mt-6">
                <Label htmlFor="description" className="text-blue-900 font-medium">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschrijving van het dossier"
                  rows={3}
                  className="mt-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="priority" className="text-blue-900 font-medium">Prioriteit</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Selecteer prioriteit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        Laag
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        Normaal
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        Hoog
                      </div>
                    </SelectItem>
                    <SelectItem value="urgent">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        Urgent
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Client Selection */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-600 rounded-lg p-2">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-green-900">Client Selectie</h3>
              </div>
              
              <div>
                <Label htmlFor="client_id" className="text-green-900 font-medium">Gekoppelde Client</Label>
                <div className="mt-2">
                  <ContactSelector
                    selectedContact={selectedContact}
                    onContactSelect={handleContactSelect}
                  />
                </div>
                <p className="text-sm text-green-600 mt-2">
                  Typ om te zoeken op naam, e-mail, plaats, adres of postcode
                </p>
              </div>
            </div>

            {/* Timeline & Budget */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-600 rounded-lg p-2">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900">Planning & Budget</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="start_date" className="text-purple-900 font-medium">Startdatum</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                    className="mt-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date" className="text-purple-900 font-medium">Einddatum</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                    className="mt-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <Label htmlFor="budget" className="text-purple-900 font-medium">Budget (€)</Label>
                  <div className="relative mt-2">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-purple-500" />
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="0.00"
                      className="pl-10 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="is_billable"
                    checked={formData.is_billable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_billable: !!checked }))}
                    className="border-purple-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Label htmlFor="is_billable" className="text-purple-900 font-medium">Factuurbaar</Label>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-600 rounded-lg p-2">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-orange-900">Tags</h3>
              </div>
              
              <div>
                <Label htmlFor="tags" className="text-orange-900 font-medium">Tags (gescheiden door komma's)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="urgent, project, review"
                  className="mt-2 border-orange-200 focus:border-orange-500 focus:ring-orange-500"
                />
                <p className="text-sm text-orange-600 mt-2">
                  Voer tags in gescheiden door komma's
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                className="px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="px-8 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Bezig...
                  </div>
                ) : (
                  'Dossier Aanmaken'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
