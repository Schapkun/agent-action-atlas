
import { useOrganization } from '@/contexts/OrganizationContext';
import { useState, useEffect } from 'react';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { loadCompanyData } from '@/utils/companyDataMapping';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';

interface InvoiceFormPreviewProps {
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  selectedTemplate: DocumentTemplateWithLabels | null;
  formData: any;
  lineItems: any[];
  invoiceNumber: string;
  selectedContact: any;
  getDefaultInvoiceNumber: () => Promise<string>;
}

export const InvoiceFormPreview = ({
  showPreview,
  setShowPreview,
  selectedTemplate,
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
  }, [showPreview, selectedTemplate, formData, lineItems, invoiceNumber, selectedContact, selectedOrganization]);

  const generatePreview = async () => {
    if (!selectedOrganization?.id) {
      setPreviewHTML('<div class="preview-message">Geen organisatie geselecteerd</div>');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🎯 PREVIEW: Direct template object gebruik');
      console.log('🎯 PREVIEW: Template:', selectedTemplate ? {
        id: selectedTemplate.id,
        name: selectedTemplate.name
      } : null);
      
      if (!selectedTemplate?.html_content) {
        console.warn('⚠️ PREVIEW: Geen template geselecteerd');
        setPreviewHTML('<div class="preview-message">Selecteer eerst een template om een voorbeeld te zien</div>');
        return;
      }

      console.log('✅ PREVIEW: Using template:', selectedTemplate.name);

      // Load company data
      const companyData = await loadCompanyData(selectedOrganization.id);
      
      // Create comprehensive placeholder values
      const placeholderValues = {
        // Company data
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
        
        // Uppercase variants for compatibility
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

      // Replace placeholders in template HTML
      let htmlWithValues = selectedTemplate.html_content;
      
      Object.entries(placeholderValues).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        htmlWithValues = htmlWithValues.replace(regex, value || `[${key}]`);
      });
      
      console.log('🎯 PREVIEW: Successfully generated with template:', selectedTemplate.name);
      console.log('🎯 PREVIEW: Placeholders replaced:', Object.keys(placeholderValues).length);
      
      setPreviewHTML(htmlWithValues);
      
    } catch (error) {
      console.error('❌ PREVIEW: Error generating preview:', error);
      setPreviewHTML('<div class="preview-error">Fout bij het genereren van het voorbeeld</div>');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <InvoicePreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        previewHTML="<div style='padding: 50px; text-align: center; font-family: Arial, sans-serif;'>Voorbeeld wordt geladen...</div>"
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
