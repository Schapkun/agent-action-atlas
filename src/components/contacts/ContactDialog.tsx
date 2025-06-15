
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
    paymentTerms: 30,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: ''
  });

  // Calculate due date based on payment terms
  const calculateDueDate = (invoiceDate: string, paymentTerms: number) => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + paymentTerms);
    return date.toISOString().split('T')[0];
  };

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
        paymentTerms: 30,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: calculateDueDate(new Date().toISOString().split('T')[0], 30)
      });
    } else {
      // Generate random number for new contact
      const randomNumber = Math.floor(Math.random() * 9000 + 1000).toString();
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        number: randomNumber,
        invoiceDate: today,
        dueDate: calculateDueDate(today, 30)
      }));
    }
  }, [contact, mode, isOpen]);

  // Update due date when invoice date or payment terms change
  useEffect(() => {
    if (formData.invoiceDate) {
      setFormData(prev => ({
        ...prev,
        dueDate: calculateDueDate(prev.invoiceDate, prev.paymentTerms)
      }));
    }
  }, [formData.invoiceDate, formData.paymentTerms]);

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
      <DialogContent className="max-w-4xl min-h-[90vh] max-h-[90vh] flex flex-col p-6">
        <DialogHeader>
          <DialogTitle className="text-white bg-blue-500 p-3 -m-6 mb-6">
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
