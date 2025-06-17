
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
  
  let processedHTML = htmlContent;

  try {
    // Load company data
    const companyData = organizationId ? await loadCompanyData(organizationId) : {};

    // Build complete replacement map
    const allPlaceholders: Record<string, any> = {
      ...companyData,
      ...placeholderValues,
      ...invoiceData,
      datum: new Date().toLocaleDateString('nl-NL')
    };

    // SIMPLE LOGO REPLACEMENT FIRST
    if (allPlaceholders.logo && String(allPlaceholders.logo).trim().length > 0) {
      const logoValue = String(allPlaceholders.logo);
      console.log('🖼️ Replacing {{logo}} with:', logoValue.substring(0, 50) + '...');
      processedHTML = processedHTML.replace(/\{\{logo\}\}/g, logoValue);
    }

    // Replace all other placeholders
    Object.entries(allPlaceholders).forEach(([key, value]) => {
      if (key !== 'logo') {
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedHTML = processedHTML.replace(regex, String(value || ''));
      }
    });

    // Handle line items
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
    if (invoiceData.notities && invoiceData.notities.trim()) {
      processedHTML = processedHTML.replace(/{{#if notities}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      processedHTML = processedHTML.replace(/{{#if notities}}[\s\S]*?{{\/if}}/g, '');
    }

    // Logo conditional blocks
    const hasValidLogo = allPlaceholders.logo && String(allPlaceholders.logo).trim().length > 0;
    if (hasValidLogo) {
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{\/if}}/g, '');
    }

    // Clean up remaining placeholders
    processedHTML = processedHTML.replace(/{{[^}]+}}/g, '');
    
    return processedHTML;

  } catch (error) {
    console.error('❌ Error during placeholder replacement:', error);
    return htmlContent;
  }
};
