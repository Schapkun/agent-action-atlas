
import { loadCompanyData } from './companyDataMapping';
import { getOrganizationLogo, insertLogoIntoHtml } from './logoService';

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
  
  console.log('🚀 NEW UNIVERSAL SYSTEM: Starting replacement');
  
  let processedHTML = htmlContent;

  try {
    // 1. LOGO FIRST - most important
    if (organizationId) {
      const { logoUrl } = await getOrganizationLogo(organizationId);
      processedHTML = insertLogoIntoHtml(processedHTML, logoUrl);
    }

    // 2. Load company data
    const companyData = organizationId ? await loadCompanyData(organizationId) : {};
    
    // 3. Combine all placeholders
    const allPlaceholders: Record<string, any> = {
      ...companyData,
      ...placeholderValues,
      ...invoiceData,
      datum: new Date().toLocaleDateString('nl-NL')
    };

    // 4. Replace standard placeholders
    Object.entries(allPlaceholders).forEach(([key, value]) => {
      if (key !== 'logo') { // Logo already handled
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        processedHTML = processedHTML.replace(regex, String(value || ''));
      }
    });

    // 5. Handle line items
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
        /\{\{#each regels\}\}[\s\S]*?\{\{\/each\}\}/g,
        lineItemsHTML
      );
    } else {
      processedHTML = processedHTML.replace(
        /\{\{#each regels\}\}[\s\S]*?\{\{\/each\}\}/g,
        '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #666;">Geen factuurregels toegevoegd</td></tr>'
      );
    }

    // 6. Handle other conditionals
    if (invoiceData.notities && invoiceData.notities.trim()) {
      processedHTML = processedHTML.replace(/\{\{#if notities\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1');
    } else {
      processedHTML = processedHTML.replace(/\{\{#if notities\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    // 7. Clean up remaining placeholders
    processedHTML = processedHTML.replace(/\{\{[^}]+\}\}/g, '');

    console.log('✅ NEW UNIVERSAL SYSTEM: Replacement completed successfully');
    return processedHTML;

  } catch (error) {
    console.error('❌ NEW UNIVERSAL SYSTEM: Error during replacement:', error);
    return htmlContent;
  }
};
