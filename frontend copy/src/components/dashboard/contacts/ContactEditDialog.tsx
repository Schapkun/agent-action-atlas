import React from 'react';
import { ContactDialog } from '@/components/contacts/ContactDialog';

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
}

interface ContactEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onContactUpdated?: (updatedContact: Contact) => void;
}

export const ContactEditDialog = ({
  open,
  onOpenChange,
  contact,
  onContactUpdated
}: ContactEditDialogProps) => {
  const handleContactSaved = (savedContact: Contact) => {
    onOpenChange(false);
    // GEFIXT: Geen page refresh meer, alleen callback
    if (onContactUpdated) {
      onContactUpdated(savedContact);
    }
  };

  return (
    <ContactDialog
      isOpen={open}
      onClose={() => onOpenChange(false)}
      contact={contact}
      onContactSaved={handleContactSaved}
    />
  );
};
