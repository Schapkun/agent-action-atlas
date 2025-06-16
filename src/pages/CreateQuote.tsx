import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, Bold, Italic, Underline, List, Settings, RotateCcw, RotateCw, Eye, Save } from 'lucide-react';
import { useQuotes, Quote } from '@/hooks/useQuotes';
import { useInvoices } from '@/hooks/useInvoices';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { VatSelector } from '@/components/ui/vat-selector';

interface QuoteFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  quote_date: string;
  valid_until: string;
  notes: string;
  vat_percentage: number;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  vat_rate: number;
  line_total: number;
}

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  phone?: string;
}

const CreateQuote = () => {
  const navigate = useNavigate();
  const { createQuote } = useQuotes();
  const { createInvoice } = useInvoices();
  const { settings: invoiceSettings } = useInvoiceSettings();
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('debuitendeur.nl');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const [formData, setFormData] = useState<QuoteFormData>({
    client_name: '',
    client_email: '',
    client_address: '',
    client_postal_code: '',
    client_city: '',
    client_country: 'Nederland',
    quote_date: format(new Date(), 'yyyy-MM-dd'),
    valid_until: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    notes: '',
    vat_percentage: 21.00
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unit_price: 0, vat_rate: 21, line_total: 0 }
  ]);

  const { toast } = useToast();

  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    if (contact) {
      setFormData(prev => ({
        ...prev,
        client_name: contact.name,
        client_email: contact.email || '',
        client_address: contact.address || '',
        client_postal_code: contact.postal_code || '',
        client_city: contact.city || '',
        client_country: contact.country || 'Nederland'
      }));
      
      // NIEUWE FUNCTIONALITEIT: Update ook de klant placeholders voor document templates
      const updateEvent = new CustomEvent('contactSelectedForDocuments', {
        detail: {
          klant_naam: contact.name,
          klant_bedrijf: contact.name,
          klant_adres: contact.address || '',
          klant_postcode: contact.postal_code || '',
          klant_plaats: contact.city || '',
          klant_email: contact.email || '',
          klant_telefoon: contact.phone || '',
          klant_land: contact.country || 'Nederland'
        }
      });
      window.dispatchEvent(updateEvent);
    } else {
      // Clear contact data when deselecting
      const clearEvent = new CustomEvent('contactSelectedForDocuments', {
        detail: {
          klant_naam: '',
          klant_bedrijf: '',
          klant_adres: '',
          klant_postcode: '',
          klant_plaats: '',
          klant_email: '',
          klant_telefoon: '',
          klant_land: 'Nederland'
        }
      });
      window.dispatchEvent(clearEvent);
    }
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      newItems[index].line_total = calculateLineTotal(
        newItems[index].quantity, 
        newItems[index].unit_price
      );
    }
    
    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      description: '', 
      quantity: 1, 
      unit_price: 0, 
      vat_rate: 21, 
      line_total: 0 
    }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.line_total, 0);
    const vatAmount = lineItems.reduce((sum, item) => {
      return sum + (item.line_total * item.vat_rate / 100);
    }, 0);
    const total = subtotal + vatAmount;
    
    return { subtotal, vatAmount, total };
  };

  const handleConvertToInvoice = async () => {
    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const invoiceData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_address: formData.client_address,
        client_postal_code: formData.client_postal_code,
        client_city: formData.client_city,
        client_country: formData.client_country,
        invoice_date: formData.quote_date,
        due_date: formData.valid_until,
        notes: formData.notes,
        vat_percentage: formData.vat_percentage,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'draft' as const
      };

      await createInvoice(invoiceData);
      navigate('/facturen/opstellen');
    } catch (error) {
      console.error('Error converting to invoice:', error);
      toast({
        title: "Fout",
        description: "Kon offerte niet omzetten naar factuur",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const quoteData = {
        ...formData,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'draft' as const
      };

      await createQuote(quoteData);
      navigate('/offertes');
    } catch (error) {
      console.error('Error saving quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header with action buttons */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-green-600">📄 Nieuwe Offerte</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs px-2 py-1">
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs px-2 py-1">
              <RotateCw className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
              <Eye className="h-3 w-3" />
              Voorbeeld
            </Button>
            <Button variant="outline" size="sm" onClick={handleConvertToInvoice} className="flex items-center gap-1 text-xs px-2 py-1">
              ⚙️ Naar factuur
            </Button>
            
            {/* Action buttons moved to header */}
            <div className="flex items-center gap-2 ml-4 border-l pl-4">
              <Button 
                type="button" 
                onClick={() => navigate('/offertes')}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Annuleren
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                size="sm"
                className="bg-gray-800 hover:bg-gray-900 text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                {loading ? 'Opslaan...' : 'Opslaan als concept'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Contact selection */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <ContactSelector
                    selectedContact={selectedContact}
                    onContactSelect={handleContactSelect}
                  />
                </div>
                <div className="w-48">
                  <Label className="text-xs font-medium">Profiel</Label>
                  <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debuitendeur.nl">debuitendeur.nl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => navigate('/instellingen')} className="mt-4 h-8 w-8 p-0">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quote details */}
          <Card>
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium">Offerte</Label>
                  <div className="flex mt-1">
                    <span className="bg-gray-100 px-2 py-1 rounded-l border text-xs h-8 flex items-center">
                      {invoiceSettings.quote_prefix}
                    </span>
                    <Input 
                      className="rounded-l-none border-l-0 text-xs h-8" 
                      placeholder={invoiceSettings.quote_start_number.toString().padStart(3, '0')}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Datum</Label>
                  <Input 
                    type="date"
                    value={formData.quote_date}
                    onChange={(e) => setFormData({...formData, quote_date: e.target.value})}
                    className="mt-1 text-xs h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Geldig tot</Label>
                  <Input 
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    className="mt-1 text-xs h-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products/Services table - same as invoice */}
          <Card>
            <CardHeader className="p-2">
              <div className="grid grid-cols-12 gap-3 text-xs font-medium text-gray-700">
                <div className="col-span-1">Aantal</div>
                <div className="col-span-6">Omschrijving</div>
                <div className="col-span-2">Prijs</div>
                <div className="col-span-2">btw</div>
                <div className="col-span-1">Totaal</div>
              </div>
            </CardHeader>

            <CardContent className="p-2">
              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="text-center text-xs h-8"
                      />
                    </div>
                    <div className="col-span-6">
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder=""
                        className="min-h-[32px] resize-none text-xs h-8"
                        rows={1}
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Bold className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Italic className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Underline className="h-3 w-3" />
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <List className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center">
                        <span className="mr-1 text-xs">€</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="text-right text-xs h-8"
                        />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <VatSelector
                        value={item.vat_rate}
                        onValueChange={(value) => updateLineItem(index, 'vat_rate', value)}
                        className="text-xs h-8"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-1 text-xs">€</span>
                        <span className="font-medium text-xs">{item.line_total.toFixed(2)}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                        className="text-red-500 hover:text-red-700 h-6 w-6 p-0 ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add line button */}
          <div className="flex justify-end">
            <Button 
              type="button" 
              onClick={addLineItem}
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-600 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Voeg regel toe
            </Button>
          </div>

          {/* Footer with payment info */}
          <Card>
            <CardContent className="p-3">
              <Textarea 
                value="Deze offerte is geldig tot de genoemde datum. Na acceptatie wordt deze offerte omgezet naar een factuur."
                className="h-12 resize-none text-xs"
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Totals section */}
          <Card className="bg-blue-50">
            <CardContent className="p-3">
              <div className="space-y-1 text-right">
                <div className="flex justify-between text-xs">
                  <span>Subtotaal:</span>
                  <span>€ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>BTW:</span>
                  <span>€ {vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-blue-600 border-t pt-1">
                  <span>Totaal:</span>
                  <span>€ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CreateQuote;
