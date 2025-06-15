import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Bold, Italic, Underline, List } from 'lucide-react';
import { useQuotes, Quote } from '@/hooks/useQuotes';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const CreateQuote = () => {
  const navigate = useNavigate();
  const { createQuote } = useQuotes();
  const [loading, setLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('debuitendeur.nl');
  
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
      {/* Compact Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-green-600">📄 Nieuwe Offerte</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 ml-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
                👁️ Voorbeeld
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
                💾 Opslaan als concept
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Rest of the form content identical to CreateInvoice but adapted for quotes */}
          {/* Client selection */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <Label htmlFor="client_select" className="text-xs font-medium">Aan</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      placeholder="Selecteer contact - zoek op naam, contactnummer, plaats, adres, e-mailadres of postcode"
                      className="flex-1 text-xs h-8"
                      value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    />
                    <Button type="button" variant="outline" size="sm" className="text-blue-500 text-xs px-2 h-8">Nieuw</Button>
                    <Button type="button" variant="outline" size="sm" className="text-blue-500 text-xs px-2 h-8">Bewerken</Button>
                  </div>
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
                <Button type="button" variant="outline" size="sm" className="mt-4 h-8 w-8 p-0">⚙️</Button>
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
                    <span className="bg-gray-100 px-2 py-1 rounded-l border text-xs h-8 flex items-center">2025-</span>
                    <Input className="rounded-l-none border-l-0 text-xs h-8" placeholder="185" />
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

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3">
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
              type="submit" 
              disabled={loading}
              size="sm"
              className="bg-gray-800 hover:bg-gray-900 text-xs"
            >
              {loading ? 'Opslaan...' : 'Opslaan als concept'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuote;
