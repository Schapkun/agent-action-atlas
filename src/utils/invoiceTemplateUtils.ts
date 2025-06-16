export const generatePreviewHTML = (
  availableTemplates: any[],
  selectedTemplate: string,
  formData: any,
  lineItems: any[],
  invoiceNumber: string,
  getDefaultInvoiceNumber: () => Promise<string>
) => {
  const template = availableTemplates.find(t => t.id === selectedTemplate);
  if (!template) return '<p>Geen template geselecteerd</p>';

  let html = template.html_content || '<p>Geen template inhoud beschikbaar</p>';

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
  const vatAmount = lineItems.reduce((sum, item) => {
    const lineTotal = item.line_total || 0;
    const vatRate = item.vat_rate || 21;
    return sum + (lineTotal * vatRate / 100);
  }, 0);
  const total = subtotal + vatAmount;

  // FIXED: Complete placeholder replacements with ALL possible values
  const replacements = {
    // Invoice/Quote details
    '%INVOICE_NUMBER%': invoiceNumber || 'CONCEPT',
    '%QUOTE_NUMBER%': invoiceNumber || 'CONCEPT',
    '%DOCUMENT_NUMBER%': invoiceNumber || 'CONCEPT',
    '%FACTUURNUMMER%': invoiceNumber || 'CONCEPT',
    '%OFFERTENUMMER%': invoiceNumber || 'CONCEPT',
    
    // Client information
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
    
    // Dates
    '%INVOICE_DATE%': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%QUOTE_DATE%': formData.quote_date || formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%DUE_DATE%': formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    '%VALID_UNTIL%': formData.valid_until || formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    '%FACTUURDATUM%': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%OFFERTEDATUM%': formData.quote_date || formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%VERVALDATUM%': formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    '%GELDIG_TOT%': formData.valid_until || formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    
    // Terms and conditions
    '%PAYMENT_TERMS%': formData.payment_terms?.toString() || '30',
    '%NOTES%': formData.notes || '',
    '%BETALINGSVOORWAARDEN%': formData.payment_terms?.toString() || '30',
    '%OPMERKINGEN%': formData.notes || '',
    
    // Financial totals
    '%SUBTOTAL%': `€${subtotal.toFixed(2)}`,
    '%VAT_AMOUNT%': `€${vatAmount.toFixed(2)}`,
    '%TOTAL_AMOUNT%': `€${total.toFixed(2)}`,
    '%SUBTOTAAL%': `€${subtotal.toFixed(2)}`,
    '%BTW_BEDRAG%': `€${vatAmount.toFixed(2)}`,
    '%TOTAAL_BEDRAG%': `€${total.toFixed(2)}`,
    '%TOTAAL%': `€${total.toFixed(2)}`,
    
    // Other common placeholders
    '%PAYMENT_INFO%': 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl',
    '%BETALINGSINFO%': 'Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendoor.nl',
    '%COMPANY_NAME%': 'De Buitendeur',
    '%COMPANY_ADDRESS%': '[Bedrijfsadres]',
    '%COMPANY_EMAIL%': 'info@debuitendoor.nl',
    '%COMPANY_PHONE%': '[Bedrijfs telefoon]',
    '%COMPANY_VAT%': '[BTW nummer]',
    '%BEDRIJFSNAAM%': 'De Buitendeur',
    '%BEDRIJFS_ADRES%': '[Bedrijfsadres]',
    '%BEDRIJFS_EMAIL%': 'info@debuitendoor.nl',
    '%BEDRIJFS_TELEFOON%': '[Bedrijfs telefoon]',
    '%BTW_NUMMER%': '[BTW nummer]'
  };

  // FIXED: Replace ALL placeholders with proper regex escaping
  Object.entries(replacements).forEach(([placeholder, value]) => {
    const escapedPlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(escapedPlaceholder, 'g'), value);
  });

  // FIXED: Generate proper line items table with complete formatting
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
  
  // FIXED: If there's a table structure, ensure it's properly formatted with Dutch headers
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

  console.log('🎨 PREVIEW: HTML generated with replaced placeholders');
  console.log('🎨 PREVIEW: Line items count:', lineItems.length);
  console.log('🎨 PREVIEW: Totals - Subtotal:', subtotal, 'VAT:', vatAmount, 'Total:', total);

  return html;
};
