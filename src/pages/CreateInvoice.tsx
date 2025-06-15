
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Trash2, Send, Bold, Italic, Underline, List, Settings, RotateCcw, RotateCw, Eye, Save, X } from 'lucide-react';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useQuotes } from '@/hooks/useQuotes';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useDocumentTemplates } from '@/hooks/useDocumentTemplates';
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
  payment_terms?: number;
}

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { createInvoice } = useInvoices();
  const { createQuote } = useQuotes();
  const { settings: invoiceSettings } = useInvoiceSettings();
  const { templates: documentTemplates } = useDocumentTemplates();
  const [loading, setLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('debuitendeur.nl');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isInvoiceNumberFocused, setIsInvoiceNumberFocused] = useState(false);
  
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

  // Set default template and payment terms when loaded
  useEffect(() => {
    if (documentTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(documentTemplates[0].id);
    }
    if (invoiceSettings.default_payment_terms) {
      setFormData(prev => ({
        ...prev,
        payment_terms: invoiceSettings.default_payment_terms
      }));
    }
  }, [documentTemplates, selectedTemplate, invoiceSettings]);

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

  // Generate default invoice number
  const getDefaultInvoiceNumber = () => {
    return invoiceSettings.invoice_prefix + invoiceSettings.invoice_start_number.toString().padStart(3, '0');
  };

  // Handle invoice number changes
  const handleInvoiceNumberChange = (value: string) => {
    setInvoiceNumber(value);
  };

  const handleInvoiceNumberFocus = () => {
    setIsInvoiceNumberFocused(true);
    if (!invoiceNumber) {
      setInvoiceNumber(getDefaultInvoiceNumber());
    }
  };

  const handleInvoiceNumberBlur = () => {
    setIsInvoiceNumberFocused(false);
  };

  const getDisplayInvoiceNumber = () => {
    if (invoiceNumber) {
      return invoiceNumber;
    }
    return '';
  };

  const getPlaceholderInvoiceNumber = () => {
    if (!invoiceNumber) {
      return getDefaultInvoiceNumber();
    }
    return '';
  };

  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    if (contact) {
      // Use contact's payment terms if available, otherwise use default
      const contactPaymentTerms = contact.payment_terms || invoiceSettings.default_payment_terms || 30;
      
      setFormData(prev => ({
        ...prev,
        client_name: contact.name,
        client_email: contact.email || '',
        client_address: contact.address || '',
        client_postal_code: contact.postal_code || '',
        client_city: contact.city || '',
        client_country: contact.country || 'Nederland',
        payment_terms: contactPaymentTerms
      }));
    }
  };

  const handleContactClear = () => {
    setSelectedContact(null);
    setFormData(prev => ({
      ...prev,
      client_name: '',
      client_email: '',
      client_address: '',
      client_postal_code: '',
      client_city: '',
      client_country: 'Nederland',
      payment_terms: invoiceSettings.default_payment_terms || 30
    }));
  };

  const handleContactCreated = (contact: Contact) => {
    console.log('Contact created:', contact);
    setSelectedContact(contact);
    handleContactSelect(contact);
    toast({
      title: "Contact opgeslagen",
      description: "Het contact is succesvol aangemaakt en geselecteerd."
    });
  };

  const handleContactUpdated = (contact: Contact) => {
    console.log('Contact updated:', contact);
    setSelectedContact(contact);
    handleContactSelect(contact);
    toast({
      title: "Contact bijgewerkt",
      description: "Het contact is succesvol bijgewerkt."
    });
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
    const element = document.querySelector(`#description-${index}`) as HTMLDivElement;
    if (!element) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;
    
    let formattedHTML = '';
    
    switch (type) {
      case 'bold':
        formattedHTML = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedHTML = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedHTML = `<u>${selectedText}</u>`;
        break;
      case 'list':
        const lines = selectedText.split('\n');
        formattedHTML = '<ul>' + lines.map(line => `<li>${line}</li>`).join('') + '</ul>';
        break;
    }
    
    range.deleteContents();
    const fragment = range.createContextualFragment(formattedHTML);
    range.insertNode(fragment);
    
    // Update the line item description
    updateLineItem(index, 'description', element.innerHTML);
    
    // Clear selection
    selection.removeAllRanges();
  };

  const handleDescriptionChange = (index: number, event: React.FormEvent<HTMLDivElement>) => {
    const content = event.currentTarget.innerHTML;
    updateLineItem(index, 'description', content);
  };

  const generatePreviewHTML = () => {
    const selectedTemplateData = documentTemplates.find(t => t.id === selectedTemplate);
    const { subtotal, vatAmount, total } = calculateTotals();
    
    if (!selectedTemplateData) {
      return `
        <html>
          <head>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 20px; 
                background: white;
                color: #333;
                width: 210mm;
                height: 297mm;
                box-sizing: border-box;
              }
              .header { text-align: center; margin-bottom: 30px; color: #333; }
              .invoice-details { margin-bottom: 30px; }
              .client-info { margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
              .totals { text-align: right; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>FACTUUR</h1>
            </div>
            <div class="invoice-details">
              <p><strong>Factuurnummer:</strong> ${invoiceNumber || getDefaultInvoiceNumber()}</p>
              <p><strong>Factuurdatum:</strong> ${formData.invoice_date}</p>
              <p><strong>Vervaldatum:</strong> ${formData.due_date}</p>
            </div>
            <div class="client-info">
              <h3>Factuuradres:</h3>
              <p>${formData.client_name}</p>
              <p>${formData.client_address}</p>
              <p>${formData.client_postal_code} ${formData.client_city}</p>
              <p>${formData.client_country}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Omschrijving</th>
                  <th>Aantal</th>
                  <th>Prijs</th>
                  <th>BTW</th>
                  <th>Totaal</th>
                </tr>
              </thead>
              <tbody>
                ${lineItems.map(item => `
                  <tr>
                    <td>${item.description || ''}</td>
                    <td>${item.quantity}</td>
                    <td>€ ${item.unit_price.toFixed(2)}</td>
                    <td>${item.vat_rate}%</td>
                    <td>€ ${item.line_total.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="totals">
              <p>Subtotaal: € ${subtotal.toFixed(2)}</p>
              <p>BTW: € ${vatAmount.toFixed(2)}</p>
              <p><strong>Totaal: € ${total.toFixed(2)}</strong></p>
            </div>
          </body>
        </html>
      `;
    }

    let templateHTML = selectedTemplateData.html_content;

    // Replace placeholders with actual data
    templateHTML = templateHTML
      .replace(/\{invoice_number\}/g, invoiceNumber || getDefaultInvoiceNumber())
      .replace(/\{invoice_date\}/g, formData.invoice_date)
      .replace(/\{due_date\}/g, formData.due_date)
      .replace(/\{client_name\}/g, formData.client_name)
      .replace(/\{client_address\}/g, formData.client_address)
      .replace(/\{client_postal_code\}/g, formData.client_postal_code)
      .replace(/\{client_city\}/g, formData.client_city)
      .replace(/\{client_country\}/g, formData.client_country)
      .replace(/\{subtotal\}/g, subtotal.toFixed(2))
      .replace(/\{vat_amount\}/g, vatAmount.toFixed(2))
      .replace(/\{total\}/g, total.toFixed(2))
      .replace(/\{payment_terms\}/g, formData.payment_terms.toString())
      .replace(/\{client_email\}/g, formData.client_email);

    // Generate line items HTML
    const lineItemsHTML = lineItems.map(item => `
      <tr>
        <td>${item.description || ''}</td>
        <td>${item.quantity}</td>
        <td>€ ${item.unit_price.toFixed(2)}</td>
        <td>${item.vat_rate}%</td>
        <td>€ ${item.line_total.toFixed(2)}</td>
      </tr>
    `).join('');

    templateHTML = templateHTML.replace(/\{line_items\}/g, lineItemsHTML);

    return templateHTML;
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
      {/* Header */}
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
          {/* Contact selection */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-end gap-3 mb-2">
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
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Selecteer layout" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      {documentTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setShowSettings(true)} className="h-8 w-8 p-0">
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

          {/* Invoice details */}
          <Card>
            <CardContent className="p-3">
              <div className="grid grid-cols-4 gap-3 items-end">
                <div>
                  <Label className="text-xs font-medium">Factuur</Label>
                  <div className="flex mt-1">
                    <span className="bg-gray-100 px-2 py-1 rounded-l border text-xs h-8 flex items-center">
                      {invoiceSettings.invoice_prefix}
                    </span>
                    <Input 
                      className="rounded-l-none border-l-0 text-xs h-8 w-16" 
                      value={getDisplayInvoiceNumber().replace(invoiceSettings.invoice_prefix, '')}
                      placeholder={getPlaceholderInvoiceNumber().replace(invoiceSettings.invoice_prefix, '')}
                      onChange={(e) => handleInvoiceNumberChange(invoiceSettings.invoice_prefix + e.target.value)}
                      onFocus={handleInvoiceNumberFocus}
                      onBlur={handleInvoiceNumberBlur}
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
                  <div className="flex items-center mt-1 gap-1">
                    <Input 
                      type="number"
                      value={formData.payment_terms || ''}
                      placeholder={invoiceSettings.default_payment_terms?.toString() || '30'}
                      onChange={(e) => setFormData({...formData, payment_terms: parseInt(e.target.value) || invoiceSettings.default_payment_terms || 30})}
                      className="text-xs h-8 w-16"
                    />
                    <span className="text-xs">dagen</span>
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

          {/* Products/Services table */}
          <Card>
            <CardHeader className="p-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-700">
                <div className="col-span-1 text-center">Aantal</div>
                <div className="col-span-6">Omschrijving</div>
                <div className="col-span-2 text-center">Prijs</div>
                <div className="col-span-1 text-center">BTW</div>
                <div className="col-span-2 text-center">Totaal</div>
              </div>
            </CardHeader>

            <CardContent className="p-2">
              <div className="space-y-2">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-1 flex justify-center">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="text-center text-xs h-8 w-14"
                      />
                    </div>
                    <div className="col-span-6">
                      <div className="space-y-1">
                        <div
                          id={`description-${index}`}
                          contentEditable
                          className="min-h-[32px] border rounded p-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                          dangerouslySetInnerHTML={{ __html: item.description }}
                          onInput={(e) => handleDescriptionChange(index, e)}
                          onBlur={(e) => handleDescriptionChange(index, e)}
                          style={{ 
                            minHeight: '32px', 
                            direction: 'ltr', 
                            textAlign: 'left',
                            unicodeBidi: 'normal'
                          }}
                        />
                        <div className="flex items-center gap-1">
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
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-xs">€</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="text-center text-xs h-8 w-20"
                        />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="text-center">
                        <VatSelector
                          value={item.vat_rate}
                          onValueChange={(value) => updateLineItem(index, 'vat_rate', value)}
                          className="text-xs h-8 w-16"
                        />
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xs">€</span>
                          <span className="font-medium text-xs">{item.line_total.toFixed(2)}</span>
                        </div>
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
                  <div>€ {total.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Settings Sidebar */}
      {showSettings && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-lg border-l z-50 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Klantinstellingen</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
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
          </div>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] w-[80vw] flex flex-col">
          <DialogHeader>
            <DialogTitle>Factuur Voorbeeld</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <div className="bg-white mx-auto border shadow-lg" style={{ width: '210mm', height: '297mm', transform: 'scale(0.6)', transformOrigin: 'top left', margin: '0 auto' }}>
              <iframe
                srcDoc={generatePreviewHTML()}
                className="w-full h-full border-0"
                title="Invoice Preview"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateInvoice;
