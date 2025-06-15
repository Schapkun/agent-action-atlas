import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Send, Bold, Italic, Underline, List } from 'lucide-react';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useInvoiceLines } from '@/hooks/useInvoiceLines';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvoiceFormData {
  client_name: string;
  client_email: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  client_country: string;
  invoice_date: string;
  due_date: string;
  payment_terms: number;
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

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { createInvoice } = useInvoices();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('debuitendeur.nl');
  
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_name: '',
    client_email: '',
    client_address: '',
    client_postal_code: '',
    client_city: '',
    client_country: 'Nederland',
    invoice_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    payment_terms: 30,
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
      
      const invoiceData = {
        ...formData,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'draft' as const
      };

      await createInvoice(invoiceData);
      navigate('/facturen');
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSend = async () => {
    setSendLoading(true);

    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const invoiceData = {
        ...formData,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'sent' as const
      };

      const newInvoice = await createInvoice(invoiceData);
      
      const emailTemplate = {
        subject: "Factuur {invoice_number}",
        message: `Beste {client_name},

Hierbij ontvangt u factuur {invoice_number} van {invoice_date}.

Het totaalbedrag van €{total_amount} dient betaald te worden voor {due_date}.

Met vriendelijke groet,
Uw administratie`
      };

      if (formData.client_email) {
        const { error } = await supabase.functions.invoke('send-invoice-email', {
          body: {
            invoice_id: newInvoice.id,
            email_template: emailTemplate,
            email_type: 'resend'
          }
        });

        if (error) throw error;

        toast({
          title: "Factuur Verzonden",
          description: `Factuur is verzonden naar ${formData.client_email}.`
        });
      }
      
      navigate('/facturen');
    } catch (error) {
      console.error('Error saving and sending invoice:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het verzenden van de factuur.",
        variant: "destructive"
      });
    } finally {
      setSendLoading(false);
    }
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-green-600">📄 Nieuwe Factuur</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500 text-xs px-2 py-1">
              Verstuur
            </Button>
            <Button variant="outline" size="sm" className="text-xs px-2 py-1">📋</Button>
            <Button variant="outline" size="sm" className="text-xs px-2 py-1">❌</Button>
            <Button variant="outline" size="sm" className="text-xs px-2 py-1">↶</Button>
            <Button variant="outline" size="sm" className="text-xs px-2 py-1">↷</Button>
            <div className="flex items-center gap-1 ml-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
                👁️ Voorbeeld
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
                💾 Opslaan als concept
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs px-2 py-1">
                ⚙️ Naar offerte
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content - Much more compact */}
      <div className="max-w-6xl mx-auto p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Client selection - Compact */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <Label htmlFor="client_select" className="text-xs font-medium">Aan</Label>
                  <div className="flex gap-2 mt-1">
                    <Input 
                      placeholder="Selecteer klant - zoek op naam, klantnummer, plaats, adres, e-mailadres of postcode"
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

          {/* References section - Compact */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Referenties</Label>
                <Button type="button" variant="link" className="text-blue-500 text-xs p-0 h-auto">Bewerk introductie</Button>
              </div>
              <Input placeholder="Voer hier een factuurreferentie in van maximaal 3 regels." className="text-xs h-8" />
            </CardContent>
          </Card>

          {/* Invoice details - Compact */}
          <Card>
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs font-medium">Factuur</Label>
                  <div className="flex mt-1">
                    <span className="bg-gray-100 px-2 py-1 rounded-l border text-xs h-8 flex items-center">2025-</span>
                    <Input className="rounded-l-none border-l-0 text-xs h-8" placeholder="185" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Datum</Label>
                  <Input 
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                    className="mt-1 text-xs h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Vervaldatum</Label>
                  <Input 
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="mt-1 text-xs h-8"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products/Services table - Compact */}
          <Card>
            <CardHeader className="p-2">
              <div className="grid grid-cols-6 gap-3 text-xs font-medium text-gray-700">
                <div>Aantal</div>
                <div className="col-span-2">Omschrijving</div>
                <div>Prijs</div>
                <div>btw</div>
                <div>Prijs incl. btw</div>
              </div>
            </CardHeader>

            <CardContent className="p-2">
              {lineItems.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p className="text-xs">Er zijn geen productregels</p>
                  <Button 
                    type="button" 
                    onClick={addLineItem}
                    size="sm"
                    className="mt-2 bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs"
                  >
                    Voeg regel toe
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-6 gap-3 items-start">
                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="text-center text-xs h-8"
                        />
                      </div>
                      <div className="col-span-2">
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder=""
                          className="min-h-[40px] resize-none text-xs"
                          rows={2}
                        />
                        {/* Compact Toolbar */}
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
                          <Select defaultValue="9pt">
                            <SelectTrigger className="w-14 text-xs h-6">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="9pt">9pt</SelectItem>
                              <SelectItem value="10pt">10pt</SelectItem>
                              <SelectItem value="12pt">12pt</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
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
                      <div>
                        <div className="flex items-center">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.vat_rate}
                            onChange={(e) => updateLineItem(index, 'vat_rate', parseFloat(e.target.value) || 0)}
                            className="text-right w-12 text-xs h-8"
                          />
                          <span className="ml-1 text-xs">%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
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
                          className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add line button - Compact */}
          <div>
            <Button 
              type="button" 
              onClick={addLineItem}
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-600 text-xs"
            >
              Voeg regel toe
            </Button>
          </div>

          {/* Footer with payment info - Compact */}
          <Card>
            <CardContent className="p-3">
              <Textarea 
                value="Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendeur.nl met omschrijving: %INVOICE_NUMBER%"
                className="h-12 resize-none text-xs"
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Totals section - Compact */}
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

          {/* Action buttons - Compact */}
          <div className="flex justify-end gap-2 pt-3">
            <Button 
              type="button" 
              onClick={() => navigate('/facturen')}
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
            <Button 
              type="button" 
              onClick={handleSaveAndSend}
              disabled={sendLoading || !formData.client_email}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs"
            >
              <Send className="h-3 w-3 mr-1" />
              {sendLoading ? 'Verzenden...' : 'Opslaan & Versturen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
