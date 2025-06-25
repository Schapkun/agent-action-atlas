
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Calendar, User, Building2, FolderPlus, Tag, CreditCard, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAllClients } from '@/hooks/useAllClients';
import { useOrganizationMembers } from '@/hooks/useOrganizationMembers';

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
  const { members } = useOrganizationMembers();
  
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
      <DialogContent className="!w-[90vw] !h-[90vh] !max-w-none !fixed !top-[5vh] !left-[5vw] !transform-none !translate-x-0 !translate-y-0 p-0 rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 flex-shrink-0">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="bg-white/20 rounded-lg p-1.5">
                <FolderPlus className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">Nieuw Dossier</DialogTitle>
                <p className="text-blue-100 text-xs">Maak een nieuw dossier aan</p>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            
            {/* Basisinformatie */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200 w-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-blue-600 rounded-lg p-1.5">
                  <User className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-blue-900">Basisinformatie</h3>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-xs text-blue-900 font-medium">Naam *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Dossiernaam"
                    required
                    className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-8"
                  />
                </div>
                
                <div>
                  <Label htmlFor="reference" className="text-xs text-blue-900 font-medium">Referentie</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Referentienummer"
                    className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-8"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="category" className="text-xs text-blue-900 font-medium">Categorie</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-8">
                        <SelectValue placeholder="Selecteer" />
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
                    <Label htmlFor="priority" className="text-xs text-blue-900 font-medium">Prioriteit</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-8">
                        <SelectValue placeholder="Selecteer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs">Laag</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-xs">Normaal</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="text-xs">Hoog</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-xs">Urgent</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="responsible_user_id" className="text-xs text-blue-900 font-medium">Verantwoordelijke</Label>
                  <Select 
                    value={formData.responsible_user_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_user_id: value }))}
                  >
                    <SelectTrigger className="mt-1 text-xs border-blue-200 focus:border-blue-500 focus:ring-blue-500 h-8">
                      <SelectValue placeholder="Selecteer persoon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Niet toegewezen</SelectItem>
                      {members.map((member) => (
                        <SelectItem key={member.user_id} value={member.user_id}>
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs">{member.account_name || member.email}</span>
                            <span className="text-gray-400 ml-2 text-xs">{member.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Client */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200 w-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-green-600 rounded-lg p-1.5">
                  <Building2 className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-green-900">Client</h3>
              </div>
              
              <div>
                <Label htmlFor="client_id" className="text-xs text-green-900 font-medium">Gekoppelde Client</Label>
                <Select 
                  value={formData.client_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}
                >
                  <SelectTrigger className="mt-1 text-xs border-green-200 focus:border-green-500 focus:ring-green-500 h-8">
                    <SelectValue placeholder="Selecteer client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no_client">Geen client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs">{client.name}</span>
                          {client.contact_number && (
                            <span className="text-gray-400 ml-2 text-xs">#{client.contact_number}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Planning & Budget */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200 w-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-purple-600 rounded-lg p-1.5">
                  <Calendar className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-purple-900">Planning & Budget</h3>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="start_date" className="text-xs text-purple-900 font-medium">Start</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                      className="mt-1 text-xs border-purple-200 focus:border-purple-500 focus:ring-purple-500 h-8"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_date" className="text-xs text-purple-900 font-medium">Eind</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                      className="mt-1 text-xs border-purple-200 focus:border-purple-500 focus:ring-purple-500 h-8"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-xs text-purple-900 font-medium">Budget (€)</Label>
                  <div className="relative mt-1">
                    <CreditCard className="absolute left-2 top-2 h-3 w-3 text-purple-500" />
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="0.00"
                      className="pl-8 text-xs border-purple-200 focus:border-purple-500 focus:ring-purple-500 h-8"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_billable"
                    checked={formData.is_billable}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_billable: !!checked }))}
                    className="border-purple-300 text-purple-600 focus:ring-purple-500"
                  />
                  <Label htmlFor="is_billable" className="text-xs text-purple-900 font-medium">Factuurbaar</Label>
                </div>
              </div>
            </div>

            {/* Beschrijving */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-3 border border-gray-200 w-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-gray-600 rounded-lg p-1.5">
                  <FileText className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Beschrijving</h3>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-xs text-gray-900 font-medium">Omschrijving</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Beschrijving van het dossier"
                  rows={3}
                  className="mt-1 text-xs border-gray-200 focus:border-gray-500 focus:ring-gray-500 resize-none"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200 w-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-orange-600 rounded-lg p-1.5">
                  <Tag className="h-3 w-3 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-orange-900">Tags</h3>
              </div>
              
              <div>
                <Label htmlFor="tags" className="text-xs text-orange-900 font-medium">Labels</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="urgent, project, review"
                  className="mt-1 text-xs border-orange-200 focus:border-orange-500 focus:ring-orange-500 h-8"
                />
                <p className="text-xs text-orange-600 mt-1">
                  Gescheiden door komma's
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="px-4 py-1.5 text-xs border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Annuleren
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={handleSubmit}
            className="px-4 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Bezig...</span>
              </div>
            ) : (
              'Aanmaken'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
