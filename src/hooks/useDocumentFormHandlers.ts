
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { Contact } from '@/types/contacts';

interface DocumentFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  title: string;
  description: string;
}

export const useDocumentFormHandlers = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState<DocumentFormData>({
    client_name: '',
    client_email: '',
    client_address: '',
    client_postal_code: '',
    client_city: '',
    client_country: 'Nederland',
    title: '',
    description: ''
  });

  const togglePreview = () => setShowPreview(!showPreview);

  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        client_name: contact.name,
        client_email: contact.email || '',
        client_address: contact.address || '',
        client_postal_code: contact.postal_code || '',
        client_city: contact.city || '',
        client_country: contact.country || 'Nederland'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        client_name: '',
        client_email: '',
        client_address: '',
        client_postal_code: '',
        client_city: '',
        client_country: 'Nederland'
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !documentType) {
      toast({
        title: "Ontbrekende gegevens",
        description: "Vul alle verplichte velden in",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Here you would save the document
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Document opgeslagen",
        description: "Het document is succesvol opgeslagen als concept"
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Het document kon niet worden opgeslagen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSend = async () => {
    if (!selectedContact?.email) {
      toast({
        title: "Geen email adres",
        description: "Het geselecteerde contact heeft geen email adres",
        variant: "destructive"
      });
      return;
    }

    setSendLoading(true);
    try {
      await handleFormSubmit(new Event('submit') as any);
      
      // Here you would send the document
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Document verzonden",
        description: `Het document is verzonden naar ${selectedContact.name}`
      });
    } catch (error) {
      toast({
        title: "Fout",
        description: "Het document kon niet worden verzonden",
        variant: "destructive"
      });
    } finally {
      setSendLoading(false);
    }
  };

  const updateFormData = (updates: Partial<DocumentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return {
    // State
    showSettings,
    setShowSettings,
    showPreview,
    togglePreview,
    loading,
    sendLoading,
    selectedContact,
    documentType,
    setDocumentType,
    content,
    setContent,
    formData,
    
    // Handlers
    handleContactSelect,
    handleFormSubmit,
    handleSaveAndSend,
    updateFormData
  };
};
