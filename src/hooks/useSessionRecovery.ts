
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

      // More precise validation for meaningful data
      let hasFormData = false;
      let hasLineItems = false;
      let hasContact = false;
      let clientName = '';

      // Check if form data contains actual user input (not just default values)
      if (formData) {
        try {
          const parsedForm = JSON.parse(formData);
          // Only consider it meaningful if client_name is filled and not empty
          if (parsedForm?.client_name && parsedForm.client_name.trim() !== '') {
            hasFormData = true;
            clientName = parsedForm.client_name;
          }
        } catch (error) {
          console.error('Error parsing form data:', error);
        }
      }

      // Check if line items contain actual content (not empty items)
      if (lineItems) {
        try {
          const parsedLines = JSON.parse(lineItems);
          if (Array.isArray(parsedLines) && parsedLines.length > 0) {
            // Only consider meaningful if at least one line item has description or unit_price > 0
            hasLineItems = parsedLines.some(item => 
              (item.description && item.description.trim() !== '') || 
              (item.unit_price && item.unit_price > 0)
            );
          }
        } catch (error) {
          console.error('Error parsing line items:', error);
        }
      }

      // Check if there's actually a selected contact
      if (contact) {
        try {
          const parsedContact = JSON.parse(contact);
          if (parsedContact && parsedContact.id) {
            hasContact = true;
            // Use contact name if no client name from form
            if (!clientName && parsedContact.name) {
              clientName = parsedContact.name;
            }
          }
        } catch (error) {
          console.error('Error parsing contact data:', error);
        }
      }

      // Only trigger session recovery if there's actually meaningful data
      if (hasFormData || hasLineItems || hasContact) {
        const session: SessionData = {
          hasFormData,
          hasLineItems,
          hasContact,
          clientName,
          documentType
        };

        setSessionData(session);
        setIsSessionRecovered(true);

        // Show toast notification with shorter duration
        const message = clientName 
          ? `Sessie hersteld voor ${clientName}`
          : `Sessie hersteld`;

        toast({
          title: "Sessie hersteld",
          description: message,
          duration: 2000 // Verkort van 5000 naar 2000ms
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
