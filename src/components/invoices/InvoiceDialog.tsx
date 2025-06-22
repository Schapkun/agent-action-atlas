
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Send, Bold, Italic, Underline, List, AlignLeft, AlignCenter, AlignRight, Link, Paperclip, MoreHorizontal, MessageSquare } from 'lucide-react';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useInvoiceLines } from '@/hooks/useInvoiceLines';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
}

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

export const InvoiceDialog = ({ isOpen, onClose, invoice }: InvoiceDialogProps) => {
  const { createInvoice, updateInvoice } = useInvoices();
  const { addLine, updateLine, deleteLine } = useInvoiceLines(invoice?.id || null);
  
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

  // Load invoice data when editing
  useEffect(() => {
    if (invoice) {
      setFormData({
        client_name: invoice.client_name,
        client_email: invoice.client_email || '',
        client_address: invoice.client_address || '',
        client_postal_code: invoice.client_postal_code || '',
        client_city: invoice.client_city || '',
        client_country: invoice.client_country || 'Nederland',
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        payment_terms: invoice.payment_terms || 30,
        notes: invoice.notes || '',
        vat_percentage: invoice.vat_percentage
      });
    } else {
      // Reset form for new invoice
      setFormData({
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
      setLineItems([{ description: '', quantity: 1, unit_price: 0, vat_rate: 21, line_total: 0 }]);
    }
  }, [invoice]);

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculate line total
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
      console.log('Submitting invoice form...');
      const { subtotal, vatAmount, total } = calculateTotals();
      
      const invoiceData = {
        ...formData,
        subtotal,
        vat_amount: vatAmount,
        total_amount: total,
        status: 'draft' as const
      };

      console.log('Invoice data to submit:', invoiceData);

      if (invoice) {
        console.log('Updating existing invoice...');
        await updateInvoice(invoice.id, invoiceData);
      } else {
        console.log('Creating new invoice...');
        const newInvoice = await createInvoice(invoiceData);
        console.log('New invoice created:', newInvoice);
        
        // Add line items
        for (const [index, item] of lineItems.entries()) {
          if (item.description.trim()) {
            console.log('Adding line item:', item);
            await addLine({
              invoice_id: newInvoice.id,
              description: item.description,
              quantity: item.quantity,
              unit_price: item.unit_price,
              vat_rate: item.vat_rate,
              line_total: item.line_total,
              sort_order: index
            });
          }
        }
      }

      console.log('Invoice submission completed successfully');
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendLoading(true);

    try {
      // First save the invoice
      await handleSubmit(e);
      
      // Use default email template for sending
      const emailTemplate = {
        subject: "Factuur {invoice_number}",
        message: `Beste {client_name},

Hierbij ontvangt u factuur {invoice_number} van {invoice_date}.

Het totaalbedrag van €{total_amount} dient betaald te worden voor {due_date}.

Met vriendelijke groet,
Uw administratie`
      };

      console.log('Sending invoice with default template:', emailTemplate);
      
      // Send invoice via edge function
      if (invoice || formData.client_email) {
        const { data, error } = await supabase.functions.invoke('send-invoice-email', {
          body: {
            invoice_id: invoice?.id,
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
      
      onClose();
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

  // Create wrapper functions for the DialogFooter component
  const handleSave = () => {
    const event = new Event('submit') as any;
    handleSubmit(event);
  };

  const handleSend = () => {
    const event = new Event('submit') as any;
    handleSaveAndSend(event);
  };

  const { subtotal, vatAmount, total } = calculateTotals();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden p-6">
        {/* Compact header */}
        <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-green-600">📄 Factuur</h2>
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

        <div className="flex-1 flex overflow-hidden">
          {/* Main content area - more compact */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client selection - more compact */}
              <div className="bg-white rounded p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <Label htmlFor="client_select" className="text-sm font-medium">Aan</Label>
                    <div className="flex gap-2 mt-1">
                      <Input 
                        placeholder="Selecteer klant - zoek op naam, klantnummer, plaats, adres, e-mailadres of postcode"
                        className="flex-1 h-8 text-sm"
                        value={formData.client_name}
                        onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      />
                      <Button type="button" variant="outline" size="sm" className="text-blue-500 h-8 px-3 text-xs">Nieuw</Button>
                      <Button type="button" variant="outline" size="sm" className="text-blue-500 h-8 px-3 text-xs">Bewerken</Button>
                    </div>
                  </div>
                  <div className="w-48">
                    <Label className="text-sm font-medium">Profiel</Label>
                    <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                      <SelectTrigger className="mt-1 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debuitendeur.nl">debuitendeur.nl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="mt-5">⚙️</Button>
                </div>
              </div>

              {/* References section - compact */}
              <div className="bg-white rounded p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Referenties</Label>
                  <Button type="button" variant="link" className="text-blue-500 text-xs p-0 h-auto">Bewerk introductie</Button>
                </div>
                <Input placeholder="Voer hier een factuurreferentie in van maximaal 3 regels." className="text-sm h-8" />
              </div>

              {/* Invoice details - more compact */}
              <div className="bg-white rounded p-4 shadow-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Factuur</Label>
                    <div className="flex mt-1">
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded-l border h-8 flex items-center">2025-</span>
                      <Input className="rounded-l-none border-l-0 h-8" placeholder="185" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Datum</Label>
                    <Input 
                      type="date"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                      className="mt-1 h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Vervaldatum</Label>
                    <Input 
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="mt-1 h-8"
                    />
                  </div>
                </div>
              </div>

              {/* Products/Services table - compact */}
              <div className="bg-white rounded shadow-sm">
                <div className="p-3 border-b">
                  <div className="grid grid-cols-6 gap-3 text-sm font-medium text-gray-700">
                    <div>Aantal</div>
                    <div className="col-span-2">Omschrijving</div>
                    <div>Prijs</div>
                    <div>btw</div>
                    <div>Prijs incl. btw</div>
                  </div>
                </div>

                <div className="p-3">
                  {lineItems.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-sm">Er zijn geen productregels</p>
                      <Button 
                        type="button" 
                        onClick={addLineItem}
                        size="sm"
                        className="mt-3 bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                              className="text-center h-8"
                            />
                          </div>
                          <div className="col-span-2">
                            <Textarea
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              placeholder=""
                              className="min-h-[32px] resize-none text-sm"
                              rows={1}
                            />
                            {/* Compact toolbar */}
                            <div className="flex items-center gap-1 mt-1">
                              <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Bold className="h-2.5 w-2.5" />
                              </Button>
                              <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Italic className="h-2.5 w-2.5" />
                              </Button>
                              <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <Underline className="h-2.5 w-2.5" />
                              </Button>
                              <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0">
                                <List className="h-2.5 w-2.5" />
                              </Button>
                              <Select defaultValue="9pt">
                                <SelectTrigger className="h-5 w-12 text-xs border-0">
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
                              <span className="text-sm mr-1">€</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                                className="text-right h-8"
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
                                className="text-right w-12 h-8"
                              />
                              <span className="text-sm ml-1">%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-sm mr-1">€</span>
                              <span className="text-sm font-medium">{item.line_total.toFixed(2)}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLineItem(index)}
                              disabled={lineItems.length === 1}
                              className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Add line button */}
              <div className="bg-white rounded p-3 shadow-sm">
                <Button 
                  type="button" 
                  onClick={addLineItem}
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Voeg regel toe
                </Button>
              </div>

              {/* Footer with payment info */}
              <div className="bg-white rounded p-3 shadow-sm">
                <Textarea 
                  value="Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendeur.nl met omschrijving: %INVOICE_NUMBER%"
                  className="text-sm h-16 resize-none"
                  rows={2}
                />
              </div>
            </form>
          </div>

          {/* Compact right sidebar */}
          <div className="w-64 bg-white border-l p-4 flex flex-col">
            <div className="flex-1">
              {/* Total section */}
              <div className="bg-blue-50 rounded p-3 mb-4">
                <div className="text-right">
                  <div className="text-lg font-bold">Totaal</div>
                  <div className="text-2xl font-bold text-blue-600">€ {total.toFixed(2)}</div>
                  <div className="text-xs text-gray-500 mt-1">Alle statussen</div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-3 border-t">
              <Button 
                type="button" 
                onClick={onClose}
                variant="outline" 
                size="sm"
                className="w-full"
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                size="sm"
                className="w-full bg-gray-800 hover:bg-gray-900"
                onClick={handleSubmit}
              >
                {loading ? 'Opslaan...' : 'Opslaan'}
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveAndSend}
                disabled={sendLoading || !formData.client_email}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-3 w-3 mr-1" />
                {sendLoading ? 'Verzenden...' : 'Opslaan & Versturen'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
