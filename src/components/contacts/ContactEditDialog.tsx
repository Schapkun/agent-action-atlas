
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, X } from 'lucide-react';

interface ContactEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    mobile?: string;
    address?: string;
    postal_code?: string;
    city?: string;
    country?: string;
    vat_number?: string;
    contact_person?: string;
    website?: string;
  } | null;
  onContactUpdated: (updatedContact: any) => void;
}

export const ContactEditDialog = ({
  open,
  onOpenChange,
  contact,
  onContactUpdated
}: ContactEditDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: contact?.name || '',
    email: contact?.email || '',
    phone: contact?.phone || '',
    mobile: contact?.mobile || '',
    address: contact?.address || '',
    postal_code: contact?.postal_code || '',
    city: contact?.city || '',
    country: contact?.country || 'Nederland',
    vat_number: contact?.vat_number || '',
    contact_person: contact?.contact_person || '',
    website: contact?.website || ''
  });

  React.useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        address: contact.address || '',
        postal_code: contact.postal_code || '',
        city: contact.city || '',
        country: contact.country || 'Nederland',
        vat_number: contact.vat_number || '',
        contact_person: contact.contact_person || '',
        website: contact.website || ''
      });
    }
  }, [contact]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!contact?.id || !formData.name.trim()) {
      toast({
        title: "Validatiefout",
        description: "Naam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          phone: formData.phone.trim() || null,
          mobile: formData.mobile.trim() || null,
          address: formData.address.trim() || null,
          postal_code: formData.postal_code.trim() || null,
          city: formData.city.trim() || null,
          country: formData.country.trim() || null,
          vat_number: formData.vat_number.trim() || null,
          contact_person: formData.contact_person.trim() || null,
          website: formData.website.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Contact bijgewerkt",
        description: `Contact "${formData.name}" is succesvol bijgewerkt`
      });

      onContactUpdated(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Fout bij bijwerken",
        description: "Er is een fout opgetreden bij het bijwerken van het contact",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Contact bewerken</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {/* Naam */}
          <div className="md:col-span-2">
            <Label htmlFor="name">Naam *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Contactnaam"
              className="mt-1"
            />
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@voorbeeld.nl"
              className="mt-1"
            />
          </div>

          {/* Contactpersoon */}
          <div>
            <Label htmlFor="contact_person">Contactpersoon</Label>
            <Input
              id="contact_person"
              value={formData.contact_person}
              onChange={(e) => handleInputChange('contact_person', e.target.value)}
              placeholder="Jan Janssen"
              className="mt-1"
            />
          </div>

          {/* Telefoon */}
          <div>
            <Label htmlFor="phone">Telefoon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="020-1234567"
              className="mt-1"
            />
          </div>

          {/* Mobiel */}
          <div>
            <Label htmlFor="mobile">Mobiel</Label>
            <Input
              id="mobile"
              value={formData.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              placeholder="06-12345678"
              className="mt-1"
            />
          </div>

          {/* Adres */}
          <div className="md:col-span-2">
            <Label htmlFor="address">Adres</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Straatnaam en huisnummer"
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Postcode */}
          <div>
            <Label htmlFor="postal_code">Postcode</Label>
            <Input
              id="postal_code"
              value={formData.postal_code}
              onChange={(e) => handleInputChange('postal_code', e.target.value)}
              placeholder="1234 AB"
              className="mt-1"
            />
          </div>

          {/* Plaats */}
          <div>
            <Label htmlFor="city">Plaats</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="Amsterdam"
              className="mt-1"
            />
          </div>

          {/* Land */}
          <div>
            <Label htmlFor="country">Land</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => handleInputChange('country', e.target.value)}
              placeholder="Nederland"
              className="mt-1"
            />
          </div>

          {/* BTW-nummer */}
          <div>
            <Label htmlFor="vat_number">BTW-nummer</Label>
            <Input
              id="vat_number"
              value={formData.vat_number}
              onChange={(e) => handleInputChange('vat_number', e.target.value)}
              placeholder="NL123456789B01"
              className="mt-1"
            />
          </div>

          {/* Website */}
          <div className="md:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.bedrijf.nl"
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Annuleren
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !formData.name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Bezig met opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
