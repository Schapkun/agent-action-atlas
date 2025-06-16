
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContactDialogTabs } from './ContactDialogTabs';
import { useContactCreator } from './ContactCreator';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('🚫 ABSOLUTE BLOCK: ContactDialog.handleSubmit - ZERO INVOICE CREATION ALLOWED');
      console.log('🚫 This is ONLY a contact save operation - NO INVOICE LOGIC WHATSOEVER');
      
      const contactData: Contact = {
        id: formData.number,
        name: formData.name,
        email: formData.email,
        address: formData.address,
        postal_code: formData.postalCode,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        mobile: formData.mobile,
        type: formData.type,
        payment_terms: formData.paymentTerms
      };

      console.log('🚫 ContactDialog: Contact data prepared (ISOLATED FROM ALL INVOICE LOGIC):', contactData);

      let savedContact: Contact;
      
      if (mode === 'edit') {
        console.log('🚫 ContactDialog: Updating existing contact - COMPLETELY ISOLATED');
        savedContact = await updateContact(contactData);
      } else {
        console.log('🚫 ContactDialog: Creating new contact - COMPLETELY ISOLATED');
        savedContact = await saveContact(contactData);
      }

      console.log('🚫 ContactDialog: Contact saved - calling onSave ONLY for form update:', savedContact);

      // ISOLATION: This ONLY passes contact data to parent for form population
      // NO INVOICE CREATION should happen anywhere in the chain
      onSave(savedContact);
      onClose();
    } catch (error) {
      console.error('ContactDialog: Error saving contact:', error);
      // Don't close dialog on error so user can retry
    }
  };

  const handleCancel = () => {
    console.log('🚫 ContactDialog: Cancel - NO INVOICE LOGIC');
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
