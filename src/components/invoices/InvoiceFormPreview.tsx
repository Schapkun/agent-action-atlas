
import { useOrganization } from '@/contexts/OrganizationContext';
import { useState, useEffect } from 'react';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { usePlaceholderReplacement } from '@/components/settings/htmldocument/builder/usePlaceholderReplacement';

interface InvoiceFormPreviewProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  availableTemplates: any[];
  selectedTemplate: string;
  formData: any;
  lineItems: any[];
  invoiceNumber: string;
  selectedContact: any;
  getDefaultInvoiceNumber: () => Promise<string>;
}

export const InvoiceFormPreview = ({
  showPreview,
  setShowPreview,
  availableTemplates,
  selectedTemplate,
  formData,
  lineItems,
  invoiceNumber,
  selectedContact,
  getDefaultInvoiceNumber
}: InvoiceFormPreviewProps) => {
  const { selectedOrganization } = useOrganization();
  const { templates } = useDocumentTemplates();
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate preview HTML whenever data changes
  useEffect(() => {
    if (showPreview) {
      generatePreview();
    }
  }, [showPreview, selectedTemplate, formData, lineItems, invoiceNumber, selectedContact, selectedOrganization]);

  const generatePreview = async () => {
    if (!selectedOrganization?.id) {
      setPreviewHTML('<p>Geen organisatie geselecteerd</p>');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🎨 Generating invoice preview with new system');
      
      // Find the selected template
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template?.html_content) {
        setPreviewHTML('<p>Template niet gevonden</p>');
        return;
      }

      // Prepare company data from organization
      const companyData = {
        bedrijfsnaam: selectedOrganization.name || '',
        adres: selectedOrganization.address || '',
        postcode: selectedOrganization.postal_code || '',
        plaats: selectedOrganization.city || '',
        telefoon: selectedOrganization.phone || '',
        email: selectedOrganization.email || '',
        website: selectedOrganization.website || '',
        kvk: selectedOrganization.kvk_number || '',
        btw: selectedOrganization.vat_number || '',
        iban: selectedOrganization.iban || '',
        
        // Company data met hoofdletters (voor compatibiliteit)
        COMPANY_NAME: selectedOrganization.name || '',
        COMPANY_ADDRESS: selectedOrganization.address || '',
        COMPANY_POSTAL_CODE: selectedOrganization.postal_code || '',
        COMPANY_CITY: selectedOrganization.city || '',
        COMPANY_PHONE: selectedOrganization.phone || '',
        COMPANY_EMAIL: selectedOrganization.email || '',
        COMPANY_WEBSITE: selectedOrganization.website || '',
        COMPANY_KVK: selectedOrganization.kvk_number || '',
        COMPANY_VAT: selectedOrganization.vat_number || '',
        COMPANY_IBAN: selectedOrganization.iban || ''
      };

      // Prepare placeholder values from form and contact data
      const placeholderValues = {
        // Company data
        ...companyData,
        
        // Document data
        datum: formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
        referentie: invoiceNumber || 'CONCEPT',
        onderwerp: 'Factuur',
        
        // Client data
        klant_naam: formData.client_name || selectedContact?.name || '[Klantnaam]',
        klant_bedrijf: formData.client_name || selectedContact?.name || '[Klant bedrijf]',
        klant_adres: formData.client_address || selectedContact?.address || '[Klant adres]',
        klant_postcode: formData.client_postal_code || selectedContact?.postal_code || '[Postcode]',
        klant_plaats: formData.client_city || selectedContact?.city || '[Plaats]',
        klant_email: formData.client_email || selectedContact?.email || '[Klant email]',
        klant_telefoon: selectedContact?.phone || '[Telefoon]',
        klant_land: formData.client_country || selectedContact?.country || 'Nederland',
        
        // Invoice specific placeholders
        INVOICE_NUMBER: invoiceNumber || 'CONCEPT',
        INVOICE_DATE: formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
        DUE_DATE: formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
        
        // Footer
        footer_tekst: 'Betaling binnen 30 dagen na factuurdatum.',
        footer_contact: `Voor vragen kunt u contact opnemen via ${selectedOrganization.email || 'info@bedrijf.nl'}`
      };

      // Use the same placeholder replacement system as HTML builder
      const { replacePlaceholders } = usePlaceholderReplacement({ 
        placeholderValues, 
        companyData 
      });

      // Replace placeholders in the template
      const htmlWithValues = replacePlaceholders(template.html_content, true);
      
      console.log('🎨 Generated preview HTML with consistent system');
      setPreviewHTML(htmlWithValues);
      
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewHTML('<p>Fout bij het genereren van het voorbeeld</p>');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <InvoicePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        previewHTML="<div style='padding: 50px; text-align: center;'>Laden...</div>"
      />
    );
  }

  return (
    <InvoicePreviewDialog
      open={showPreview}
      onOpenChange={setShowPreview}
      previewHTML={previewHTML}
    />
  );
};
