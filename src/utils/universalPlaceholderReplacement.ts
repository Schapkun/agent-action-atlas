
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
  
  console.log('🔄 UNIVERSAL PLACEHOLDER: Starting replacement');
  console.log('🔍 UNIVERSAL PLACEHOLDER: Original HTML contains logo placeholder:', htmlContent.includes('{{logo}}'));

  let processedHTML = htmlContent;

  try {
    // Load company data including logo
    const companyData = organizationId ? await loadCompanyData(organizationId) : {};
    console.log('🏢 UNIVERSAL PLACEHOLDER: Company data loaded:', {
      hasLogo: !!(companyData as any).logo,
      logoValue: (companyData as any).logo ? String((companyData as any).logo).substring(0, 50) + '...' : 'NONE'
    });

    // Combine all data sources
    const allPlaceholders: Record<string, any> = {
      // Company data (includes logo)
      ...companyData,
      // User-provided placeholder values
      ...placeholderValues,
      // Invoice-specific data
      ...invoiceData,
      // Current date
      datum: new Date().toLocaleDateString('nl-NL')
    };

    console.log('🎨 UNIVERSAL PLACEHOLDER: All placeholders:', {
      totalPlaceholders: Object.keys(allPlaceholders).length,
      hasLogo: !!allPlaceholders.logo,
      logoValue: allPlaceholders.logo ? 'HAS_VALUE' : 'EMPTY'
    });

    // CRITICAL: Replace logo placeholder FIRST and with extra logging
    if (allPlaceholders.logo) {
      const logoReplacements = processedHTML.match(/\{\{logo\}\}/g) || [];
      console.log('🖼️ LOGO REPLACEMENT: Found logo placeholders:', logoReplacements.length);
      console.log('🖼️ LOGO REPLACEMENT: Logo URL will be:', allPlaceholders.logo);
      
      processedHTML = processedHTML.replace(/\{\{logo\}\}/g, String(allPlaceholders.logo));
      
      const remainingLogoPlaceholders = processedHTML.match(/\{\{logo\}\}/g) || [];
      console.log('🖼️ LOGO REPLACEMENT: Remaining placeholders after replacement:', remainingLogoPlaceholders.length);
      console.log('🖼️ LOGO REPLACEMENT: HTML now contains logo URL:', processedHTML.includes(String(allPlaceholders.logo)));
    } else {
      console.log('⚠️ LOGO REPLACEMENT: No logo URL available for replacement');
    }

    // Replace all other standard placeholders
    Object.entries(allPlaceholders).forEach(([key, value]) => {
      if (key !== 'logo') { // Skip logo as we already handled it
        const regex = new RegExp(`{{${key}}}`, 'g');
        processedHTML = processedHTML.replace(regex, String(value || ''));
      }
    });

    // Handle line items table generation
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
    console.log('🖼️ UNIVERSAL PLACEHOLDER: Logo conditional check:', { 
      hasValidLogo, 
      logoValue: allPlaceholders.logo ? String(allPlaceholders.logo).substring(0, 50) + '...' : 'NONE'
    });
    
    if (hasValidLogo) {
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{\/if}}/g, '');
    }

    // Clean up remaining placeholders
    processedHTML = processedHTML.replace(/{{[^}]+}}/g, '');

    console.log('✅ UNIVERSAL PLACEHOLDER: Replacement completed');
    console.log('🔍 UNIVERSAL PLACEHOLDER: Final HTML contains logo URL:', processedHTML.includes(String(allPlaceholders.logo || '')));
    
    return processedHTML;

  } catch (error) {
    console.error('❌ UNIVERSAL PLACEHOLDER: Error during replacement:', error);
    return htmlContent;
  }
};
