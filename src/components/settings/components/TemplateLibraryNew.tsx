
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Download, Eye, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
import { useToast } from '@/hooks/use-toast';

// Mock template library data - in real app this would come from an API
const TEMPLATE_LIBRARY = [
  {
    id: 'lib-1',
    name: 'Moderne Factuur Template',
    description: 'Een strakke, moderne factuur template met subtiele kleuren',
    category: 'Factuur',
    tags: ['modern', 'zakelijk', 'strak'],
    preview_url: '/templates/preview1.png',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .invoice-title { font-size: 32px; font-weight: bold; color: #2563eb; }
    .company-info { text-align: right; }
    .invoice-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .items-table { width: 100%; border-collapse: collapse; }
    .items-table th { background: #2563eb; color: white; padding: 12px; text-align: left; }
    .items-table td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .total-section { text-align: right; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="invoice-title">FACTUUR</div>
      <div>{{bedrijfsnaam}}</div>
    </div>
    <div class="company-info">
      <div>{{adres}}</div>
      <div>{{postcode}} {{plaats}}</div>
      <div>{{telefoon}}</div>
    </div>
  </div>
  
  <div class="invoice-details">
    <p><strong>Factuurnummer:</strong> {{factuurnummer}}</p>
    <p><strong>Factuurdatum:</strong> {{datum}}</p>
    <p><strong>Vervaldatum:</strong> {{vervaldatum}}</p>
  </div>
  
  <p>Geachte {{klant_naam}},</p>
  
  <table class="items-table">
    <thead>
      <tr>
        <th>Omschrijving</th>
        <th>Aantal</th>
        <th>Prijs</th>
        <th>Totaal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{{item_omschrijving}}</td>
        <td>{{item_aantal}}</td>
        <td>€{{item_prijs}}</td>
        <td>€{{item_totaal}}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="total-section">
    <p><strong>Subtotaal: €{{subtotaal}}</strong></p>
    <p><strong>BTW (21%): €{{btw}}</strong></p>
    <p style="font-size: 18px;"><strong>Totaal: €{{totaal}}</strong></p>
  </div>
</body>
</html>`
  },
  {
    id: 'lib-2',
    name: 'Klassieke Offerte Template',
    description: 'Traditionele offerte template voor professionele uitstraling',
    category: 'Offerte',
    tags: ['klassiek', 'professioneel', 'traditioneel'],
    preview_url: '/templates/preview2.png',
    html_content: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Times, serif; margin: 0; padding: 40px; line-height: 1.6; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
    .quote-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .company-details { margin: 20px 0; }
    .client-info { background: #f9f9f9; padding: 15px; margin: 20px 0; }
    .items-table { width: 100%; border: 1px solid #000; border-collapse: collapse; }
    .items-table th, .items-table td { border: 1px solid #000; padding: 10px; }
    .items-table th { background: #f0f0f0; }
  </style>
</head>
<body>
  <div class="header">
    <div class="quote-title">OFFERTE</div>
    <div>{{bedrijfsnaam}}</div>
    <div>{{adres}} | {{postcode}} {{plaats}}</div>
    <div>Tel: {{telefoon}} | Email: {{email}}</div>
  </div>
  
  <div class="client-info">
    <h3>Klantgegevens:</h3>
    <p>{{klant_naam}}<br>
    {{klant_adres}}<br>
    {{klant_postcode}} {{klant_plaats}}</p>
  </div>
  
  <div>
    <p><strong>Offertenummer:</strong> {{offertenummer}}</p>
    <p><strong>Datum:</strong> {{datum}}</p>
    <p><strong>Geldig tot:</strong> {{geldig_tot}}</p>
  </div>
  
  <table class="items-table">
    <thead>
      <tr>
        <th>Pos.</th>
        <th>Omschrijving</th>
        <th>Aantal</th>
        <th>Eenheidsprijs</th>
        <th>Totaal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>{{item_omschrijving}}</td>
        <td>{{item_aantal}}</td>
        <td>€{{item_prijs}}</td>
        <td>€{{item_totaal}}</td>
      </tr>
    </tbody>
  </table>
  
  <div style="text-align: right; margin-top: 20px;">
    <p><strong>Totaal excl. BTW: €{{subtotaal}}</strong></p>
    <p><strong>BTW (21%): €{{btw}}</strong></p>
    <p style="font-size: 18px; border-top: 2px solid #000; padding-top: 10px;">
      <strong>Totaal incl. BTW: €{{totaal}}</strong>
    </p>
  </div>
</body>
</html>`
  }
];

export const TemplateLibraryNew = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const { createTemplate } = useDocumentTemplates();
  const { toast } = useToast();

  const categories = Array.from(new Set(TEMPLATE_LIBRARY.map(t => t.category)));

  const filteredTemplates = TEMPLATE_LIBRARY.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const installTemplate = async (template: typeof TEMPLATE_LIBRARY[0]) => {
    try {
      await createTemplate({
        name: template.name,
        description: template.description,
        html_content: template.html_content,
        type: 'library',
        is_active: true,
        is_default: false,
        tags: [template.category.toLowerCase(), ...template.tags]
      });
      
      toast({
        title: "Template geïnstalleerd",
        description: `"${template.name}" is toegevoegd aan je templates`
      });
    } catch (error) {
      toast({
        title: "Installatie mislukt",
        description: "Kon template niet installeren",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-6 w-6" />
        <h2 className="text-xl font-semibold">Template Bibliotheek</h2>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Zoek templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === '' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('')}
            size="sm"
          >
            Alle
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {template.description}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {template.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // Preview functionality could be added here
                      toast({
                        title: "Preview",
                        description: "Preview functionaliteit komt binnenkort"
                      });
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => installTemplate(template)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Installeren
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Geen templates gevonden
          </h3>
          <p className="text-gray-500">
            Pas je zoekopdracht aan of kies een andere categorie
          </p>
        </div>
      )}
    </div>
  );
};
