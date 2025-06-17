
-- Create a standard invoice template with logo placeholders using 'factuur' as type
INSERT INTO public.document_templates (
  name,
  type,
  html_content,
  is_active,
  is_default,
  organization_id
) VALUES (
  'Standaard Factuur Template',
  'factuur',
  '<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factuur {{factuurnummer}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; }
        .logo { max-width: 200px; max-height: 100px; }
        .company-info { text-align: right; }
        .invoice-title { font-size: 24px; font-weight: bold; margin: 20px 0; }
        .client-info { margin: 20px 0; }
        .invoice-details { margin: 20px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; font-weight: bold; }
        .totals { text-align: right; margin-top: 20px; }
        .total-row { font-weight: bold; font-size: 18px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo-section">
            <img src="{{logo}}" alt="Company Logo" class="logo" />
        </div>
        <div class="company-info">
            <strong>{{bedrijfsnaam}}</strong><br>
            {{adres}}<br>
            {{postcode}} {{plaats}}<br>
            {{telefoon}}<br>
            {{email}}<br>
            {{website}}
        </div>
    </div>

    <h1 class="invoice-title">FACTUUR</h1>

    <div class="invoice-details">
        <strong>Factuurnummer:</strong> {{factuurnummer}}<br>
        <strong>Factuurdatum:</strong> {{factuurdatum}}<br>
        <strong>Vervaldatum:</strong> {{vervaldatum}}<br>
    </div>

    <div class="client-info">
        <strong>Aan:</strong><br>
        {{klant_naam}}<br>
        {{klant_adres}}<br>
        {{klant_postcode}} {{klant_plaats}}<br>
        {{klant_land}}
    </div>

    <table>
        <thead>
            <tr>
                <th>Omschrijving</th>
                <th>Aantal</th>
                <th>Prijs per stuk</th>
                <th>BTW</th>
                <th>Totaal</th>
            </tr>
        </thead>
        <tbody>
            {{#each regels}}
            <tr>
                <td>{{description}}</td>
                <td>{{quantity}}</td>
                <td>€{{unit_price}}</td>
                <td>{{vat_rate}}%</td>
                <td>€{{line_total}}</td>
            </tr>
            {{/each}}
        </tbody>
    </table>

    <div class="totals">
        <div>Subtotaal: €{{subtotaal}}</div>
        <div>BTW: €{{btw_bedrag}}</div>
        <div class="total-row">Totaal: €{{totaal_bedrag}}</div>
    </div>

    <div style="margin-top: 30px;">
        {{#if notities}}
        <strong>Opmerkingen:</strong><br>
        {{notities}}
        {{/if}}
    </div>

    <div style="margin-top: 30px; font-size: 12px; color: #666;">
        <strong>Betaalgegevens:</strong><br>
        Banknummer: {{banknummer}}<br>
        BTW-nummer: {{btw_nummer}}<br>
        KvK-nummer: {{kvk_nummer}}
    </div>
</body>
</html>',
  true,
  true,
  (SELECT id FROM public.organizations LIMIT 1)
);

-- Create a document template label for "Factuur" if it doesn't exist
INSERT INTO public.document_template_labels (name, color, organization_id)
SELECT 'Factuur', '#3B82F6', o.id
FROM public.organizations o
WHERE NOT EXISTS (
  SELECT 1 FROM public.document_template_labels dtl 
  WHERE dtl.name = 'Factuur' AND dtl.organization_id = o.id
)
LIMIT 1;

-- Assign the "Factuur" label to the new template
INSERT INTO public.document_template_label_assignments (template_id, label_id)
SELECT dt.id, dtl.id
FROM public.document_templates dt
CROSS JOIN public.document_template_labels dtl
WHERE dt.name = 'Standaard Factuur Template'
  AND dtl.name = 'Factuur'
  AND NOT EXISTS (
    SELECT 1 FROM public.document_template_label_assignments dtla
    WHERE dtla.template_id = dt.id AND dtla.label_id = dtl.id
  );
