
import { useOrganization } from '@/contexts/OrganizationContext';
import { useState, useEffect } from 'react';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { loadCompanyData } from '@/utils/companyDataMapping';

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
      console.log('🎨 Generating invoice preview with direct placeholder replacement');
      
      // Find the selected template
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template?.html_content) {
        setPreviewHTML('<p>Template niet gevonden</p>');
        return;
      }

      // Load company data using the same system as HTML builder
      const companyData = await loadCompanyData(selectedOrganization.id);
      console.log('📊 Loaded company data:', companyData);

      // Create comprehensive placeholder values
      const placeholderValues = {
        // Company data (both lowercase and uppercase for compatibility)
        bedrijfsnaam: companyData.bedrijfsnaam || selectedOrganization.name || 'Uw Bedrijf B.V.',
        adres: companyData.adres || '',
        postcode: companyData.postcode || '',
        plaats: companyData.plaats || '',
        telefoon: companyData.telefoon || '',
        email: companyData.email || '',
        website: companyData.website || '',
        kvk_nummer: companyData.kvk_nummer || '',
        btw_nummer: companyData.btw_nummer || '',
        banknummer: companyData.banknummer || '',
        
        // Uppercase variants
        COMPANY_NAME: companyData.bedrijfsnaam || selectedOrganization.name || 'Uw Bedrijf B.V.',
        COMPANY_ADDRESS: companyData.adres || '',
        COMPANY_POSTAL_CODE: companyData.postcode || '',
        COMPANY_CITY: companyData.plaats || '',
        COMPANY_PHONE: companyData.telefoon || '',
        COMPANY_EMAIL: companyData.email || '',
        COMPANY_WEBSITE: companyData.website || '',
        COMPANY_KVK: companyData.kvk_nummer || '',
        COMPANY_VAT: companyData.btw_nummer || '',
        COMPANY_IBAN: companyData.banknummer || '',
        
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
        footer_contact: `Voor vragen kunt u contact opnemen via ${companyData.email || 'info@bedrijf.nl'}`
      };

      // Direct placeholder replacement (same logic as HTML builder)
      let htmlWithValues = template.html_content;
      
      // Replace all placeholders
      Object.entries(placeholderValues).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        htmlWithValues = htmlWithValues.replace(regex, value || `[${key}]`);
      });
      
      console.log('🎨 Generated preview HTML with direct replacement');
      console.log('📊 Replaced placeholders:', Object.keys(placeholderValues).length);
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
