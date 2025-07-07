
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, User, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';

interface CreateContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContactCreated?: (contact: any) => void;
}

export const CreateContactDialog = ({ open, onOpenChange, onContactCreated }: CreateContactDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    postal_code: '',
    city: '',
    country: 'Nederland',
    type: 'prive',
    contact_person: '',
    website: ''
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        description: "Voer een naam in voor de client",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const contactData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        mobile: formData.mobile.trim() || null,
        address: formData.address.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country,
        type: formData.type,
        contact_person: formData.contact_person.trim() || null,
        website: formData.website.trim() || null,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null
      };

      const { data: contact, error } = await supabase
        .from('clients')
        .insert(contactData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Client aangemaakt",
        description: `Client "${formData.name}" is succesvol aangemaakt`
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        postal_code: '',
        city: '',
        country: 'Nederland',
        type: 'prive',
        contact_person: '',
        website: ''
      });

      onContactCreated?.(contact);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating contact:', error);
      toast({
        title: "Fout bij aanmaken",
        description: "Er is een fout opgetreden bij het aanmaken van de client",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 rounded-lg p-2">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">Nieuwe Client Aanmaken</DialogTitle>
              <p className="text-slate-600 text-sm mt-1">Voeg een nieuwe client toe aan je systeem</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-slate-700 mb-2 block">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Naam *
                  </div>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Bedrijfsnaam of persoonsnaam"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-sm font-medium text-slate-700 mb-2 block">
                  Type Client
                </Label>
                <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prive">Privé</SelectItem>
                    <SelectItem value="zakelijk">Zakelijk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700 mb-2 block">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    E-mail
                  </div>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700 mb-2 block">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefoon
                  </div>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="06 12345678"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="address" className="text-sm font-medium text-slate-700 mb-2 block">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adres
                  </div>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  placeholder="Straatnaam 123"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="postal_code" className="text-sm font-medium text-slate-700 mb-2 block">
                    Postcode
                  </Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => updateFormData('postal_code', e.target.value)}
                    placeholder="1234 AB"
                  />
                </div>

                <div>
                  <Label htmlFor="city" className="text-sm font-medium text-slate-700 mb-2 block">
                    Plaats
                  </Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    placeholder="Amsterdam"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact_person" className="text-sm font-medium text-slate-700 mb-2 block">
                  Contactpersoon
                </Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => updateFormData('contact_person', e.target.value)}
                  placeholder="Voor bedrijven: naam contactpersoon"
                />
              </div>

              <div>
                <Label htmlFor="website" className="text-sm font-medium text-slate-700 mb-2 block">
                  Website
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => updateFormData('website', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuleren
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Aanmaken...</span>
                </div>
              ) : (
                'Client Aanmaken'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
