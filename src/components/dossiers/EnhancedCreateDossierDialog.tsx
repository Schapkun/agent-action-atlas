
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus, Scale } from 'lucide-react';
import { useDossierForm } from '@/hooks/useDossierForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EnhancedCreateDossierDialogProps {
  children?: React.ReactNode;
  onDossierCreated?: () => void;
}

export const EnhancedCreateDossierDialog = ({ children, onDossierCreated }: EnhancedCreateDossierDialogProps) => {
  const [open, setOpen] = useState(false);
  const { formData, updateFormData, submitForm, loading } = useDossierForm(() => {
    setOpen(false);
    onDossierCreated?.();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-slate-800 hover:bg-slate-700 text-white shadow-sm border-0">
            <Plus className="h-4 w-4 mr-2" />
            Nieuw Dossier
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 rounded-lg p-2">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">Nieuw Dossier Aanmaken</DialogTitle>
              <p className="text-slate-600 text-sm mt-1">Maak een nieuw juridisch dossier aan</p>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Basis Informatie</h3>
              
              <div>
                <Label htmlFor="name">Dossier Naam *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Dossiernaam"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Beschrijving</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Beschrijving van het dossier"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Categorie</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => updateFormData({ category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer categorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="algemeen">Algemeen</SelectItem>
                    <SelectItem value="strafrecht">Strafrecht</SelectItem>
                    <SelectItem value="civielrecht">Civiel recht</SelectItem>
                    <SelectItem value="arbeidsrecht">Arbeidsrecht</SelectItem>
                    <SelectItem value="familierecht">Familierecht</SelectItem>
                    <SelectItem value="ondernemingsrecht">Ondernemingsrecht</SelectItem>
                    <SelectItem value="bestuursrecht">Bestuursrecht</SelectItem>
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

            {/* Client & Priority Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Client & Prioriteit</h3>
              
              <div>
                <Label htmlFor="client_name">Client Naam</Label>
                <Input
                  id="client_name"
                  value={formData.client_name || ''}
                  onChange={(e) => updateFormData({ client_name: e.target.value })}
                  placeholder="Naam van de client (optioneel)"
                />
              </div>

              <div>
                <Label htmlFor="priority">Prioriteit</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value) => updateFormData({ priority: value })}
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

              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status || 'active'} 
                  onValueChange={(value) => updateFormData({ status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actief</SelectItem>
                    <SelectItem value="pending">In Behandeling</SelectItem>
                    <SelectItem value="completed">Voltooid</SelectItem>
                    <SelectItem value="cancelled">Geannuleerd</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="px-6 py-2 text-sm border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Annuleren
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-white shadow-sm"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Aanmaken...</span>
                </div>
              ) : (
                'Dossier Aanmaken'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
