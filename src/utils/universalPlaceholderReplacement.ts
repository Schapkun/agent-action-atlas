
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
    // Load company data including logo with enhanced debugging
    const companyData = organizationId ? await loadCompanyData(organizationId) : {};
    console.log('🏢 UNIVERSAL PLACEHOLDER: Company data loaded:', {
      hasData: Object.keys(companyData).length > 0,
      logoKeys: Object.keys(companyData).filter(key => key.toLowerCase().includes('logo')),
      primaryLogo: companyData && typeof companyData === 'object' && 'logo' in companyData ? !!companyData.logo : false
    });

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

    console.log('🎨 UNIVERSAL PLACEHOLDER: All placeholders prepared:', {
      totalPlaceholders: Object.keys(allPlaceholders).length,
      logoKeys: Object.keys(allPlaceholders).filter(key => 
        key.toLowerCase().includes('logo')),
      hasMainLogo: !!(allPlaceholders as any).logo
    });

    // Replace all standard placeholders
    Object.entries(allPlaceholders).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const beforeCount = (processedHTML.match(regex) || []).length;
      processedHTML = processedHTML.replace(regex, String(value || ''));
      const afterCount = (processedHTML.match(regex) || []).length;
      
      if (key.toLowerCase().includes('logo') && beforeCount > 0) {
        console.log(`🖼️ LOGO REPLACEMENT: ${key}: ${beforeCount} -> ${afterCount} (value: ${value ? 'present' : 'empty'})`);
      }
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

    // Logo conditional blocks - enhanced checking with safe property access and better debugging
    const hasLogo = companyData && typeof companyData === 'object' && 'logo' in companyData && companyData.logo;
    console.log('🖼️ UNIVERSAL PLACEHOLDER: Logo conditional check:', { 
      hasLogo, 
      logoValue: companyData && typeof companyData === 'object' && 'logo' in companyData ? companyData.logo : 'undefined',
      logoConditionalBlocks: (processedHTML.match(/{{#if logo}}/g) || []).length
    });
    
    if (hasLogo) {
      console.log('✅ UNIVERSAL PLACEHOLDER: Processing template WITH logo');
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      console.log('⚠️ UNIVERSAL PLACEHOLDER: Processing template WITHOUT logo');
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{\/if}}/g, '');
    }

    // Clean up any remaining unfilled placeholders
    const remainingPlaceholders = processedHTML.match(/{{[^}]+}}/g) || [];
    if (remainingPlaceholders.length > 0) {
      console.log('🧹 UNIVERSAL PLACEHOLDER: Cleaning remaining placeholders:', remainingPlaceholders.slice(0, 5));
    }
    processedHTML = processedHTML.replace(/{{[^}]+}}/g, '');

    console.log('✅ UNIVERSAL PLACEHOLDER: Replacement completed successfully');
    return processedHTML;

  } catch (error) {
    console.error('❌ UNIVERSAL PLACEHOLDER: Error during replacement:', error);
    return htmlContent; // Return original content on error
  }
};
