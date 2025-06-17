
import { replaceAllPlaceholders } from './universalPlaceholderReplacement';

interface InvoiceFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  invoice_date: string;
  due_date: string;
  payment_terms: number;
  notes: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
}

export const generatePreviewHTML = async (
  templateHTML: string,
  formData: InvoiceFormData,
  lineItems: LineItem[],
  invoiceNumber: string,
  organizationId?: string
): Promise<string> => {
  console.log('🎨 TEMPLATE UTILS: Starting HTML generation with UNIVERSAL SYSTEM:', {
    templateLength: templateHTML?.length,
    hasOrganizationId: !!organizationId,
    lineItemsCount: lineItems.length,
    invoiceNumber
  });

  if (!templateHTML) {
    return '<div>Geen template beschikbaar</div>';
  }

  try {
    // Prepare invoice-specific data
    const invoiceData = {
      // Invoice data
      factuurnummer: invoiceNumber || 'CONCEPT',
      factuurdatum: formData.invoice_date ? new Date(formData.invoice_date).toLocaleDateString('nl-NL') : new Date().toLocaleDateString('nl-NL'),
      vervaldatum: formData.due_date ? new Date(formData.due_date).toLocaleDateString('nl-NL') : '',
      
      // Client data  
      klant_naam: formData.client_name || '[Klantnaam]',
      klant_email: formData.client_email || '[Klant email]',
      klant_adres: formData.client_address || '[Klant adres]',
      klant_postcode: formData.client_postal_code || '[Postcode]',
      klant_plaats: formData.client_city || '[Plaats]',
      klant_land: formData.client_country || 'Nederland',
      
      // Totals
      subtotaal: lineItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2),
      btw_bedrag: lineItems.reduce((sum, item) => sum + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
      totaal_bedrag: lineItems.reduce((sum, item) => sum + item.line_total + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
      
      // Notes
      notities: formData.notes || ''
    };

    // Use the universal placeholder replacement system
    const processedHTML = await replaceAllPlaceholders(templateHTML, {
      organizationId,
      invoiceData,
      lineItems
    });

    console.log('✅ TEMPLATE UTILS: HTML generation completed with UNIVERSAL SYSTEM');
    return processedHTML;

  } catch (error) {
    console.error('❌ TEMPLATE UTILS: Error generating HTML:', error);
    return '<div style="padding: 20px; color: red;">Fout bij genereren van preview</div>';
  }
};
