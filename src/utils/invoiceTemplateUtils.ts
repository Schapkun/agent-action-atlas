
import { loadCompanyData } from './companyDataMapping';

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
  console.log('🎨 TEMPLATE UTILS: Starting HTML generation with LOGO SUPPORT:', {
    templateLength: templateHTML?.length,
    hasOrganizationId: !!organizationId,
    lineItemsCount: lineItems.length,
    invoiceNumber,
    formDataSample: {
      client_name: formData.client_name,
      client_email: formData.client_email
    }
  });

  let processedHTML = templateHTML || '<div>Geen template beschikbaar</div>';

  try {
    // Load company data including logo
    const companyData = organizationId ? await loadCompanyData(organizationId) : {};
    console.log('🏢 TEMPLATE UTILS: Company data loaded:', companyData);

    // Create placeholder replacements
    const placeholders = {
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
      
      // Company data (from database)
      ...companyData,
      
      // Totals
      subtotaal: lineItems.reduce((sum, item) => sum + item.line_total, 0).toFixed(2),
      btw_bedrag: lineItems.reduce((sum, item) => sum + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
      totaal_bedrag: lineItems.reduce((sum, item) => sum + item.line_total + (item.line_total * item.vat_rate / 100), 0).toFixed(2),
      
      // Notes
      notities: formData.notes || '',
      
      // Current date
      datum: new Date().toLocaleDateString('nl-NL')
    };

    console.log('🔄 TEMPLATE UTILS: All placeholders including LOGO:', placeholders);

    // Replace all placeholders
    Object.entries(placeholders).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHTML = processedHTML.replace(regex, String(value || ''));
    });

    // Handle line items table generation (Handlebars-style {{#each}} replacement)
    if (lineItems.length > 0) {
      const lineItemsHTML = lineItems.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>€${item.unit_price.toFixed(2)}</td>
          <td>${item.vat_rate}%</td>
          <td>€${item.line_total.toFixed(2)}</td>
        </tr>
      `).join('');

      // Replace {{#each regels}} blocks
      processedHTML = processedHTML.replace(
        /{{#each regels}}[\s\S]*?{{\/each}}/g,
        lineItemsHTML
      );
    } else {
      // Remove empty {{#each}} blocks
      processedHTML = processedHTML.replace(
        /{{#each regels}}[\s\S]*?{{\/each}}/g,
        '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #666;">Geen factuurregels toegevoegd</td></tr>'
      );
    }

    // Handle conditional blocks ({{#if}})
    // Simple {{#if notities}} replacement
    if (formData.notes && formData.notes.trim()) {
      processedHTML = processedHTML.replace(/{{#if notities}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      processedHTML = processedHTML.replace(/{{#if notities}}[\s\S]*?{{\/if}}/g, '');
    }

    // Handle logo conditional blocks - safely access logo property
    const hasLogo = companyData && typeof companyData === 'object' && 'logo' in companyData && companyData.logo;
    if (hasLogo) {
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{\/if}}/g, '');
    }

    // Clean up any remaining unfilled placeholders
    processedHTML = processedHTML.replace(/{{[^}]+}}/g, '');

    console.log('✅ TEMPLATE UTILS: HTML generation completed with LOGO SUPPORT');
    return processedHTML;

  } catch (error) {
    console.error('❌ TEMPLATE UTILS: Error generating HTML:', error);
    return '<div style="padding: 20px; color: red;">Fout bij genereren van preview</div>';
  }
};
