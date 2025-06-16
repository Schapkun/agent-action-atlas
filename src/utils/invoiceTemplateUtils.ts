
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

  // Replace placeholders with actual values
  const replacements = {
    '%INVOICE_NUMBER%': invoiceNumber || 'CONCEPT',
    '%CLIENT_NAME%': formData.client_name || '[Klantnaam]',
    '%CLIENT_EMAIL%': formData.client_email || '[Klant email]',
    '%CLIENT_ADDRESS%': formData.client_address || '[Klant adres]',
    '%CLIENT_POSTAL_CODE%': formData.client_postal_code || '[Postcode]',
    '%CLIENT_CITY%': formData.client_city || '[Plaats]',
    '%CLIENT_COUNTRY%': formData.client_country || 'Nederland',
    '%INVOICE_DATE%': formData.invoice_date || new Date().toLocaleDateString('nl-NL'),
    '%DUE_DATE%': formData.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL'),
    '%PAYMENT_TERMS%': formData.payment_terms?.toString() || '30',
    '%NOTES%': formData.notes || ''
  };

  // Replace all placeholders
  Object.entries(replacements).forEach(([placeholder, value]) => {
    html = html.replace(new RegExp(placeholder, 'g'), value);
  });

  // Generate line items table
  const lineItemsHTML = lineItems.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description || '[Omschrijving]'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.quantity || 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${(item.unit_price || 0).toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.vat_rate || 21}%</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">€${(item.line_total || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  const subtotal = lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
  const vatAmount = lineItems.reduce((sum, item) => sum + ((item.line_total || 0) * (item.vat_rate || 21) / 100), 0);
  const total = subtotal + vatAmount;

  // Replace line items placeholder
  html = html.replace('%LINE_ITEMS%', lineItemsHTML);
  html = html.replace('%SUBTOTAL%', `€${subtotal.toFixed(2)}`);
  html = html.replace('%VAT_AMOUNT%', `€${vatAmount.toFixed(2)}`);
  html = html.replace('%TOTAL_AMOUNT%', `€${total.toFixed(2)}`);

  return html;
};
