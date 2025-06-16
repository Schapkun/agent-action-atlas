
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContactDialogTabs } from './ContactDialogTabs';
import { useContactCreator } from './ContactCreator';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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
  type?: string;
  payment_terms?: number;
}

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  contact?: Contact | null;
  mode: 'create' | 'edit';
}

export const ContactDialog = ({ isOpen, onClose, onSave, contact, mode }: ContactDialogProps) => {
  const { saveContact, updateContact } = useContactCreator();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check if we're on an invoice or quote creation page
  const isInvoiceOrQuotePage = location.pathname.includes('/facturen/opstellen') || 
                              location.pathname.includes('/offertes/opstellen');

  const [formData, setFormData] = useState({
    number: '',
    type: 'Privé',
    country: 'Nederland',
    name: '',
    postalCode: '',
    address: '',
    extraAddress: '',
    city: '',
    division: '',
    email: '',
    phone: '',
    mobile: '',
    notes: '',
    active: true,
    contactNameOnInvoice: true,
    standardDiscount: 0,
    documentLanguage: 'Standaardinstelling',
    currency: 'Euro',
    products: 'Inclusief btw',
    standardCategory: 'geen',
    referenceText: '',
    hideNoticesOnNewInvoice: false,
    shippingMethod: 'E-mail',
    standardEmailText: 'geen',
    reminderEmail: '',
    paymentTerms: 14,
    iban: '',
    bic: '',
    automaticCollection: false
  });

  useEffect(() => {
    if (contact && mode === 'edit') {
      setFormData({
        number: contact.id,
        type: contact.type || 'Privé',
        country: contact.country || 'Nederland',
        name: contact.name,
        postalCode: contact.postal_code || '',
        address: contact.address || '',
        extraAddress: '',
        city: contact.city || '',
        division: '',
        email: contact.email || '',
        phone: contact.phone || '',
        mobile: contact.mobile || '',
        notes: '',
        active: true,
        contactNameOnInvoice: true,
        standardDiscount: 0,
        documentLanguage: 'Standaardinstelling',
        currency: 'Euro',
        products: 'Inclusief btw',
        standardCategory: 'geen',
        referenceText: '',
        hideNoticesOnNewInvoice: false,
        shippingMethod: 'E-mail',
        standardEmailText: 'geen',
        reminderEmail: '',
        paymentTerms: contact.payment_terms || 14,
        iban: '',
        bic: '',
        automaticCollection: false
      });
    } else {
      // Generate random number for new contact
      const randomNumber = Math.floor(Math.random() * 9000 + 1000).toString();
      setFormData(prev => ({
        ...prev,
        number: randomNumber,
        name: '',
        email: '',
        address: '',
        postalCode: '',
        city: '',
        phone: '',
        mobile: '',
        paymentTerms: 14
      }));
    }
  }, [contact, mode, isOpen]);

  // FIXED: Complete contact save implementation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📝 ContactDialog: Saving contact with context check');
    console.log('📝 Current page:', location.pathname);
    console.log('📝 Is invoice/quote page:', isInvoiceOrQuotePage);
    
    try {
      const contactData: Contact = {
        id: mode === 'edit' ? contact!.id : '',
        name: formData.name,
        email: formData.email || undefined,
        address: formData.address || undefined,
        postal_code: formData.postalCode || undefined,
        city: formData.city || undefined,
        country: formData.country || 'Nederland',
        phone: formData.phone || undefined,
        mobile: formData.mobile || undefined,
        payment_terms: formData.paymentTerms
      };

      let savedContact: Contact;
      
      if (mode === 'edit') {
        console.log('📝 ContactDialog: Updating existing contact');
        savedContact = await updateContact(contactData);
        toast({
          title: "Contact bijgewerkt",
          description: `Contact "${savedContact.name}" is succesvol bijgewerkt.`
        });
      } else {
        console.log('📝 ContactDialog: Creating new contact');
        savedContact = await saveContact(contactData);
        toast({
          title: "Contact toegevoegd",
          description: `Contact "${savedContact.name}" is succesvol toegevoegd.`
        });
      }

      console.log('📝 ContactDialog: Contact saved successfully');
      
      // Close popup FIRST
      onClose();
      
      // Then call the parent onSave handler
      // This will handle both contexts automatically:
      // - For invoice/quote pages: will select the contact for the form
      // - For contacts page: will just add to the contact list
      onSave(savedContact);
      
      console.log('📝 ContactDialog: Process completed');
      
    } catch (error) {
      console.error('📝 ContactDialog: Error saving contact:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het opslaan van het contact.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    console.log('📝 ContactDialog: Cancel - sluiten zonder opslaan');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fixed max-w-4xl w-[90vw] h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b flex-shrink-0">
          <DialogTitle className="text-white bg-blue-500 p-2 -mx-4 -mt-3 mb-3 text-sm">
            Contacten
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-4 pb-4">
          <ContactDialogTabs 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
