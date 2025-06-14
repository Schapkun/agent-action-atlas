
import schapkunTemplate from '../invoice_schapkun.html?raw';

export const DEFAULT_PLACEHOLDER_VALUES: Record<string, string> = {
  COMPANY_LOGO: "", // base64 image url
  COMPANY_NAME: "Jansen B.V.",
  COMPANY_ADDRESS: "Straat 1",
  COMPANY_POSTAL_CODE: "1234 AB",
  COMPANY_CITY: "Amsterdam",
  COMPANY_PHONE: "06-12345678",
  COMPANY_EMAIL: "info@jansenbv.nl",
  COMPANY_KVK: "12345678",
  COMPANY_VAT: "NL001234567B01",
  COMPANY_IBAN: "NL91ABNA0417164300",
  COMPANY_BIC: "ABNANL2A",
  INVOICE_NUMBER: "2024-001",
  INVOICE_DATE: "14-06-2024",
  DUE_DATE: "28-06-2024",
  CUSTOMER_NAME: "Voorbeeld Klant B.V.",
  CUSTOMER_ADDRESS: "Voorbeeldstraat 123",
  CUSTOMER_POSTAL_CODE: "4321 BA",
  CUSTOMER_CITY: "Rotterdam",
  INVOICE_LINES:
    `<tr>
      <td>Consultancy diensten</td>
      <td>10</td>
      <td>€ 75,00</td>
      <td>21%</td>
      <td>€ 750,00</td>
    </tr>
    <tr>
      <td>Reiskosten</td>
      <td>1</td>
      <td>€ 50,00</td>
      <td>21%</td>
      <td>€ 50,00</td>
    </tr>`,
  SUBTOTAL: "800.00",
  VAT_PERCENTAGE: "21",
  VAT_AMOUNT: "168.00",
  TOTAL_AMOUNT: "968.00",
  INVOICE_SUBJECT: "Diensten maart",
  PAYMENT_TERMS: "30"
};

export type PlaceholderField = {
  label: string;
  id: string;
  placeholder?: string;
  type?: "image";
};

export const PLACEHOLDER_FIELDS: PlaceholderField[] = [
  { label: "Bedrijfslogo", id: "COMPANY_LOGO", type: "image", placeholder: "" },
  { label: "Bedrijfsnaam", id: "COMPANY_NAME", placeholder: "Bijv. Jansen B.V." },
  { label: "Adres", id: "COMPANY_ADDRESS", placeholder: "Bijv. Straat 1" },
  { label: "Postcode", id: "COMPANY_POSTAL_CODE", placeholder: "Bijv. 1234 AB" },
  { label: "Plaats", id: "COMPANY_CITY", placeholder: "Bijv. Amsterdam" },
  { label: "Telefoon", id: "COMPANY_PHONE", placeholder: "Bijv. 06-12345678" },
  { label: "E-mail", id: "COMPANY_EMAIL", placeholder: "Bijv. info@voorbeeld.nl" },
  { label: "KvK", id: "COMPANY_KVK", placeholder: "Bijv. 12345678" },
  { label: "BTW-nummer", id: "COMPANY_VAT", placeholder: "Bijv. NL001234567B01" },
  { label: "IBAN", id: "COMPANY_IBAN", placeholder: "Bijv. NL91ABNA0417164300" },
  { label: "BIC", id: "COMPANY_BIC", placeholder: "Bijv. ABNANL2A" },
  // Factuur/specifiek
  { label: "Factuurnummer", id: "INVOICE_NUMBER", placeholder: "Bijv. 2024-001" },
  { label: "Factuurdatum", id: "INVOICE_DATE", placeholder: "Bijv. 14-06-2024" },
  { label: "Vervaldatum", id: "DUE_DATE", placeholder: "Bijv. 28-06-2024" },
  { label: "Klantnaam", id: "CUSTOMER_NAME", placeholder: "Bijv. Jansen B.V." },
  { label: "Klantadres", id: "CUSTOMER_ADDRESS", placeholder: "Bijv. Straat 1" },
  { label: "Postcode klant", id: "CUSTOMER_POSTAL_CODE", placeholder: "Bijv. 1234 AB" },
  { label: "Plaats klant", id: "CUSTOMER_CITY", placeholder: "Bijv. Amsterdam" },
  { label: "Factuurregels (HTML)", id: "INVOICE_LINES", placeholder: "Automatisch gegenereerd" },
  { label: "Subtotaal", id: "SUBTOTAL", placeholder: "Bijv. 800.00" },
  { label: "BTW-percentage", id: "VAT_PERCENTAGE", placeholder: "Bijv. 21" },
  { label: "BTW-bedrag", id: "VAT_AMOUNT", placeholder: "Bijv. 168.00" },
  { label: "Totaalbedrag", id: "TOTAL_AMOUNT", placeholder: "Bijv. 968.00" },
  { label: "Orderomschrijving", id: "INVOICE_SUBJECT", placeholder: "Bijv. Diensten maart" },
  { label: "Betaaltermijn", id: "PAYMENT_TERMS", placeholder: "Bijv. 30" },
];

export type DocumentTypeUI = 'factuur' | 'contract' | 'brief' | 'custom' | 'schapkun';
export type DocumentTypeBackend = 'factuur' | 'contract' | 'brief' | 'custom';

export const DOCUMENT_TYPE_OPTIONS: { value: DocumentTypeUI; label: string }[] = [
  { value: 'factuur', label: 'Factuur (standaard)' },
  { value: 'schapkun', label: 'Factuur (Schapkun)' },
  { value: 'contract', label: 'Contract' },
  { value: 'brief', label: 'Brief' },
  { value: 'custom', label: 'Custom' }
];

export function getStorageKey(documentName: string) {
  return "html_doc_preview_" + (documentName?.trim().toLowerCase().replace(/\s+/g, "_") || "untitled");
}

export const DEFAULT_INVOICE_TEMPLATE = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factuur</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: white; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .company-info { flex: 1; }
        .company-logo { width: 120px; height: auto; }
        .invoice-info { text-align: right; }
        .invoice-number { font-size: 24px; font-weight: bold; color: #3b82f6; }
        .customer-billing { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
        .section-title { font-weight: bold; margin-bottom: 10px; color: #374151; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { border: 1px solid #d1d5db; padding: 12px; text-align: left; }
        .invoice-table th { background-color: #f3f4f6; font-weight: bold; }
        .totals { margin-top: 20px; text-align: right; }
        .total-row { display: flex; justify-content: flex-end; margin-bottom: 8px; }
        .total-label { width: 150px; text-align: right; margin-right: 20px; }
        .total-amount { width: 100px; text-align: right; font-weight: bold; }
        .final-total { font-size: 18px; border-top: 2px solid #3b82f6; padding-top: 8px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
    </style>
</head>
<body>
    <!-- Header met bedrijfsinfo -->
    <div class="header">
        <div class="company-info">
            <img src="{{COMPANY_LOGO}}" alt="Bedrijfslogo" class="company-logo" />
            <h1>{{COMPANY_NAME}}</h1>
            <p>{{COMPANY_ADDRESS}}</p>
            <p>{{COMPANY_POSTAL_CODE}} {{COMPANY_CITY}}</p>
            <p>Tel: {{COMPANY_PHONE}}</p>
            <p>Email: {{COMPANY_EMAIL}}</p>
        </div>
        <div class="invoice-info">
            <div class="invoice-number">Factuur {{INVOICE_NUMBER}}</div>
            <p><strong>Factuurdatum:</strong> {{INVOICE_DATE}}</p>
            <p><strong>Vervaldatum:</strong> {{DUE_DATE}}</p>
        </div>
    </div>

    <!-- Klant- en factuurgegevens -->
    <div class="customer-billing">
        <div>
            <div class="section-title">Factuuradres:</div>
            <div>{{CUSTOMER_NAME}}</div>
            <div>{{CUSTOMER_ADDRESS}}</div>
            <div>{{CUSTOMER_POSTAL_CODE}} {{CUSTOMER_CITY}}</div>
        </div>
        <div>
            <div class="section-title">Betreft:</div>
            <div>{{INVOICE_SUBJECT}}</div>
        </div>
    </div>

    <!-- Factuurregels tabel -->
    <table class="invoice-table">
        <thead>
            <tr>
                <th>Omschrijving</th>
                <th>Aantal</th>
                <th>Prijs per stuk</th>
                <th>BTW %</th>
                <th>Totaal</th>
            </tr>
        </thead>
        <tbody>
            {{INVOICE_LINES}}
        </tbody>
    </table>

    <!-- Totalen -->
    <div class="totals">
        <div class="total-row">
            <div class="total-label">Subtotaal:</div>
            <div class="total-amount">€ {{SUBTOTAL}}</div>
        </div>
        <div class="total-row">
            <div class="total-label">BTW ({{VAT_PERCENTAGE}}%):</div>
            <div class="total-amount">€ {{VAT_AMOUNT}}</div>
        </div>
        <div class="total-row final-total">
            <div class="total-label">Totaal:</div>
            <div class="total-amount">€ {{TOTAL_AMOUNT}}</div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>Betaling binnen {{PAYMENT_TERMS}} dagen na factuurdatum.</p>
        <p>{{COMPANY_NAME}} | KvK: {{COMPANY_KVK}} | BTW-nr: {{COMPANY_VAT}}</p>
        <p>IBAN: {{COMPANY_IBAN}} | BIC: {{COMPANY_BIC}}</p>
    </div>
</body>
</html>`;
export { schapkunTemplate };
