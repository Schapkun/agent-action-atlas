
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
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-medium text-green-600">📄 Nieuwe Factuur</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500">
              Verstuur
            </Button>
            <Button variant="outline" size="sm">📋</Button>
            <Button variant="outline" size="sm">❌</Button>
            <Button variant="outline" size="sm">↶</Button>
            <Button variant="outline" size="sm">↷</Button>
            <div className="flex items-center gap-2 ml-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                👁️ Voorbeeld
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                💾 Opslaan als concept
              </Button>
              <Button variant="outline" size="sm" className="flex items-center gap-1 text-xs">
                ⚙️ Naar offerte
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client selection */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <Label htmlFor="client_select" className="text-sm font-medium">Aan</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      placeholder="Selecteer klant - zoek op naam, klantnummer, plaats, adres, e-mailadres of postcode"
                      className="flex-1"
                      value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    />
                    <Button type="button" variant="outline" className="text-blue-500">Nieuw</Button>
                    <Button type="button" variant="outline" className="text-blue-500">Bewerken</Button>
                  </div>
                </div>
                <div className="w-64">
                  <Label className="text-sm font-medium">Profiel</Label>
                  <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debuitendeur.nl">debuitendeur.nl</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" className="mt-6">⚙️</Button>
              </div>
            </CardContent>
          </Card>

          {/* References section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium">Referenties</Label>
                <Button type="button" variant="link" className="text-blue-500 text-sm p-0 h-auto">Bewerk introductie</Button>
              </div>
              <Input placeholder="Voer hier een factuurreferentie in van maximaal 3 regels." />
            </CardContent>
          </Card>

          {/* Invoice details */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium">Factuur</Label>
                  <div className="flex mt-2">
                    <span className="bg-gray-100 px-3 py-2 rounded-l border">2025-</span>
                    <Input className="rounded-l-none border-l-0" placeholder="185" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Datum</Label>
                  <Input 
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Vervaldatum</Label>
                  <Input 
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products/Services table */}
          <Card>
            <CardHeader>
              <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                <div>Aantal</div>
                <div className="col-span-2">Omschrijving</div>
                <div>Prijs</div>
                <div>btw</div>
                <div>Prijs incl. btw</div>
              </div>
            </CardHeader>

            <CardContent>
              {lineItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Er zijn geen productregels</p>
                  <Button 
                    type="button" 
                    onClick={addLineItem}
                    className="mt-4 bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Voeg regel toe
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4 items-start">
                      <div>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="text-center"
                        />
                      </div>
                      <div className="col-span-2">
                        <Textarea
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder=""
                          className="min-h-[60px] resize-none"
                          rows={2}
                        />
                        {/* Toolbar */}
                        <div className="flex items-center gap-2 mt-2">
                          <Button type="button" variant="ghost" size="sm">
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm">
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm">
                            <Underline className="h-4 w-4" />
                          </Button>
                          <Button type="button" variant="ghost" size="sm">
                            <List className="h-4 w-4" />
                          </Button>
                          <Select defaultValue="9pt">
                            <SelectTrigger className="w-20 text-xs">
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
                          <span className="mr-2">€</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="text-right"
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
                            className="text-right w-16"
                          />
                          <span className="ml-2">%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="mr-2">€</span>
                          <span className="font-medium">{item.line_total.toFixed(2)}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length === 1}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add line button */}
          <div>
            <Button 
              type="button" 
              onClick={addLineItem}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Voeg regel toe
            </Button>
          </div>

          {/* Footer with payment info */}
          <Card>
            <CardContent className="p-6">
              <Textarea 
                value="Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendeur.nl met omschrijving: %INVOICE_NUMBER%"
                className="h-20 resize-none"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Totals section */}
          <Card className="bg-blue-50">
            <CardContent className="p-6">
              <div className="space-y-2 text-right">
                <div className="flex justify-between">
                  <span>Subtotaal:</span>
                  <span>€ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>BTW:</span>
                  <span>€ {vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-blue-600 border-t pt-2">
                  <span>Totaal:</span>
                  <span>€ {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button 
              type="button" 
              onClick={() => navigate('/facturen')}
              variant="outline"
            >
              Annuleren
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-900"
            >
              {loading ? 'Opslaan...' : 'Opslaan als concept'}
            </Button>
            <Button 
              type="button" 
              onClick={handleSaveAndSend}
              disabled={sendLoading || !formData.client_email}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendLoading ? 'Verzenden...' : 'Opslaan & Versturen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;
