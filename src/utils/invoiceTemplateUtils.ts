
import { loadCompanyData } from '@/utils/companyDataMapping';

export const generatePreviewHTML = async (
  templateHtml: string,
  formData: any,
  lineItems: any[],
  invoiceNumber: string,
  organizationId?: string
) => {
  console.log('🎨 TEMPLATE UTILS: Starting preview generation with:', {
    templateHtmlLength: templateHtml?.length,
    formData: {
      client_name: formData.client_name,
      client_email: formData.client_email,
      client_address: formData.client_address,
      client_postal_code: formData.client_postal_code,
      client_city: formData.client_city,
      client_country: formData.client_country,
      hasClientData: !!(formData.client_name && formData.client_name !== '')
    },
    lineItemsCount: lineItems.length,
    invoiceNumber: invoiceNumber,
    organizationId: organizationId?.substring(0, 8) + '...'
  });
  
  if (!templateHtml || typeof templateHtml !== 'string') {
    console.error('❌ Invalid template HTML provided:', templateHtml);
    return '<p>Geen geldige template inhoud beschikbaar</p>';
  }

  let html = templateHtml;

  // Load company data from database including logo
  let companyData: Record<string, string> = {};
  if (organizationId) {
    try {
      companyData = await loadCompanyData(organizationId);
      console.log('🏢 Company data loaded for preview:', {
        bedrijfsnaam: companyData.bedrijfsnaam,
        email: companyData.email,
        adres: companyData.adres,
        hasLogo: !!(companyData.logo || companyData.bedrijfslogo || companyData.company_logo),
        logoUrl: companyData.logo || companyData.bedrijfslogo || companyData.company_logo || 'GEEN_LOGO'
      });
    } catch (error) {
      console.error('❌ Error loading company data:', error);
    }
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
  const vatAmount = lineItems.reduce((sum, item) => {
    const lineTotal = item.line_total || 0;
    const vatRate = item.vat_rate || 21;
    return sum + (lineTotal * vatRate / 100);
  }, 0);
  const total = subtotal + vatAmount;

  console.log('🧮 Calculated totals:', { subtotal, vatAmount, total });

  // Create comprehensive placeholder mapping focused on Dutch placeholders used in templates
  const replacements = {
    // Dutch invoice/document placeholders
    '{{factuurnummer}}': invoiceNumber || 'CONCEPT',
    '{{nummer}}': invoiceNumber || 'CONCEPT',
    '{{datum}}': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '{{factuurdatum}}': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '{{vervaldatum}}': formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    
    // Dutch client information - map directly from formData
    '{{klant_naam}}': formData.client_name || '[Klantnaam]',
    '{{klant_email}}': formData.client_email || '[Klant email]',
    '{{klant_adres}}': formData.client_address || '[Klant adres]',
    '{{klant_postcode}}': formData.client_postal_code || '[Postcode]',
    '{{klant_plaats}}': formData.client_city || '[Plaats]',
    '{{klant_land}}': formData.client_country || 'Nederland',
    '{{klant_telefoon}}': formData.client_phone || '[Telefoon]',
    
    // Dutch company information from database
    '{{bedrijfsnaam}}': companyData.bedrijfsnaam || '[Bedrijfsnaam]',
    '{{adres}}': companyData.adres || '[Bedrijfsadres]',
    '{{postcode}}': companyData.postcode || '[Postcode]',
    '{{plaats}}': companyData.plaats || '[Plaats]',
    '{{email}}': companyData.email || '[Email]',
    '{{telefoon}}': companyData.telefoon || '[Telefoon]',
    '{{website}}': companyData.website || '[Website]',
    '{{btw_nummer}}': companyData.btw_nummer || '[BTW nummer]',
    '{{kvk_nummer}}': companyData.kvk_nummer || '[KVK nummer]',
    '{{banknummer}}': companyData.banknummer || '[Banknummer]',
    '{{rekeningnummer}}': companyData.banknummer || '[Banknummer]',
    
    // Logo support - Dutch placeholders
    '{{logo}}': companyData.logo || companyData.bedrijfslogo || companyData.company_logo ? 
      `<img src="${companyData.logo || companyData.bedrijfslogo || companyData.company_logo}" alt="Logo" style="max-width: 200px; max-height: 100px; height: auto;" />` : 
      '[Logo niet beschikbaar]',
    '{{bedrijfslogo}}': companyData.logo || companyData.bedrijfslogo || companyData.company_logo ? 
      `<img src="${companyData.logo || companyData.bedrijfslogo || companyData.company_logo}" alt="Bedrijfslogo" style="max-width: 200px; max-height: 100px; height: auto;" />` : 
      '[Logo niet beschikbaar]',
    '{{company_logo}}': companyData.logo || companyData.bedrijfslogo || companyData.company_logo ? 
      `<img src="${companyData.logo || companyData.bedrijfslogo || companyData.company_logo}" alt="Company Logo" style="max-width: 200px; max-height: 100px; height: auto;" />` : 
      '[Logo niet beschikbaar]',
    
    // Financial totals - Dutch
    '{{subtotaal}}': `€${subtotal.toFixed(2)}`,
    '{{btw_bedrag}}': `€${vatAmount.toFixed(2)}`,
    '{{totaal}}': `€${total.toFixed(2)}`,
    '{{totaal_excl_btw}}': `€${subtotal.toFixed(2)}`,
    '{{totaal_incl_btw}}': `€${total.toFixed(2)}`,
    
    // Payment info - Dutch
    '{{betalingstermijn}}': formData.payment_terms?.toString() || '30',
    '{{opmerkingen}}': formData.notes || '',
    
    // ALSO support uppercase English placeholders for backwards compatibility
    '%INVOICE_NUMBER%': invoiceNumber || 'CONCEPT',
    '%CLIENT_NAME%': formData.client_name || '[Klantnaam]',
    '%CLIENT_EMAIL%': formData.client_email || '[Klant email]',
    '%CLIENT_ADDRESS%': formData.client_address || '[Klant adres]',
    '%CLIENT_POSTAL_CODE%': formData.client_postal_code || '[Postcode]',
    '%CLIENT_CITY%': formData.client_city || '[Plaats]',
    '%CLIENT_COUNTRY%': formData.client_country || 'Nederland',
    '%COMPANY_NAME%': companyData.bedrijfsnaam || '[Bedrijfsnaam]',
    '%COMPANY_EMAIL%': companyData.email || '[Email]',
    '%COMPANY_PHONE%': companyData.telefoon || '[Telefoon]',
    '%COMPANY_LOGO%': companyData.logo || companyData.bedrijfslogo || companyData.company_logo ? 
      `<img src="${companyData.logo || companyData.bedrijfslogo || companyData.company_logo}" alt="Company Logo" style="max-width: 200px; max-height: 100px; height: auto;" />` : 
      '[Logo niet beschikbaar]',
    '%SUBTOTAL%': `€${subtotal.toFixed(2)}`,
    '%VAT_AMOUNT%': `€${vatAmount.toFixed(2)}`,
    '%TOTAL_AMOUNT%': `€${total.toFixed(2)}`,
    '%INVOICE_DATE%': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%DUE_DATE%': formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    '%PAYMENT_TERMS%': formData.payment_terms?.toString() || '30',
    '%NOTES%': formData.notes || ''
  };

  console.log('🔄 Starting placeholder replacement with mapped data:', {
    client_name_mapping: {
      placeholder: '{{klant_naam}}',
      value: replacements['{{klant_naam}}'],
      original: formData.client_name
    },
    company_name_mapping: {
      placeholder: '{{bedrijfsnaam}}',
      value: replacements['{{bedrijfsnaam}}'],
      original: companyData.bedrijfsnaam
    },
    logo_mapping: {
      placeholder: '{{logo}}',
      hasLogo: !!(companyData.logo || companyData.bedrijfslogo || companyData.company_logo),
      logoValue: companyData.logo || companyData.bedrijfslogo || companyData.company_logo
    }
  });

  // Replace ALL placeholders with global regex
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedPlaceholder, 'g');
    html = html.replace(regex, value);
  });

  // Generate line items table
  let lineItemsHTML = '';
  if (lineItems.length > 0) {
    lineItemsHTML = lineItems.map((item, index) => {
      const lineTotal = item.line_total || 0;
      const quantity = item.quantity || 1;
      const unitPrice = item.unit_price || 0;
      const vatRate = item.vat_rate || 21;
      const description = item.description || `[Regel ${index + 1}]`;
      
      return `
        <tr>
          <td>${quantity}</td>
          <td>${description}</td>
          <td>${vatRate}%</td>
          <td style="text-align: right;">€${unitPrice.toFixed(2)}</td>
          <td style="text-align: right;">€${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');
  } else {
    lineItemsHTML = `
      <tr>
        <td colspan="5" style="padding: 20px; text-align: center; color: #6b7280; font-style: italic;">
          Geen regels toegevoegd
        </td>
      </tr>
    `;
  }

  // Replace line items placeholders
  html = html.replace(/{{regels}}/g, lineItemsHTML);
  html = html.replace(/{{factuurregels}}/g, lineItemsHTML);
  html = html.replace(/{{INVOICE_LINES}}/g, lineItemsHTML);
  html = html.replace(/%LINE_ITEMS%/g, lineItemsHTML);

  console.log('✅ Preview HTML generated successfully with Dutch placeholder mapping');

  return html;
};
