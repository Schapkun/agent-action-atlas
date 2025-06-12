
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Eye, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const HTMLDocumentBuilder = () => {
  const [htmlCode, setHtmlCode] = useState(`<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factuur {{INVOICE_NUMBER}}</title>
    <style>
        @page {
            size: A4;
            margin: 1.5cm;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            line-height: 1.4;
            font-size: 11pt;
            color: #333;
        }
        .document {
            width: 100%;
            max-width: 21cm;
            min-height: 29.7cm;
            margin: 0 auto;
            background: white;
            box-sizing: border-box;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
        }
        .company-info {
            flex: 1;
        }
        .company-logo {
            max-height: 80px;
            max-width: 200px;
            object-fit: contain;
        }
        .company-name {
            font-size: 24pt;
            font-weight: bold;
            color: #2c5282;
            margin: 10px 0;
        }
        .company-details {
            font-size: 10pt;
            color: #666;
            line-height: 1.3;
        }
        .invoice-header {
            text-align: center;
            margin: 30px 0;
        }
        .invoice-title {
            font-size: 28pt;
            font-weight: bold;
            color: #2c5282;
            margin-bottom: 10px;
        }
        .invoice-info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            gap: 40px;
        }
        .info-block {
            flex: 1;
        }
        .info-block h3 {
            font-size: 12pt;
            font-weight: bold;
            color: #2c5282;
            margin-bottom: 8px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 3px;
        }
        .info-block p {
            margin: 3px 0;
            font-size: 10pt;
        }
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10pt;
        }
        .invoice-table thead th {
            background-color: #2c5282;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
        }
        .invoice-table th:last-child,
        .invoice-table td:last-child {
            text-align: right;
        }
        .invoice-table tbody td {
            padding: 8px;
            border-bottom: 1px solid #e0e0e0;
        }
        .invoice-table tbody tr:hover {
            background-color: #f8f9fa;
        }
        .totals-section {
            margin-top: 30px;
            text-align: right;
        }
        .totals-table {
            margin-left: auto;
            width: 300px;
            font-size: 11pt;
        }
        .totals-table td {
            padding: 5px 10px;
            border: none;
        }
        .totals-table .total-row {
            border-top: 2px solid #2c5282;
            font-weight: bold;
            font-size: 12pt;
            color: #2c5282;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 9pt;
            color: #666;
            text-align: center;
        }
        .payment-info {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 10pt;
        }
        @media screen {
            .document {
                box-shadow: 0 0 15px rgba(0,0,0,0.1);
                margin: 20px auto;
                padding: 40px;
            }
        }
        @media print {
            .document {
                box-shadow: none;
                margin: 0;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="document">
        <!-- HEADER SECTIE - Statisch -->
        <div class="header">
            <div class="company-info">
                <!-- Logo placeholder - wordt vervangen door {{COMPANY_LOGO}} -->
                <div style="width: 200px; height: 80px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999; font-size: 10pt;">
                    {{COMPANY_LOGO}}
                </div>
                <div class="company-name">{{COMPANY_NAME}}</div>
                <div class="company-details">
                    {{COMPANY_ADDRESS}}<br>
                    {{COMPANY_POSTAL}} {{COMPANY_CITY}}<br>
                    Tel: {{COMPANY_PHONE}}<br>
                    Email: {{COMPANY_EMAIL}}<br>
                    {{COMPANY_WEBSITE}}
                </div>
            </div>
        </div>

        <!-- FACTUUR TITEL - Statisch -->
        <div class="invoice-header">
            <h1 class="invoice-title">FACTUUR</h1>
        </div>

        <!-- FACTUUR & KLANT INFO - Mix van statisch en dynamisch -->
        <div class="invoice-info-section">
            <div class="info-block">
                <h3>Factuurgegevens</h3>
                <p><strong>Factuurnummer:</strong> {{INVOICE_NUMBER}}</p>
                <p><strong>Factuurdatum:</strong> {{INVOICE_DATE}}</p>
                <p><strong>Vervaldatum:</strong> {{DUE_DATE}}</p>
                <p><strong>Betalingsreferentie:</strong> {{PAYMENT_REFERENCE}}</p>
            </div>
            
            <div class="info-block">
                <h3>Factuuradres</h3>
                <p><strong>{{CUSTOMER_NAME}}</strong></p>
                <p>{{CUSTOMER_ADDRESS}}</p>
                <p>{{CUSTOMER_POSTAL}} {{CUSTOMER_CITY}}</p>
                <p>{{CUSTOMER_COUNTRY}}</p>
            </div>
        </div>

        <!-- FACTUURREGELS TABEL - Dynamisch -->
        <table class="invoice-table">
            <thead>
                <tr>
                    <th style="width: 50%">Omschrijving</th>
                    <th style="width: 15%">Aantal</th>
                    <th style="width: 17.5%">Prijs per stuk</th>
                    <th style="width: 17.5%">Totaal</th>
                </tr>
            </thead>
            <tbody>
                {{INVOICE_LINES}}
                <!-- Dynamische factuurregels worden hier ingevoegd -->
                <!-- Voorbeeld rij voor template:
                <tr>
                    <td>Consultancy diensten - Projectontwikkeling</td>
                    <td>10 uur</td>
                    <td>€ 75,00</td>
                    <td>€ 750,00</td>
                </tr>
                -->
            </tbody>
        </table>

        <!-- TOTALEN SECTIE - Dynamisch -->
        <div class="totals-section">
            <table class="totals-table">
                <tr>
                    <td>Subtotaal:</td>
                    <td style="text-align: right;">{{SUBTOTAL}}</td>
                </tr>
                <tr>
                    <td>BTW ({{VAT_RATE}}%):</td>
                    <td style="text-align: right;">{{VAT_AMOUNT}}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Totaal te betalen:</strong></td>
                    <td style="text-align: right;"><strong>{{TOTAL_AMOUNT}}</strong></td>
                </tr>
            </table>
        </div>

        <!-- BETALINGSINFORMATIE - Statisch -->
        <div class="payment-info">
            <h4 style="margin-top: 0; color: #2c5282;">Betalingsinformatie</h4>
            <p><strong>IBAN:</strong> {{COMPANY_IBAN}}</p>
            <p><strong>BIC:</strong> {{COMPANY_BIC}}</p>
            <p><strong>Betalingstermijn:</strong> {{PAYMENT_TERMS}} dagen</p>
            <p>Gelieve bij betaling het factuurnummer te vermelden.</p>
        </div>

        <!-- FOOTER - Statisch -->
        <div class="footer">
            <p>{{COMPANY_NAME}} • KvK: {{COMPANY_KVK}} • BTW: {{COMPANY_VAT_NUMBER}}</p>
            <p>Deze factuur is automatisch gegenereerd op {{GENERATION_DATE}}</p>
        </div>
    </div>
</body>
</html>`);
  
  const { toast } = useToast();

  const handleSaveTemplate = () => {
    console.log('Saving HTML template:', htmlCode);
    
    toast({
      title: "Template opgeslagen",
      description: "HTML document template is succesvol opgeslagen."
    });
  };

  const handleExportHTML = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'factuur-template.html';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "HTML geëxporteerd",
      description: "HTML bestand is gedownload."
    });
  };

  const insertSnippet = (snippet: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = htmlCode.substring(0, start) + snippet + htmlCode.substring(end);
      setHtmlCode(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + snippet.length, start + snippet.length);
      }, 0);
    }
  };

  const snippets = [
    {
      name: 'Factuur Rij',
      code: '\n                <tr>\n                    <td>{{DESCRIPTION}}</td>\n                    <td>{{QUANTITY}}</td>\n                    <td>{{UNIT_PRICE}}</td>\n                    <td>{{LINE_TOTAL}}</td>\n                </tr>'
    },
    {
      name: 'Bedrijf Header',
      code: '\n        <div class="header">\n            <div class="company-info">\n                <div class="company-logo">{{COMPANY_LOGO}}</div>\n                <div class="company-name">{{COMPANY_NAME}}</div>\n                <div class="company-details">\n                    {{COMPANY_ADDRESS}}<br>\n                    {{COMPANY_POSTAL}} {{COMPANY_CITY}}<br>\n                    Tel: {{COMPANY_PHONE}}<br>\n                    Email: {{COMPANY_EMAIL}}\n                </div>\n            </div>\n        </div>'
    },
    {
      name: 'Klant Info Blok',
      code: '\n            <div class="info-block">\n                <h3>Klantgegevens</h3>\n                <p><strong>{{CUSTOMER_NAME}}</strong></p>\n                <p>{{CUSTOMER_ADDRESS}}</p>\n                <p>{{CUSTOMER_POSTAL}} {{CUSTOMER_CITY}}</p>\n            </div>'
    },
    {
      name: 'Totalen Sectie',
      code: '\n        <div class="totals-section">\n            <table class="totals-table">\n                <tr>\n                    <td>Subtotaal:</td>\n                    <td>{{SUBTOTAL}}</td>\n                </tr>\n                <tr>\n                    <td>BTW ({{VAT_RATE}}%):</td>\n                    <td>{{VAT_AMOUNT}}</td>\n                </tr>\n                <tr class="total-row">\n                    <td><strong>Totaal:</strong></td>\n                    <td><strong>{{TOTAL_AMOUNT}}</strong></td>\n                </tr>\n            </table>\n        </div>'
    },
    {
      name: 'Logo Placeholder',
      code: '\n<div style="width: 200px; height: 80px; border: 2px dashed #ccc; display: flex; align-items: center; justify-content: center; color: #999;">{{COMPANY_LOGO}}</div>'
    },
    {
      name: 'Variable Placeholder',
      code: '{{VARIABLE_NAME}}'
    },
    {
      name: 'Paragraph',
      code: '\n        <p>{{TEXT_CONTENT}}</p>\n'
    },
    {
      name: 'Heading',
      code: '\n        <h2>{{HEADING_TEXT}}</h2>\n'
    },
    {
      name: 'Page Break',
      code: '\n        <div style="page-break-after: always;"></div>\n'
    }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Simple Header without buttons */}
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <FileText className="h-4 w-4" />
        <h3 className="text-lg font-semibold">HTML Document Builder</h3>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-2 min-h-0 overflow-hidden">
        {/* Code Snippets */}
        <div className="col-span-2 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
              <CardTitle className="text-xs">Template Onderdelen</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 px-3 pb-3 overflow-y-auto">
              <div className="space-y-1">
                {snippets.map((snippet) => (
                  <Button
                    key={snippet.name}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-xs h-7"
                    onClick={() => insertSnippet(snippet.code)}
                  >
                    {snippet.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HTML Editor */}
        <div className="col-span-5 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
              <CardTitle className="text-xs flex items-center gap-2">
                <Code className="h-3 w-3" />
                HTML Template Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3 min-h-0 overflow-hidden">
              <Textarea
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                className="w-full h-full font-mono text-xs resize-none"
                placeholder="Template HTML met dynamische placeholders..."
              />
            </CardContent>
          </Card>
        </div>

        {/* A4 Preview - Optimized for maximum size */}
        <div className="col-span-5 overflow-hidden">
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2 px-3 pt-3 flex-shrink-0">
              <CardTitle className="text-xs flex items-center gap-2">
                <Eye className="h-3 w-3" />
                Factuur Template Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3 overflow-hidden bg-gray-100 min-h-0">
              <div className="w-full h-full flex items-center justify-center">
                <div 
                  className="bg-white shadow-lg border border-gray-300 overflow-hidden"
                  style={{ 
                    width: '100%',
                    height: '100%',
                    maxWidth: 'min(100%, calc(100vh * 0.707))',
                    maxHeight: '100%',
                    aspectRatio: '210 / 297'
                  }}
                >
                  <iframe
                    srcDoc={htmlCode}
                    className="w-full h-full border-0"
                    title="Factuur Template Preview"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
