
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
  
  console.log('🔄 UNIVERSAL PLACEHOLDER: Starting replacement process');
  console.log('🔍 INPUT HTML contains {{logo}}:', htmlContent.includes('{{logo}}'));
  console.log('🔍 INPUT HTML logo occurrences:', (htmlContent.match(/\{\{logo\}\}/g) || []).length);

  let processedHTML = htmlContent;

  try {
    // Step 1: Load company data first
    console.log('📋 STEP 1: Loading company data...');
    const companyData = organizationId ? await loadCompanyData(organizationId) : {};
    console.log('✅ Company data loaded:', {
      hasLogo: !!(companyData as any).logo,
      logoLength: (companyData as any).logo ? String((companyData as any).logo).length : 0
    });

    // Step 2: Build complete replacement map
    console.log('📋 STEP 2: Building replacement map...');
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

    console.log('📋 All placeholders ready:', {
      totalCount: Object.keys(allPlaceholders).length,
      hasLogo: !!allPlaceholders.logo,
      logoType: allPlaceholders.logo ? (String(allPlaceholders.logo).startsWith('data:') ? 'base64' : 'url') : 'none'
    });

    // Step 3: CRITICAL LOGO REPLACEMENT FIRST
    console.log('📋 STEP 3: Processing logo replacement...');
    if (allPlaceholders.logo && String(allPlaceholders.logo).trim().length > 0) {
      const logoValue = String(allPlaceholders.logo);
      console.log('🖼️ REPLACING {{logo}} with:', logoValue.substring(0, 100) + '...');
      
      // Count occurrences before replacement
      const beforeCount = (processedHTML.match(/\{\{logo\}\}/g) || []).length;
      console.log('🔍 Logo placeholders found:', beforeCount);
      
      // Perform replacement
      processedHTML = processedHTML.replace(/\{\{logo\}\}/g, logoValue);
      
      // Count occurrences after replacement
      const afterCount = (processedHTML.match(/\{\{logo\}\}/g) || []).length;
      console.log('🔍 Logo placeholders remaining:', afterCount);
      console.log('✅ Logo replacement completed:', beforeCount - afterCount, 'replacements made');
      
      // Verify the logo URL is now in the HTML
      const containsLogoUrl = processedHTML.includes(logoValue);
      console.log('🔍 HTML now contains logo URL:', containsLogoUrl);
      
    } else {
      console.log('⚠️ NO LOGO DATA AVAILABLE for replacement');
    }

    // Step 4: Replace all other placeholders
    console.log('📋 STEP 4: Processing other placeholders...');
    Object.entries(allPlaceholders).forEach(([key, value]) => {
      if (key !== 'logo') { // Skip logo as we already handled it
        const regex = new RegExp(`{{${key}}}`, 'g');
        const replacements = (processedHTML.match(regex) || []).length;
        if (replacements > 0) {
          processedHTML = processedHTML.replace(regex, String(value || ''));
          console.log(`✅ Replaced {{${key}}} - ${replacements} occurrences`);
        }
      }
    });

    // Step 5: Handle line items table generation
    console.log('📋 STEP 5: Processing line items...');
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
      console.log('✅ Line items processed:', lineItems.length, 'items');
    } else {
      processedHTML = processedHTML.replace(
        /{{#each regels}}[\s\S]*?{{\/each}}/g,
        '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #666;">Geen factuurregels toegevoegd</td></tr>'
      );
      console.log('✅ No line items - placeholder message added');
    }

    // Step 6: Handle conditional blocks
    console.log('📋 STEP 6: Processing conditional blocks...');
    
    // Notes conditional
    if (invoiceData.notities && invoiceData.notities.trim()) {
      processedHTML = processedHTML.replace(/{{#if notities}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      processedHTML = processedHTML.replace(/{{#if notities}}[\s\S]*?{{\/if}}/g, '');
    }

    // Logo conditional blocks
    const hasValidLogo = allPlaceholders.logo && String(allPlaceholders.logo).trim().length > 0;
    console.log('🖼️ Logo conditional processing:', { hasValidLogo });
    
    if (hasValidLogo) {
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
      processedHTML = processedHTML.replace(/{{#if logo}}[\s\S]*?{{\/if}}/g, '');
    }

    // Step 7: Clean up any remaining placeholders
    console.log('📋 STEP 7: Cleaning up remaining placeholders...');
    const remainingPlaceholders = processedHTML.match(/{{[^}]+}}/g) || [];
    console.log('🔍 Remaining placeholders found:', remainingPlaceholders);
    
    processedHTML = processedHTML.replace(/{{[^}]+}}/g, '');

    // Final verification
    console.log('✅ UNIVERSAL PLACEHOLDER REPLACEMENT COMPLETED');
    console.log('🔍 Final verification:');
    console.log('   - Contains {{logo}}:', processedHTML.includes('{{logo}}'));
    console.log('   - Contains logo URL:', allPlaceholders.logo ? processedHTML.includes(String(allPlaceholders.logo)) : false);
    console.log('   - Total HTML length:', processedHTML.length);
    
    return processedHTML;

  } catch (error) {
    console.error('❌ UNIVERSAL PLACEHOLDER: Critical error during replacement:', error);
    console.error('❌ Returning original HTML content due to error');
    return htmlContent;
  }
};
