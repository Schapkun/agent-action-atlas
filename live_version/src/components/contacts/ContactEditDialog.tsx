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
    payment_terms?: number;
    payment_method?: string;
    iban?: string;
    notes?: string;
    default_discount?: number;
    discount_type?: string;
    products_display?: string;
    invoice_reference?: string;
    hide_notes_on_invoice?: boolean;
    billing_address?: string;
    shipping_address?: string;
    shipping_instructions?: string;
    shipping_method?: string;
    reminder_email?: string;
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
    website: contact?.website || '',
    payment_terms: contact?.payment_terms || 30,
    payment_method: contact?.payment_method || 'bankoverschrijving',
    iban: contact?.iban || '',
    notes: contact?.notes || '',
    default_discount: contact?.default_discount || 0,
    discount_type: contact?.discount_type || 'percentage',
    products_display: contact?.products_display || 'incl_btw',
    invoice_reference: contact?.invoice_reference || '',
    hide_notes_on_invoice: contact?.hide_notes_on_invoice || false,
    billing_address: contact?.billing_address || '',
    shipping_address: contact?.shipping_address || '',
    shipping_instructions: contact?.shipping_instructions || '',
    shipping_method: contact?.shipping_method || 'E-mail',
    reminder_email: contact?.reminder_email || ''
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
        website: contact.website || '',
        payment_terms: contact.payment_terms || 30,
        payment_method: contact.payment_method || 'bankoverschrijving',
        iban: contact.iban || '',
        notes: contact.notes || '',
        default_discount: contact.default_discount || 0,
        discount_type: contact.discount_type || 'percentage',
        products_display: contact.products_display || 'incl_btw',
        invoice_reference: contact.invoice_reference || '',
        hide_notes_on_invoice: contact.hide_notes_on_invoice || false,
        billing_address: contact.billing_address || '',
        shipping_address: contact.shipping_address || '',
        shipping_instructions: contact.shipping_instructions || '',
        shipping_method: contact.shipping_method || 'E-mail',
        reminder_email: contact.reminder_email || ''
      });
    }
  }, [contact]);

  const handleInputChange = (field: string, value: string | number | boolean) => {
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
          payment_terms: formData.payment_terms || 30,
          payment_method: formData.payment_method || 'bankoverschrijving',
          iban: formData.iban.trim() || null,
          notes: formData.notes.trim() || null,
          default_discount: formData.default_discount || 0,
          discount_type: formData.discount_type || 'percentage',
          products_display: formData.products_display || 'incl_btw',
          invoice_reference: formData.invoice_reference.trim() || null,
          hide_notes_on_invoice: formData.hide_notes_on_invoice || false,
          billing_address: formData.billing_address.trim() || null,
          shipping_address: formData.shipping_address.trim() || null,
          shipping_instructions: formData.shipping_instructions.trim() || null,
          shipping_method: formData.shipping_method || 'E-mail',
          reminder_email: formData.reminder_email.trim() || null,
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

      // GEFIXT: Geen page refresh meer, alleen callback
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

          {/* Betalingstermijn */}
          <div>
            <Label htmlFor="payment_terms">Betalingstermijn (dagen)</Label>
            <Input
              id="payment_terms"
              type="number"
              value={formData.payment_terms}
              onChange={(e) => handleInputChange('payment_terms', parseInt(e.target.value) || 30)}
              placeholder="30"
              className="mt-1"
            />
          </div>

          {/* IBAN */}
          <div>
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              value={formData.iban}
              onChange={(e) => handleInputChange('iban', e.target.value)}
              placeholder="NL91ABNA0417164300"
              className="mt-1"
            />
          </div>

          {/* Standaard korting */}
          <div>
            <Label htmlFor="default_discount">Standaard korting (%)</Label>
            <Input
              id="default_discount"
              type="number"
              step="0.01"
              value={formData.default_discount}
              onChange={(e) => handleInputChange('default_discount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="mt-1"
            />
          </div>

          {/* Factuurverwijzing */}
          <div>
            <Label htmlFor="invoice_reference">Factuurverwijzing</Label>
            <Input
              id="invoice_reference"
              value={formData.invoice_reference}
              onChange={(e) => handleInputChange('invoice_reference', e.target.value)}
              placeholder="Projectcode of referentie"
              className="mt-1"
            />
          </div>

          {/* Notities */}
          <div className="md:col-span-2">
            <Label htmlFor="notes">Notities</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Aanvullende informatie"
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        {/* GEFIXTE Footer - altijd zichtbaar */}
        <div 
          className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white"
          style={{ zIndex: 50 }}
        >
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
