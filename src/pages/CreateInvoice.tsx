import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, Send, Bold, Italic, Underline, List, Settings, RotateCcw, RotateCw, Eye, Save } from 'lucide-react';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useQuotes } from '@/hooks/useQuotes';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useInvoiceTemplates } from '@/hooks/useInvoiceTemplates';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContactSelector } from '@/components/contacts/ContactSelector';
import { VatSelector } from '@/components/ui/vat-selector';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface Contact {
  id: string;
  name: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country?: string;
}

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { createInvoice } = useInvoices();
  const { createQuote } = useQuotes();
  const { settings: invoiceSettings } = useInvoiceSettings();
  const { invoiceTemplates, defaultTemplate } = useInvoiceTemplates();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('debuitendeur.nl');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [customInvoiceNumber, setCustomInvoiceNumber] = useState('');
  const [useCustomInvoiceNumber, setUseCustomInvoiceNumber] = useState(false);
  
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

  // Set default template when templates are loaded
  useEffect(() => {
    if (defaultTemplate && !selectedTemplate) {
      setSelectedTemplate(defaultTemplate.id);
    }
  }, [defaultTemplate, selectedTemplate]);

  // Calculate due date based on payment terms and invoice date
  const calculateDueDate = (invoiceDate: string, paymentTerms: number) => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + paymentTerms);
    return date.toISOString().split('T')[0];
  };

  // Update due date when invoice date or payment terms change
  useEffect(() => {
    if (formData.invoice_date && formData.payment_terms) {
      const newDueDate = calculateDueDate(formData.invoice_date, formData.payment_terms);
      setFormData(prev => ({
        ...prev,
        due_date: newDueDate
      }));
    }
  }, [formData.invoice_date, formData.payment_terms]);

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
    }
  };

  const handleContactCreated = (contact: Contact) => {
    console.log('Contact created:', contact);
    // Contact would be added to the contacts list automatically
  };

  const handleContactUpdated = (contact: Contact) => {
    console.log('Contact updated:', contact);
    setSelectedContact(contact);
    handleContactSelect(contact);
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

  const applyTextFormatting = (index: number, type: 'bold' | 'italic' | 'underline' | 'list') => {
    const textarea = document.querySelector(`#description-${index}`) as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch (type) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      case 'list':
        const lines = selectedText.split('\n');
        formattedText = lines.map(line => `• ${line}`).join('\n');
        break;
    }
    
    const newText = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    updateLineItem(index, 'description', newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
    }, 0);
  };

  const handleConvertToQuote = async () => {
    try {
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const quoteData = {
        client_name: formData.client_name,
        client_email: formData.client_email,
        client_address: formData.client_address,
        client_postal_code: formData.client_postal_code,
        client_city: formData.client_city,
        client_country: formData.client_country,
        quote_date: formData.invoice_date,
        valid_until: formData.due_date,
        notes: formData.notes,
        vat_percentage: formData.vat_percentage,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'draft' as const
      };

      await createQuote(quoteData);
      navigate('/offertes/opstellen');
    } catch (error) {
      console.error('Error converting to quote:', error);
      toast({
        title: "Fout",
        description: "Kon factuur niet omzetten naar offerte",
        variant: "destructive"
      });
    }
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
      
      if (formData.client_email) {
        const emailTemplate = {
          subject: "Factuur {invoice_number}",
          message: `Beste {client_name},

Hierbij ontvangt u factuur {invoice_number} van {invoice_date}.

Het totaalbedrag van €{total_amount} dient betaald te worden voor {due_date}.

Met vriendelijke groet,
Uw administratie`
        };

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
      {/* Compact Header with action buttons */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-medium text-green-600">📄 Nieuwe Factuur</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs px-2 py-1">
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" className="text-xs px-2 py-1">
              <RotateCw className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="flex items-center gap-1 text-xs px-2 py-1">
              <Eye className="h-3 w-3" />
              Voorbeeld
            </Button>
            <Button variant="outline" size="sm" onClick={handleConvertToQuote} className="flex items-center gap-1 text-xs px-2 py-1">
              ⚙️ Naar offerte
            </Button>
            
            {/* Action buttons moved to header */}
            <div className="flex items-center gap-2 ml-4 border-l pl-4">
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
                onClick={handleSubmit} 
                disabled={loading}
                size="sm"
                className="bg-gray-800 hover:bg-gray-900 text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                {loading ? 'Opslaan...' : 'Opslaan'}
              </Button>
              <Button 
                onClick={handleSaveAndSend}
                disabled={sendLoading || !formData.client_email}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-xs"
              >
                <Send className="h-3 w-3 mr-1" />
                {sendLoading ? 'Verzenden...' : 'Opslaan & Versturen'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Contact selection with new ContactSelector */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <ContactSelector
                    selectedContact={selectedContact}
                    onContactSelect={handleContactSelect}
                    onContactCreated={handleContactCreated}
                    onContactUpdated={handleContactUpdated}
                  />
                </div>
                <div className="w-48">
                  <Label className="text-xs font-medium">Layout</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue placeholder="Selecteer layout" />
                    </SelectTrigger>
                    <SelectContent>
                      {invoiceTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowSettings(true)} className="mt-4 h-8 w-8 p-0">
                  <Settings className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* References section */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium">Referenties</Label>
                <Button type="button" variant="link" className="text-blue-500 text-xs p-0 h-auto">Bewerk introductie</Button>
              </div>
              <Input placeholder="Voer hier een factuurreferentie in van maximaal 3 regels." className="text-xs h-8" />
            </CardContent>
          </Card>

          {/* Invoice details with improved field widths */}
          <Card>
            <CardContent className="p-3">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs font-medium">Factuur</Label>
                  <div className="flex mt-1">
                    <span className="bg-gray-100 px-2 py-1 rounded-l border text-xs h-8 flex items-center">
                      {invoiceSettings.invoice_prefix}
                    </span>
                    <Input 
                      className="rounded-l-none border-l-0 text-xs h-8 w-16" 
                      value={useCustomInvoiceNumber ? customInvoiceNumber : invoiceSettings.invoice_start_number.toString().padStart(3, '0')}
                      onChange={(e) => {
                        setCustomInvoiceNumber(e.target.value);
                        setUseCustomInvoiceNumber(true);
                      }}
                      onFocus={() => setUseCustomInvoiceNumber(true)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Datum</Label>
                  <Input 
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                    className="mt-1 text-xs h-8 w-32"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium">Betalingstermijn</Label>
                  <div className="flex items-center mt-1">
                    <Input 
                      type="number"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({...formData, payment_terms: parseInt(e.target.value) || 0})}
                      className="text-xs h-8 w-16"
                    />
                    <span className="text-xs ml-2">dagen</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Vervaldatum</Label>
                  <Input 
                    type="date"
                    value={formData.due_date}
                    readOnly
                    className="mt-1 text-xs h-8 w-32 bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products/Services table with improved layout */}
          <Card>
            <CardHeader className="p-2">
              <div className="grid grid-cols-12 gap-1 text-xs font-medium text-gray-700">
                <div className="col-span-1">Aantal</div>
                <div className="col-span-6">Omschrijving</div>
                <div className="col-span-2 text-center">Prijs</div>
                <div className="col-span-1 text-center">btw</div>
                <div className="col-span-2 text-center">Totaal</div>
              </div>
            </CardHeader>

            <CardContent className="p-2">
              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-1 items-start">
                    <div className="col-span-1">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="text-center text-xs h-8 w-12"
                      />
                    </div>
                    <div className="col-span-6">
                      <Textarea
                        id={`description-${index}`}
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder=""
                        className="min-h-[32px] resize-none text-xs"
                        rows={1}
                      />
                      <div className="flex items-center gap-1 mt-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0"
                          onClick={() => applyTextFormatting(index, 'bold')}
                        >
                          <Bold className="h-3 w-3" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0"
                          onClick={() => applyTextFormatting(index, 'italic')}
                        >
                          <Italic className="h-3 w-3" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0"
                          onClick={() => applyTextFormatting(index, 'underline')}
                        >
                          <Underline className="h-3 w-3" />
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0"
                          onClick={() => applyTextFormatting(index, 'list')}
                        >
                          <List className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs">€</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="text-right text-xs h-8 w-20"
                        />
                      </div>
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <VatSelector
                        value={item.vat_rate}
                        onValueChange={(value) => updateLineItem(index, 'vat_rate', value)}
                        className="text-xs h-8 w-14"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-xs">€</span>
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
                value="Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendeur.nl met omschrijving: %INVOICE_NUMBER%"
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

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Klantinstellingen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Btw verlegd</Label>
              <div className="flex gap-2 mt-1">
                <Button variant="outline" size="sm" className="text-xs">Ja</Button>
                <Button variant="outline" size="sm" className="text-xs bg-green-100">Nee</Button>
              </div>
            </div>
            <div>
              <Label className="text-sm">Producten btw</Label>
              <div className="flex gap-2 mt-1">
                <Button variant="outline" size="sm" className="text-xs bg-green-100">incl.</Button>
                <Button variant="outline" size="sm" className="text-xs">excl.</Button>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              Deze opties passen de klant instelling aan. Ingevulde periodieke facturen voor deze klant zullen ook aangepast worden.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Factuur Voorbeeld</DialogTitle>
          </DialogHeader>
          <div className="overflow-auto">
            <div className="bg-white p-8 text-sm">
              <div className="flex justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold">FACTUUR</h1>
                  <p>Factuurnummer: {useCustomInvoiceNumber ? customInvoiceNumber : invoiceSettings.invoice_prefix + invoiceSettings.invoice_start_number.toString().padStart(3, '0')}</p>
                  <p>Factuurdatum: {formData.invoice_date}</p>
                  <p>Vervaldatum: {formData.due_date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{selectedProfile}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-bold mb-2">Factuuradres:</h3>
                  <p>{formData.client_name}</p>
                  <p>{formData.client_address}</p>
                  <p>{formData.client_postal_code} {formData.client_city}</p>
                  <p>{formData.client_country}</p>
                </div>
              </div>

              <table className="w-full border-collapse border border-gray-300 mb-8">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Omschrijving</th>
                    <th className="border border-gray-300 p-2 text-right">Aantal</th>
                    <th className="border border-gray-300 p-2 text-right">Prijs</th>
                    <th className="border border-gray-300 p-2 text-right">BTW</th>
                    <th className="border border-gray-300 p-2 text-right">Totaal</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2" dangerouslySetInnerHTML={{ __html: item.description }}></td>
                      <td className="border border-gray-300 p-2 text-right">{item.quantity}</td>
                      <td className="border border-gray-300 p-2 text-right">€ {item.unit_price.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">{item.vat_rate}%</td>
                      <td className="border border-gray-300 p-2 text-right">€ {item.line_total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="text-right">
                <p>Subtotaal: € {subtotal.toFixed(2)}</p>
                <p>BTW: € {vatAmount.toFixed(2)}</p>
                <p className="font-bold text-lg">Totaal: € {total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateInvoice;
