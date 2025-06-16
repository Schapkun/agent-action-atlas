
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
  mobile?: string;
  payment_terms?: number;
}

interface ContactCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onContactCreated: (contact: Contact) => void;
}

export const ContactCreateDialog = ({
  isOpen,
  onClose,
  onContactCreated
}: ContactCreateDialogProps) => {
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'Nederland',
    phone: '',
    mobile: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrganization) {
      toast({
        title: "Fout",
        description: "Geen organisatie geselecteerd",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Fout",
        description: "Naam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          address: formData.address.trim() || null,
          postal_code: formData.postal_code.trim() || null,
          city: formData.city.trim() || null,
          country: formData.country || 'Nederland',
          phone: formData.phone.trim() || null,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        toast({
          title: "Fout",
          description: "Kon contact niet aanmaken",
          variant: "destructive"
        });
        return;
      }

      console.log('📋 Contact created successfully:', data);
      
      const newContact: Contact = {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        address: data.address || undefined,
        postal_code: data.postal_code || undefined,
        city: data.city || undefined,
        country: data.country || 'Nederland',
        phone: data.phone || undefined,
        payment_terms: 30
      };

      onContactCreated(newContact);
      
      toast({
        title: "Succes",
        description: "Contact succesvol aangemaakt"
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        address: '',
        postal_code: '',
        city: '',
        country: 'Nederland',
        phone: '',
        mobile: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Unexpected error creating contact:', error);
      toast({
        title: "Fout",
        description: "Onverwachte fout bij aanmaken contact",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        email: '',
        address: '',
        postal_code: '',
        city: '',
        country: 'Nederland',
        phone: '',
        mobile: ''
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Nieuw Contact</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Naam *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Bedrijfsnaam of persoonsnaam"
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium">
              E-mailadres
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="voorbeeld@bedrijf.nl"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="address" className="text-sm font-medium">
              Adres
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Straatnaam en huisnummer"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="postal_code" className="text-sm font-medium">
                Postcode
              </Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="1234 AB"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="city" className="text-sm font-medium">
                Plaats
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Amsterdam"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone" className="text-sm font-medium">
              Telefoon
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="06-12345678"
              className="mt-1"
            />
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? 'Opslaan...' : 'Contact aanmaken'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
