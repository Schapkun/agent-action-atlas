
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useDossierForm } from '@/hooks/useDossierForm';

interface CreateDossierDialogProps {
  children?: React.ReactNode;
  onDossierCreated?: () => void;
}

export const CreateDossierDialog = ({ children, onDossierCreated }: CreateDossierDialogProps) => {
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nieuw Dossier Aanmaken</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Naam *</Label>
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
              placeholder="Optionele beschrijving"
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Bezig...' : 'Aanmaken'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
