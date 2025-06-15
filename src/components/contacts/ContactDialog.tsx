
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContactDialogTabs } from './ContactDialogTabs';

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
}

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
  contact?: Contact | null;
  mode: 'create' | 'edit';
}

export const ContactDialog = ({ isOpen, onClose, onSave, contact, mode }: ContactDialogProps) => {
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
    // Document tab fields
    standardDiscount: 0,
    documentLanguage: 'Standaardinstelling',
    currency: 'Euro',
    products: 'Inclusief btw',
    standardCategory: 'geen',
    referenceText: '',
    hideNoticesOnNewInvoice: false,
    // Shipping tab fields
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
        paymentTerms: 14,
        iban: '',
        bic: '',
        automaticCollection: false
      });
    } else {
      // Generate random number for new contact
      const randomNumber = Math.floor(Math.random() * 9000 + 1000).toString();
      setFormData(prev => ({
        ...prev,
        number: randomNumber
      }));
    }
  }, [contact, mode, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
      type: formData.type
    };

    onSave(contactData);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col p-4">
        <DialogHeader>
          <DialogTitle className="text-white bg-blue-500 p-2 -m-4 mb-4 text-sm">
            Contacten
          </DialogTitle>
        </DialogHeader>

        <ContactDialogTabs 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
