
import { useOrganization } from '@/contexts/OrganizationContext';
import { useState, useEffect } from 'react';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { loadCompanyData } from '@/utils/companyDataMapping';

interface InvoiceFormPreviewProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  selectedTemplateObject: any | null;
  formData: any;
  lineItems: any[];
  invoiceNumber: string;
  selectedContact: any;
  getDefaultInvoiceNumber: () => Promise<string>;
}

export const InvoiceFormPreview = ({
  showPreview,
  setShowPreview,
  selectedTemplateObject,
  formData,
  lineItems,
  invoiceNumber,
  selectedContact,
  getDefaultInvoiceNumber
}: InvoiceFormPreviewProps) => {
  const { selectedOrganization } = useOrganization();
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Generate preview HTML whenever data changes
  useEffect(() => {
    if (showPreview) {
      generatePreview();
    }
  }, [showPreview, selectedTemplateObject, formData, lineItems, invoiceNumber, selectedContact, selectedOrganization]);

  const generatePreview = async () => {
    if (!selectedOrganization?.id) {
      setPreviewHTML('<p>Geen organisatie geselecteerd</p>');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🎨 Generating invoice preview with EXACT template object from dropdown');
      console.log('📋 Selected template object:', selectedTemplateObject ? {
        id: selectedTemplateObject.id,
        name: selectedTemplateObject.name
      } : null);
      
      if (!selectedTemplateObject?.html_content) {
        console.error('❌ Geen template object beschikbaar voor preview');
        setPreviewHTML('<p>Geen template geselecteerd voor preview</p>');
        return;
      }

      console.log('✅ Using exact template from dropdown:', selectedTemplateObject.name);

      // Load company data using the same system as HTML builder
      const companyData = await loadCompanyData(selectedOrganization.id);
      console.log('📊 Loaded company data:', companyData);

      // Create comprehensive placeholder values (same as HTML builder)
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
        
        // Uppercase variants (for compatibility with different template formats)
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
        
        // Client data (using form data and selected contact)
        klant_naam: formData.client_name || selectedContact?.name || '[Klantnaam]',
        klant_bedrijf: formData.client_name || selectedContact?.name || '[Klant bedrijf]',
        klant_adres: formData.client_address || selectedContact?.address || '[Klant adres]',
        klant_postcode: formData.client_postal_code || selectedContact?.postal_code || '[Postcode]',
        klant_plaats: formData.client_city || selectedContact?.city || '[Plaats]',
        klant_email: formData.client_email || selectedContact?.email || '[Klant email]',
        klant_telefoon: selectedContact?.phone || '[Telefoon]',
        klant_land: formData.client_country || selectedContact?.country || 'Nederland',
        
        // Invoice specific placeholders (uppercase variants)
        INVOICE_NUMBER: invoiceNumber || 'CONCEPT',
        INVOICE_DATE: formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
        DUE_DATE: formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
        
        // Footer
        footer_tekst: 'Betaling binnen 30 dagen na factuurdatum.',
        footer_contact: `Voor vragen kunt u contact opnemen via ${companyData.email || 'info@bedrijf.nl'}`
      };

      // Direct placeholder replacement using the EXACT template object
      let htmlWithValues = selectedTemplateObject.html_content;
      
      // Replace all placeholders
      Object.entries(placeholderValues).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        htmlWithValues = htmlWithValues.replace(regex, value || `[${key}]`);
      });
      
      console.log('🎨 Generated preview HTML using EXACT template object from dropdown');
      console.log('📊 Template used:', selectedTemplateObject.name);
      console.log('📊 Template ID:', selectedTemplateObject.id);
      console.log('📊 Replaced placeholders:', Object.keys(placeholderValues).length);
      setPreviewHTML(htmlWithValues);
      
    } catch (error) {
      console.error('❌ Error generating preview:', error);
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
