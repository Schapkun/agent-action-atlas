
import { loadCompanyData } from './companyDataMapping';

interface PlaceholderReplacementOptions {
  organizationId?: string;
  placeholderValues?: Record<string, string>;
  invoiceData?: {
    factuurnummer?: string;
    factuurdatum?: string;
    vervaldatum?: string;
    klant_naam?: string;
    klant_email?: string;
    klant_adres?: string;
    klant_postcode?: string;
    klant_plaats?: string;
    klant_land?: string;
    subtotaal?: string;
    btw_bedrag?: string;
    totaal_bedrag?: string;
    notities?: string;
  };
  lineItems?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    vat_rate: number;
    line_total: number;
  }>;
}

export const replaceAllPlaceholders = async (
  htmlContent: string,
  options: PlaceholderReplacementOptions = {}
): Promise<string> => {
  const { organizationId, placeholderValues = {}, invoiceData = {}, lineItems = [] } = options;
  
  console.log('🔄 UNIVERSAL PLACEHOLDER: Starting replacement with options:', {
    hasOrganizationId: !!organizationId,
    placeholderKeysCount: Object.keys(placeholderValues).length,
    hasInvoiceData: Object.keys(invoiceData).length > 0,
    lineItemsCount: lineItems.length
  });

  let processedHTML = htmlContent;

  try {
    // Load company data including logo
    const companyData = organizationId ? await loadCompanyData(organizationId) : {};
    console.log('🏢 UNIVERSAL PLACEHOLDER: Company data loaded:', companyData);

    // Combine all data sources
    const allPlaceholders = {
      // Company data (includes extensive logo mappings)
      ...companyData,
      // User-provided placeholder values
      ...placeholderValues,
      // Invoice-specific data
      ...invoiceData,
      // Current date
      datum: new Date().toLocaleDateString('nl-NL')
    };

    console.log('🎨 UNIVERSAL PLACEHOLDER: All placeholders:', {
      ...allPlaceholders,
      logoKeys: Object.keys(allPlaceholders).filter(key => 
        key.toLowerCase().includes('logo'))
    });

    // Replace all standard placeholders
    Object.entries(allPlaceholders).forEach(([key, value]) => {
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

      processedHTML = processedHTML.replace(
        /{{#each regels}}[\s\S]*?{{\/each}}/g,
        lineItemsHTML
      );
    } else {
      processedHTML = processedHTML.replace(
        /{{#each regels}}[\s\S]*?{{\/each}}/g,
        '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #666;">Geen factuurregels toegevoegd</td></tr>'
      );
    }

    // Handle conditional blocks
    // Notes conditional
    if (invoiceData.notities && invoiceData.notities.trim()) {
      processedHTML = processedHTML.replace(/{{#if notities}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      processedHTML = processedHTML.replace(/{{#if notities}}[\s\S]*?{{\/if}}/g, '');
    }

    // Logo conditional blocks - enhanced checking
    const hasLogo = companyData && companyData.logo;
    console.log('🖼️ UNIVERSAL PLACEHOLDER: Logo check result:', { hasLogo, logoValue: companyData?.logo });
    
    if (hasLogo) {
      console.log('✅ UNIVERSAL PLACEHOLDER: Processing template with logo');
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      console.log('⚠️ UNIVERSAL PLACEHOLDER: Processing template without logo');
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{\/if}}/g, '');
    }

    // Clean up any remaining unfilled placeholders
    processedHTML = processedHTML.replace(/{{[^}]+}}/g, '');

    console.log('✅ UNIVERSAL PLACEHOLDER: Replacement completed successfully');
    return processedHTML;

  } catch (error) {
    console.error('❌ UNIVERSAL PLACEHOLDER: Error during replacement:', error);
    return htmlContent; // Return original content on error
  }
};
