
import { Button } from '@/components/ui/button';

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
  is_active?: boolean;
  labels?: Array<{ id: string; name: string; color: string; }>;
}

interface ContactActionsProps {
  contact: Contact;
  onContactsUpdated: () => void;
}

export const ContactActions = ({
  contact,
  onContactsUpdated
}: ContactActionsProps) => {
  return null;
};
