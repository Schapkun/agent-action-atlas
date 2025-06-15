
import { format } from 'date-fns';
import { InvoiceFormData, LineItem } from '@/hooks/useInvoiceForm';

export const generatePreviewHTML = (
  availableTemplates: any[],
  selectedTemplate: string,
  formData: InvoiceFormData,
  lineItems: LineItem[],
  invoiceNumber: string,
  getDefaultInvoiceNumber: () => string
) => {
  const selectedTemplateData = availableTemplates.find(t => t.id === selectedTemplate);
  const { subtotal, vatAmount, total } = calculateTotalsFromItems(lineItems);
  
  console.log('Generating preview with template:', selectedTemplateData?.name);
  console.log('Current form data:', formData);
  console.log('Line items for preview:', lineItems);
  
  if (!selectedTemplateData) {
    console.log('No template selected, using default layout');
    return generateDefaultPreviewHTML(formData, lineItems, invoiceNumber, getDefaultInvoiceNumber, subtotal, vatAmount, total);
  }

  console.log('Using custom template:', selectedTemplateData.name);
  console.log('Template HTML content:', selectedTemplateData.html_content);
  
  let templateHTML = selectedTemplateData.html_content;

  const lineItemsHTML = lineItems.map((item, index) => {
    const cleanDescription = item.description.replace(/<[^>]*>/g, '').trim() || `Product ${index + 1}`;
    
    return `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${cleanDescription}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">€ ${item.unit_price.toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.vat_rate}%</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">€ ${item.line_total.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return format(new Date(), 'dd-MM-yyyy');
    try {
      return format(new Date(dateString), 'dd-MM-yyyy');
    } catch {
      return dateString;
    }
  };

  // Use actual form data instead of hardcoded values
  const companyName = 'Uw Bedrijf'; // This should come from settings
  const companyAddress = 'Uw Adres';
  const companyPostal = '0000 XX';
  const companyCity = 'Uw Plaats';
  const companyEmail = 'info@uwbedrijf.nl';

  const placeholderReplacements = {
    'bedrijfsnaam': companyName,
    'company_name': companyName,
    'onderwerp': 'Factuur',
    'factuurnummer': invoiceNumber || getDefaultInvoiceNumber(),
    'invoice_number': invoiceNumber || getDefaultInvoiceNumber(),
    'factuurdatum': formatDisplayDate(formData.invoice_date),
    'invoice_date': formatDisplayDate(formData.invoice_date),
    'vervaldatum': formatDisplayDate(formData.due_date),
    'due_date': formatDisplayDate(formData.due_date),
    'datum': formatDisplayDate(formData.invoice_date),
    'klantnaam': formData.client_name || 'Naam klant',
    'client_name': formData.client_name || 'Naam klant',
    'customer_name': formData.client_name || 'Naam klant',
    'klantadres': formData.client_address || 'Adres',
    'client_address': formData.client_address || 'Adres',
    'customer_address': formData.client_address || 'Adres',
    'postcode': formData.client_postal_code || '0000 XX',
    'client_postal_code': formData.client_postal_code || '0000 XX',
    'customer_postal_code': formData.client_postal_code || '0000 XX',
    'plaats': formData.client_city || 'Plaats',
    'client_city': formData.client_city || 'Plaats',
    'customer_city': formData.client_city || 'Plaats',
    'land': formData.client_country || 'Nederland',
    'client_country': formData.client_country || 'Nederland',
    'email': formData.client_email || 'email@voorbeeld.nl',
    'client_email': formData.client_email || 'email@voorbeeld.nl',
    'subtotaal': `€ ${subtotal.toFixed(2)}`,
    'subtotal': `€ ${subtotal.toFixed(2)}`,
    'btw': `€ ${vatAmount.toFixed(2)}`,
    'vat_amount': `€ ${vatAmount.toFixed(2)}`,
    'totaal': `€ ${total.toFixed(2)}`,
    'total': `€ ${total.toFixed(2)}`,
    'total_amount': `€ ${total.toFixed(2)}`,
    'betalingstermijn': formData.payment_terms?.toString() || '30',
    'payment_terms': formData.payment_terms?.toString() || '30',
    'productregels': lineItemsHTML,
    'line_items': lineItemsHTML,
    'regels': lineItemsHTML,
    'opmerkingen': formData.notes || '',
    'notes': formData.notes || '',
    'referentie': invoiceNumber || getDefaultInvoiceNumber(),
    'reference': invoiceNumber || getDefaultInvoiceNumber()
  };

  console.log('Available placeholders for replacement:', Object.keys(placeholderReplacements));

  Object.entries(placeholderReplacements).forEach(([key, value]) => {
    const variations = [
      `{{${key}}}`,
      `{{${key.toUpperCase()}}}`,
      `{{${key.toLowerCase()}}}`,
      `{${key}}`,
      `{${key.toUpperCase()}}`,
      `{${key.toLowerCase()}}`,
      `%${key}%`,
      `%${key.toUpperCase()}%`,
      `%${key.toLowerCase()}%`
    ];
    
    variations.forEach(pattern => {
      const regex = new RegExp(pattern.replace(/[{}%]/g, '\\$&'), 'gi');
      templateHTML = templateHTML.replace(regex, value);
    });
  });

  console.log('Template HTML after placeholder replacement (first 500 chars):', templateHTML.substring(0, 500));
  console.log('Placeholders replaced:', Object.keys(placeholderReplacements));
  
  return templateHTML;
};

export const generateDefaultPreviewHTML = (
  formData: InvoiceFormData,
  lineItems: LineItem[],
  invoiceNumber: string,
  getDefaultInvoiceNumber: () => string,
  subtotal: number,
  vatAmount: number,
  total: number
) => {
  const lineItemsHTML = lineItems.map((item, index) => {
    const cleanDescription = item.description.replace(/<[^>]*>/g, '').trim() || `Product ${index + 1}`;
    return `
      <tr>
        <td style="border: 1px solid #ccc; padding: 8px;">${cleanDescription}</td>
        <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">€ ${item.unit_price.toFixed(2)}</td>
        <td style="border: 1px solid #ccc; padding: 8px; text-align: center;">${item.vat_rate}%</td>
        <td style="border: 1px solid #ccc; padding: 8px; text-align: right;">€ ${item.line_total.toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return format(new Date(), 'dd-MM-yyyy');
    try {
      return format(new Date(dateString), 'dd-MM-yyyy');
    } catch {
      return dateString;
    }
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
            width: 210mm;
            min-height: 297mm;
            box-sizing: border-box;
          }
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            color: #333;
            border-bottom: 2px solid #1e40af;
            padding-bottom: 20px;
          }
          .company-info {
            text-align: center;
            margin-bottom: 20px;
          }
          .invoice-details { 
            margin-bottom: 30px; 
            display: flex;
            justify-content: space-between;
          }
          .client-info { 
            margin-bottom: 30px; 
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
          }
          th, td { 
            border: 1px solid #ccc; 
            padding: 12px 8px; 
            text-align: left; 
          }
          th { 
            background-color: #1e40af; 
            color: white;
            font-weight: bold;
          }
          .totals { 
            text-align: right; 
            margin-top: 20px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
          }
          .total-line {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
          }
          .final-total {
            font-weight: bold;
            font-size: 1.1em;
            border-top: 2px solid #1e40af;
            padding-top: 10px;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #1e40af; margin: 0;">FACTUUR</h1>
        </div>
        
        <div class="company-info">
          <h2 style="margin: 0; color: #1e40af;">Uw Bedrijf</h2>
          <p style="margin: 5px 0;">Uw Adres<br>0000 XX Uw Plaats<br>info@uwbedrijf.nl</p>
        </div>

        <div class="invoice-details">
          <div>
            <p><strong>Factuurnummer:</strong> ${invoiceNumber || getDefaultInvoiceNumber()}</p>
            <p><strong>Factuurdatum:</strong> ${formatDisplayDate(formData.invoice_date)}</p>
            <p><strong>Vervaldatum:</strong> ${formatDisplayDate(formData.due_date)}</p>
          </div>
        </div>

        <div class="client-info">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Factuuradres:</h3>
          <p style="margin: 0;">
            ${formData.client_name || 'Naam klant'}<br>
            ${formData.client_address || 'Adres'}<br>
            ${formData.client_postal_code || '0000 XX'} ${formData.client_city || 'Plaats'}<br>
            ${formData.client_country || 'Nederland'}
            ${formData.client_email ? `<br>E-mail: ${formData.client_email}` : ''}
          </p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Omschrijving</th>
              <th style="width: 80px;">Aantal</th>
              <th style="width: 100px;">Prijs</th>
              <th style="width: 60px;">BTW</th>
              <th style="width: 100px;">Totaal</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <div class="total-line">
            <span>Subtotaal:</span>
            <span>€ ${subtotal.toFixed(2)}</span>
          </div>
          <div class="total-line">
            <span>BTW (21%):</span>
            <span>€ ${vatAmount.toFixed(2)}</span>
          </div>
          <div class="total-line final-total">
            <span>Totaal:</span>
            <span>€ ${total.toFixed(2)}</span>
          </div>
        </div>

        ${formData.notes ? `
          <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">Opmerkingen:</h4>
            <p style="margin: 0;">${formData.notes}</p>
          </div>
        ` : ''}

        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          <p>Betaling binnen ${formData.payment_terms || 30} dagen op rekening</p>
        </div>
      </body>
    </html>
  `;
};

const calculateTotalsFromItems = (lineItems: LineItem[]) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
  const vatAmount = lineItems.reduce((sum, item) => {
    return sum + (item.line_total * item.vat_rate / 100);
  }, 0);
  const total = subtotal + vatAmount;
  
  return { subtotal, vatAmount, total };
};
