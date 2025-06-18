
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Plus } from 'lucide-react';
import { useDossiers } from '@/hooks/useDossiers';
import { useContactData } from '@/components/contacts/useContactData';

interface CreateDossierDialogProps {
  children?: React.ReactNode;
}

export const CreateDossierDialog = ({ children }: CreateDossierDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client_id: '',
    category: 'algemeen'
  });
  
  const { createDossier } = useDossiers();
  const { contacts } = useContactData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await createDossier({
      name: formData.name,
      description: formData.description || undefined,
      client_id: formData.client_id || undefined,
      category: formData.category
    });

    if (result) {
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        client_id: '',
        category: 'algemeen'
      });
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Nieuw Dossier Aanmaken
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Dossier Naam *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Naam van het dossier"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optionele beschrijving"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="client">Koppel aan Klant (optioneel)</Label>
            <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een klant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Geen klant</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Categorie</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="algemeen">Algemeen</SelectItem>
                <SelectItem value="juridisch">Juridisch</SelectItem>
                <SelectItem value="belasting">Belasting</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="onderzoek">Onderzoek</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              Dossier Aanmaken
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
