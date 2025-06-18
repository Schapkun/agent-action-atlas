
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, X } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
}

interface ContactEditFormProps {
  contact: Contact;
  onSuccess: () => void;
}

export const ContactEditForm = ({ contact, onSuccess }: ContactEditFormProps) => {
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
    country: contact?.country || 'Nederland'
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
        country: contact.country || 'Nederland'
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
      const { error } = await supabase
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
          updated_at: new Date().toISOString()
        })
        .eq('id', contact.id);

      if (error) throw error;

      toast({
        title: "Contact bijgewerkt",
        description: `Contact "${formData.name}" is succesvol bijgewerkt`
      });

      onSuccess();
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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

      <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={onSuccess}
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
    </div>
  );
};
