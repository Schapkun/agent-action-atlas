
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SessionData {
  hasFormData: boolean;
  hasLineItems: boolean;
  hasContact: boolean;
  clientName?: string;
  documentType: 'factuur' | 'offerte';
}

export const useSessionRecovery = (documentType: 'factuur' | 'offerte' = 'factuur') => {
  const [isSessionRecovered, setIsSessionRecovered] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkForExistingSession = () => {
      const formKey = documentType === 'factuur' ? 'invoiceFormData' : 'quoteFormData';
      const linesKey = documentType === 'factuur' ? 'invoiceLineItems' : 'quoteLineItems';
      const contactKey = documentType === 'factuur' ? 'invoiceSelectedContact' : 'quoteSelectedContact';

      const formData = localStorage.getItem(formKey);
      const lineItems = localStorage.getItem(linesKey);
      const contact = localStorage.getItem(contactKey);

      const hasFormData = !!(formData && JSON.parse(formData)?.client_name);
      const hasLineItems = !!(lineItems && JSON.parse(lineItems)?.length > 0);
      const hasContact = !!contact;

      if (hasFormData || hasLineItems || hasContact) {
        let clientName = '';
        try {
          if (formData) {
            const parsedForm = JSON.parse(formData);
            clientName = parsedForm.client_name || '';
          }
          if (!clientName && contact) {
            const parsedContact = JSON.parse(contact);
            clientName = parsedContact.name || '';
          }
        } catch (error) {
          console.error('Error parsing session data:', error);
        }

        const session: SessionData = {
          hasFormData,
          hasLineItems,
          hasContact,
          clientName,
          documentType
        };

        setSessionData(session);
        setIsSessionRecovered(true);

        // Show toast notification
        const message = clientName 
          ? `Sessie hersteld: Je was bezig met een ${documentType} voor ${clientName}`
          : `Sessie hersteld: Je was bezig met een ${documentType}`;

        toast({
          title: "Sessie hersteld",
          description: message,
          duration: 5000
        });
      }
    };

    // Check on mount
    checkForExistingSession();
  }, [documentType, toast]);

  const clearSession = () => {
    setIsSessionRecovered(false);
    setSessionData(null);
  };

  return {
    isSessionRecovered,
    sessionData,
    clearSession
  };
};
