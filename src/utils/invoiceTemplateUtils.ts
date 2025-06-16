
import { loadCompanyData } from '@/utils/companyDataMapping';

export const generatePreviewHTML = async (
  availableTemplates: any[],
  selectedTemplate: string,
  formData: any,
  lineItems: any[],
  invoiceNumber: string,
  organizationId?: string
) => {
  const template = availableTemplates.find(t => t.id === selectedTemplate);
  if (!template) return '<p>Geen template geselecteerd</p>';

  let html = template.html_content || '<p>Geen template inhoud beschikbaar</p>';

  // Load company data from database
  let companyData: Record<string, string> = {};
  if (organizationId) {
    try {
      companyData = await loadCompanyData(organizationId);
      console.log('🏢 Company data loaded for invoice preview:', companyData);
    } catch (error) {
      console.error('❌ Error loading company data for invoice:', error);
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

  // Extended placeholder replacements with company data and form data
  const replacements = {
    // Invoice/Quote details - all variations
    '%INVOICE_NUMBER%': invoiceNumber || 'CONCEPT',
    '%QUOTE_NUMBER%': invoiceNumber || 'CONCEPT',
    '%DOCUMENT_NUMBER%': invoiceNumber || 'CONCEPT',
    '%FACTUURNUMMER%': invoiceNumber || 'CONCEPT',
    '%OFFERTENUMMER%': invoiceNumber || 'CONCEPT',
    '%NUMMER%': invoiceNumber || 'CONCEPT',
    '%DOC_NUMMER%': invoiceNumber || 'CONCEPT',
    '{{factuurnummer}}': invoiceNumber || 'CONCEPT',
    '{{nummer}}': invoiceNumber || 'CONCEPT',
    
    // Client information - all variations
    '%CLIENT_NAME%': formData.client_name || '[Klantnaam]',
    '%CLIENT_EMAIL%': formData.client_email || '[Klant email]',
    '%CLIENT_ADDRESS%': formData.client_address || '[Klant adres]',
    '%CLIENT_POSTAL_CODE%': formData.client_postal_code || '[Postcode]',
    '%CLIENT_CITY%': formData.client_city || '[Plaats]',
    '%CLIENT_COUNTRY%': formData.client_country || 'Nederland',
    '%KLANTNAAM%': formData.client_name || '[Klantnaam]',
    '%KLANT_EMAIL%': formData.client_email || '[Klant email]',
    '%KLANT_ADRES%': formData.client_address || '[Klant adres]',
    '%KLANT_POSTCODE%': formData.client_postal_code || '[Postcode]',
    '%KLANT_PLAATS%': formData.client_city || '[Plaats]',
    '%KLANT_LAND%': formData.client_country || 'Nederland',
    '%NAAM%': formData.client_name || '[Klantnaam]',
    '%EMAIL%': formData.client_email || '[Klant email]',
    '%ADRES%': formData.client_address || '[Klant adres]',
    '%POSTCODE%': formData.client_postal_code || '[Postcode]',
    '%PLAATS%': formData.client_city || '[Plaats]',
    '%LAND%': formData.client_country || 'Nederland',
    '{{klantnaam}}': formData.client_name || '[Klantnaam]',
    '{{klant_email}}': formData.client_email || '[Klant email]',
    '{{klant_adres}}': formData.client_address || '[Klant adres]',
    
    // Dates - all variations
    '%INVOICE_DATE%': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%QUOTE_DATE%': formData.quote_date || formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%DUE_DATE%': formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    '%VALID_UNTIL%': formData.valid_until || formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    '%FACTUURDATUM%': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%OFFERTEDATUM%': formData.quote_date || formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%VERVALDATUM%': formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    '%GELDIG_TOT%': formData.valid_until || formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    '%DATUM%': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '{{datum}}': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '{{factuurdatum}}': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    
    // Terms and conditions - all variations
    '%PAYMENT_TERMS%': formData.payment_terms?.toString() || '30',
    '%NOTES%': formData.notes || '',
    '%BETALINGSVOORWAARDEN%': formData.payment_terms?.toString() || '30',
    '%OPMERKINGEN%': formData.notes || '',
    '%BETALINGSTERMIJN%': formData.payment_terms?.toString() || '30',
    '%NOTITIES%': formData.notes || '',
    '%VOORWAARDEN%': formData.payment_terms?.toString() || '30',
    '{{betalingstermijn}}': formData.payment_terms?.toString() || '30',
    '{{opmerkingen}}': formData.notes || '',
    
    // Financial totals - all variations
    '%SUBTOTAL%': `€${subtotal.toFixed(2)}`,
    '%VAT_AMOUNT%': `€${vatAmount.toFixed(2)}`,
    '%TOTAL_AMOUNT%': `€${total.toFixed(2)}`,
    '%SUBTOTAAL%': `€${subtotal.toFixed(2)}`,
    '%BTW_BEDRAG%': `€${vatAmount.toFixed(2)}`,
    '%TOTAAL_BEDRAG%': `€${total.toFixed(2)}`,
    '%TOTAAL%': `€${total.toFixed(2)}`,
    '%BEDRAG%': `€${total.toFixed(2)}`,
    '%SUBTOTAAL_EXCL%': `€${subtotal.toFixed(2)}`,
    '%BTW%': `€${vatAmount.toFixed(2)}`,
    '%INCL_BTW%': `€${total.toFixed(2)}`,
    '{{subtotaal}}': `€${subtotal.toFixed(2)}`,
    '{{btw_bedrag}}': `€${vatAmount.toFixed(2)}`,
    '{{totaal}}': `€${total.toFixed(2)}`,
    
    // Company information from database - all variations
    '%COMPANY_NAME%': companyData.bedrijfsnaam || '[Bedrijfsnaam]',
    '%COMPANY_ADDRESS%': companyData.adres || '[Bedrijfsadres]',
    '%COMPANY_POSTAL_CODE%': companyData.postcode || '[Postcode]',
    '%COMPANY_CITY%': companyData.plaats || '[Plaats]',
    '%COMPANY_EMAIL%': companyData.email || '[Email]',
    '%COMPANY_PHONE%': companyData.telefoon || '[Telefoon]',
    '%COMPANY_WEBSITE%': companyData.website || '[Website]',
    '%COMPANY_VAT%': companyData.btw_nummer || '[BTW nummer]',
    '%COMPANY_KVK%': companyData.kvk_nummer || '[KVK nummer]',
    '%COMPANY_BANK%': companyData.banknummer || '[Banknummer]',
    '%BEDRIJFSNAAM%': companyData.bedrijfsnaam || '[Bedrijfsnaam]',
    '%BEDRIJFS_ADRES%': companyData.adres || '[Bedrijfsadres]',
    '%BEDRIJFS_EMAIL%': companyData.email || '[Email]',
    '%BEDRIJFS_TELEFOON%': companyData.telefoon || '[Telefoon]',
    '%BTW_NUMMER%': companyData.btw_nummer || '[BTW nummer]',
    '%ORGANISATIE%': companyData.bedrijfsnaam || '[Bedrijfsnaam]',
    '%ORGANISATIE_ADRES%': companyData.adres || '[Bedrijfsadres]',
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
    
    // Payment information - all variations
    '%PAYMENT_INFO%': `Betaling op rekening ${companyData.banknummer || 'NL77 ABNA 0885 5296 34'} op naam van ${companyData.bedrijfsnaam || 'debuitendoor.nl'}`,
    '%BETALINGSINFO%': `Betaling op rekening ${companyData.banknummer || 'NL77 ABNA 0885 5296 34'} op naam van ${companyData.bedrijfsnaam || 'debuitendoor.nl'}`,
    '%BETALINGSGEGEVENS%': `Betaling op rekening ${companyData.banknummer || 'NL77 ABNA 0885 5296 34'} op naam van ${companyData.bedrijfsnaam || 'debuitendoor.nl'}`,
    '%REKENINGNUMMER%': companyData.banknummer || 'NL77 ABNA 0885 5296 34',
    '%IBAN%': companyData.banknummer || 'NL77 ABNA 0885 5296 34',
    '%REKENING%': companyData.banknummer || 'NL77 ABNA 0885 5296 34',
    '{{rekeningnummer}}': companyData.banknummer || 'NL77 ABNA 0885 5296 34'
  };

  // Replace ALL placeholders with global regex
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(escapedPlaceholder, 'g'), value);
  });

  // Generate proper line items table with complete formatting
  let lineItemsHTML = '';
  if (lineItems.length > 0) {
    lineItemsHTML = lineItems.map((item, index) => {
      const lineTotal = item.line_total || 0;
      const quantity = item.quantity || 1;
      const unitPrice = item.unit_price || 0;
      const vatRate = item.vat_rate || 21;
      const description = item.description || `[Regel ${index + 1}]`;
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; text-align: left; border-right: 1px solid #e5e7eb;">${description}</td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #e5e7eb;">${quantity}</td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #e5e7eb;">€${unitPrice.toFixed(2)}</td>
          <td style="padding: 8px; text-align: right; border-right: 1px solid #e5e7eb;">${vatRate}%</td>
          <td style="padding: 8px; text-align: right; font-weight: bold;">€${lineTotal.toFixed(2)}</td>
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

  // Replace line items placeholder
  html = html.replace(/%LINE_ITEMS%/g, lineItemsHTML);
  html = html.replace(/%REGELS%/g, lineItemsHTML);
  html = html.replace(/%FACTUURREGELS%/g, lineItemsHTML);
  html = html.replace(/%OFFERTEREGELS%/g, lineItemsHTML);
  html = html.replace(/{{regels}}/g, lineItemsHTML);
  html = html.replace(/{{factuurregels}}/g, lineItemsHTML);
  
  // If there's a table structure, ensure it's properly formatted with Dutch headers
  const tableHeader = `
    <tr style="background-color: #f3f4f6; font-weight: bold;">
      <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db; border-right: 1px solid #d1d5db;">Omschrijving</th>
      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db; border-right: 1px solid #d1d5db;">Aantal</th>
      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db; border-right: 1px solid #d1d5db;">Prijs</th>
      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db; border-right: 1px solid #d1d5db;">BTW</th>
      <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db;">Totaal</th>
    </tr>
  `;
  
  html = html.replace(/%TABLE_HEADER%/g, tableHeader);
  html = html.replace(/%TABEL_HEADER%/g, tableHeader);
  html = html.replace(/{{tabel_header}}/g, tableHeader);

  console.log('🎨 PREVIEW: HTML generated with company data integration');
  console.log('🎨 PREVIEW: Replaced', Object.keys(replacements).length, 'placeholder types');

  return html;
};
