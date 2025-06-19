
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useContactNumbering } from '@/hooks/useContactNumbering';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactKlantTab } from './ContactKlantTab';
import { ContactDocumentTab } from './ContactDocumentTab';
import { ContactShippingTab } from './ContactShippingTab';
import { X } from 'lucide-react';

interface Contact {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  address_line_2?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  vat_number?: string;
  payment_terms?: number;
  payment_method?: string;
  iban?: string;
  contact_person?: string;
  website?: string;
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
  type?: string;
  department?: string;
  salutation?: string;
  contact_name_on_invoice?: boolean;
  contact_number?: string;
}

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  onContactSaved: (contact: Contact) => void;
}

export const ContactDialog = ({ isOpen, onClose, contact, onContactSaved }: ContactDialogProps) => {
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { nextContactNumber } = useContactNumbering();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('klant');

  const [formData, setFormData] = useState<Contact>({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    address: '',
    address_line_2: '',
    postal_code: '',
    city: '',
    country: 'Nederland',
    vat_number: '',
    payment_terms: 30,
    payment_method: 'bankoverschrijving',
    iban: '',
    contact_person: '',
    website: '',
    notes: '',
    default_discount: 0,
    discount_type: 'percentage',
    products_display: 'incl_btw',
    invoice_reference: '',
    hide_notes_on_invoice: false,
    billing_address: '',
    shipping_address: '',
    shipping_instructions: '',
    shipping_method: 'E-mail',
    reminder_email: '',
    type: 'prive',
    department: '',
    salutation: 'Geachte heer/mevrouw',
    contact_name_on_invoice: false,
    contact_number: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        address: contact.address || '',
        address_line_2: contact.address_line_2 || '',
        postal_code: contact.postal_code || '',
        city: contact.city || '',
        country: contact.country || 'Nederland',
        vat_number: contact.vat_number || '',
        payment_terms: contact.payment_terms || 30,
        payment_method: contact.payment_method || 'bankoverschrijving',
        iban: contact.iban || '',
        contact_person: contact.contact_person || '',
        website: contact.website || '',
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
        reminder_email: contact.reminder_email || '',
        type: contact.type || 'prive',
        department: contact.department || '',
        salutation: contact.salutation || 'Geachte heer/mevrouw',
        contact_name_on_invoice: contact.contact_name_on_invoice || false,
        contact_number: contact.contact_number || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        mobile: '',
        address: '',
        address_line_2: '',
        postal_code: '',
        city: '',
        country: 'Nederland',
        vat_number: '',
        payment_terms: 30,
        payment_method: 'bankoverschrijving',
        iban: '',
        contact_person: '',
        website: '',
        notes: '',
        default_discount: 0,
        discount_type: 'percentage',
        products_display: 'incl_btw',
        invoice_reference: '',
        hide_notes_on_invoice: false,
        billing_address: '',
        shipping_address: '',
        shipping_instructions: '',
        shipping_method: 'E-mail',
        reminder_email: '',
        type: 'prive',
        department: '',
        salutation: 'Geachte heer/mevrouw',
        contact_name_on_invoice: false,
        contact_number: nextContactNumber
      });
    }
  }, [contact, nextContactNumber]);

  const handleSave = async () => {
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
        title: "Validatiefout",
        description: "Naam is verplicht",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const contactData = {
        name: formData.name.trim(),
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        mobile: formData.mobile?.trim() || null,
        address: formData.address?.trim() || null,
        address_line_2: formData.address_line_2?.trim() || null,
        postal_code: formData.postal_code?.trim() || null,
        city: formData.city?.trim() || null,
        country: formData.country || 'Nederland',
        vat_number: formData.vat_number?.trim() || null,
        contact_person: formData.contact_person?.trim() || null,
        website: formData.website?.trim() || null,
        payment_terms: formData.payment_terms || 30,
        payment_method: formData.payment_method || 'bankoverschrijving',
        iban: formData.iban?.trim() || null,
        notes: formData.notes?.trim() || null,
        default_discount: formData.default_discount || 0,
        discount_type: formData.discount_type || 'percentage',
        products_display: formData.products_display || 'incl_btw',
        invoice_reference: formData.invoice_reference?.trim() || null,
        hide_notes_on_invoice: formData.hide_notes_on_invoice || false,
        billing_address: formData.billing_address?.trim() || null,
        shipping_address: formData.shipping_address?.trim() || null,
        shipping_instructions: formData.shipping_instructions?.trim() || null,
        shipping_method: formData.shipping_method || 'E-mail',
        reminder_email: formData.reminder_email?.trim() || null,
        type: formData.type || 'prive',
        department: formData.department?.trim() || null,
        salutation: formData.salutation || 'Geachte heer/mevrouw',
        contact_name_on_invoice: formData.contact_name_on_invoice || false,
        contact_number: contact?.id ? formData.contact_number : nextContactNumber,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        updated_at: new Date().toISOString()
      };

      console.log('💾 Saving contact with data:', contactData);

      if (contact?.id) {
        const { data, error } = await supabase
          .from('clients')
          .update(contactData)
          .eq('id', contact.id)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Contact bijgewerkt",
          description: `Contact "${formData.name}" is succesvol bijgewerkt`
        });

        onContactSaved(data);
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert(contactData)
          .select()
          .single();

        if (error) throw error;

        toast({
          title: "Contact aangemaakt",
          description: `Contact "${formData.name}" is succesvol aangemaakt`
        });

        onContactSaved(data);
      }

      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Fout bij opslaan",
        description: "Er is een fout opgetreden bij het opslaan van het contact",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[800px] flex flex-col p-0">
        {/* Header - exact 48px */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between flex-shrink-0 h-12">
          <h2 className="text-lg font-medium">Contacten</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab navigation - exact 48px */}
        <div className="bg-white border-b flex-shrink-0 h-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
            <TabsList className="grid w-full grid-cols-3 bg-transparent h-12 border-b">
              <TabsTrigger 
                value="klant" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none h-full text-sm"
              >
                Klant
              </TabsTrigger>
              <TabsTrigger 
                value="document" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none h-full text-sm"
              >
                Document
              </TabsTrigger>
              <TabsTrigger 
                value="verzending" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent rounded-none h-full text-sm"
              >
                Verzending en betaling
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content area - remaining height minus header (48px) + tabs (48px) + footer (60px) = 644px */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsContent value="klant" className="mt-0 p-6 h-full overflow-y-auto">
              <ContactKlantTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="document" className="mt-0 p-6 h-full overflow-y-auto">
              <ContactDocumentTab formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="verzending" className="mt-0 p-6 h-full overflow-y-auto">
              <ContactShippingTab formData={formData} setFormData={setFormData} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer - exact 60px */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-end gap-3 border-t flex-shrink-0 h-15">
          <Button 
            type="button" 
            onClick={onClose}
            variant="outline"
            className="text-sm"
          >
            Annuleren
          </Button>
          <Button 
            type="submit" 
            disabled={loading || !formData.name.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-sm"
            onClick={handleSave}
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
