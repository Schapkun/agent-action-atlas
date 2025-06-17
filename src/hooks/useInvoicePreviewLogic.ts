
import { useState, useEffect } from 'react';
import { DocumentTemplateWithLabels } from '@/types/documentLabels';
import { InvoiceFormData, LineItem } from '@/types/invoiceTypes';
import { useOrganization } from '@/contexts/OrganizationContext';
import { replaceAllPlaceholders } from '@/utils/universalPlaceholderReplacement';
import { generateInvoicePreviewDocument } from '@/utils/invoicePreviewGenerator';

interface UseInvoicePreviewLogicProps {
  selectedTemplate: DocumentTemplateWithLabels | null;
  formData: InvoiceFormData;
  lineItems: LineItem[];
  invoiceNumber: string;
}

export const useInvoicePreviewLogic = ({
  selectedTemplate,
  formData,
  lineItems,
  invoiceNumber
}: UseInvoicePreviewLogicProps) => {
  const [previewHTML, setPreviewHTML] = useState('<div style="padding: 40px; text-align: center; color: #6b7280;">Geen template geselecteerd</div>');
  const { selectedOrganization } = useOrganization();

  useEffect(() => {
    const generatePreview = async () => {
      console.log('🎨 INVOICE PREVIEW LOGIC: Starting with custom generator');
      console.log('🎨 Template:', selectedTemplate?.name);
      console.log('🎨 Organization:', selectedOrganization?.name, selectedOrganization?.id);
      
      if (!selectedTemplate) {
        console.log('⚠️ INVOICE PREVIEW LOGIC: No template selected');
        setPreviewHTML('<div style="padding: 40px; text-align: center; color: #6b7280;">Geen template geselecteerd</div>');
        return;
      }

      try {
        const invoiceData = {
          factuurnummer: invoiceNumber || 'CONCEPT',
          factuurdatum: formData.invoice_date ? new Date(formData.invoice_date).toLocaleDateString('nl-NL') : new Date().toLocaleDateString('nl-NL'),
          vervaldatum: formData.due_date ? new Date(formData.due_date).toLocaleDateString('nl-NL') : '',
          klant_naam: formData.client_name || '[Klantnaam]',
          klant_email: formData.client_email || '[Klant email]',
          klant_adres: formData.client_address || '[Klant adres]',
          klant_postcode: formData.client_postal_code || '[Postcode]',
          klant_plaats: formData.client_city || '[Plaats]',
          klant_land: formData.client_country || 'Nederland',
          subtotaal: lineItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2),
          btw_bedrag: lineItems.reduce((sum, item) => sum + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
          totaal_bedrag: lineItems.reduce((sum, item) => sum + item.line_total + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
          notities: formData.notes || ''
        };

        console.log('🔍 INVOICE PREVIEW LOGIC: Before placeholder replacement');
        console.log('Template contains {{logo}}:', selectedTemplate.html_content.includes('{{logo}}'));

        const processedHTML = await replaceAllPlaceholders(selectedTemplate.html_content, {
          organizationId: selectedOrganization?.id,
          invoiceData,
          lineItems
        });

        console.log('🔍 INVOICE PREVIEW LOGIC: After placeholder replacement');
        console.log('Processed HTML contains {{logo}}:', processedHTML.includes('{{logo}}'));
        console.log('Processed HTML contains img tags:', processedHTML.includes('<img'));

        // Use our custom invoice preview generator (NO CONFLICTS)
        const finalHTML = generateInvoicePreviewDocument(processedHTML, 'Factuur Voorbeeld');

        console.log('✅ INVOICE PREVIEW LOGIC: Using custom generator - should work without conflicts!');
        setPreviewHTML(finalHTML);
      } catch (error) {
        console.error('❌ INVOICE PREVIEW LOGIC: Error:', error);
        setPreviewHTML('<div style="padding: 40px; text-align: center; color: #dc2626;">Fout bij laden van voorbeeld</div>');
      }
    };

    generatePreview();
  }, [selectedTemplate, formData, lineItems, invoiceNumber, selectedOrganization?.id]);

  return { previewHTML };
};
