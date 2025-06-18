
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ContactEditForm } from './ContactEditForm';

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
}

export const ContactEditDialog = ({
  open,
  onOpenChange,
  contact
}: ContactEditDialogProps) => {
  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact bewerken</DialogTitle>
        </DialogHeader>
        
        <ContactEditForm 
          contact={contact}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
