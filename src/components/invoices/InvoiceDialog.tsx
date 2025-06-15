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
      <DialogContent className="max-w-7xl max-h-[95vh] flex flex-col overflow-hidden p-0">
        {/* Header like in screenshot */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-green-600">📄 Factuur</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500">
              Verstuur
            </Button>
            <Button variant="outline">📋</Button>
            <Button variant="outline">❌</Button>
            <Button variant="outline">↶</Button>
            <Button variant="outline">↷</Button>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" className="flex items-center gap-2">
                👁️ Voorbeeld
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                💾 Opslaan als concept
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                ⚙️ Naar offerte
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main content area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client selection section like in screenshot */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="client_select" className="text-sm font-medium">Aan</Label>
                    <div className="flex gap-2 mt-1">
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
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debuitendeur.nl">debuitendeur.nl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="outline" size="icon">⚙️</Button>
                </div>
              </div>

              {/* References section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Referenties</Label>
                  <Button type="button" variant="link" className="text-blue-500 text-sm">Bewerk introductie</Button>
                </div>
                <Input placeholder="Voer hier een factuurreferentie in van maximaal 3 regels." className="text-sm" />
              </div>

              {/* Invoice details section */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="grid grid-cols-6 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium">Factuur</Label>
                    <div className="flex mt-1">
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded-l border">2025-</span>
                      <Input className="rounded-l-none border-l-0" placeholder="185" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Datum</Label>
                    <Input 
                      type="date"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Vervaldatum</Label>
                    <Input 
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Products/Services table */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700 flex-1">
                      <div>Aantal</div>
                      <div className="col-span-2">Omschrijving</div>
                      <div>Prijs</div>
                      <div>btw</div>
                      <div>Prijs incl. btw</div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
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
                    <div className="space-y-2">
                      {lineItems.map((item, index) => (
                        <div key={index} className="grid grid-cols-6 gap-4 items-center">
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
                            <div className="relative">
                              <Textarea
                                value={item.description}
                                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                                placeholder=""
                                className="min-h-[40px] resize-none"
                                rows={1}
                              />
                              {/* Rich text editor toolbar */}
                              <div className="flex items-center gap-1 mt-1 text-gray-500">
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
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <AlignLeft className="h-3 w-3" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <AlignCenter className="h-3 w-3" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <AlignRight className="h-3 w-3" />
                                </Button>
                                <Select defaultValue="9pt">
                                  <SelectTrigger className="h-6 w-16 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="9pt">9pt</SelectItem>
                                    <SelectItem value="10pt">10pt</SelectItem>
                                    <SelectItem value="12pt">12pt</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  📋
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  ❓
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Link className="h-3 w-3" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <Paperclip className="h-3 w-3" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MessageSquare className="h-3 w-3" />
                                </Button>
                              </div>
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
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
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

              {/* Add line and rich text toolbar */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    onClick={addLineItem}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Voeg regel toe
                  </Button>
                  {/* Toolbar buttons as in screenshot */}
                  <div className="flex items-center gap-1 ml-4">
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
                    <Button type="button" variant="ghost" size="sm">
                      📋
                    </Button>
                    <Button type="button" variant="ghost" size="sm">
                      ❓
                    </Button>
                  </div>
                </div>
              </div>

              {/* Footer with payment info */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <Textarea 
                  value="Betaling op rekening NL77 ABNA 0885 5296 34 op naam van debuitendeur.nl met omschrijving: %INVOICE_NUMBER%"
                  className="text-sm"
                  rows={2}
                />
              </div>
            </form>
          </div>

          {/* Right sidebar with total */}
          <div className="w-80 bg-white border-l p-6 flex flex-col">
            <div className="flex-1">
              {/* Total section */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="text-right">
                  <div className="text-2xl font-bold">Totaal</div>
                  <div className="text-3xl font-bold text-blue-600">€ {total.toFixed(2)}</div>
                </div>
              </div>

              {/* Additional options could go here */}
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-4 border-t">
              <Button 
                type="button" 
                onClick={onClose}
                variant="outline" 
                className="w-full"
              >
                Annuleren
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full"
                onClick={handleSubmit}
              >
                {loading ? 'Opslaan...' : (invoice ? 'Bijwerken' : 'Opslaan')}
              </Button>
              <Button 
                type="button" 
                onClick={handleSaveAndSend}
                disabled={sendLoading || !formData.client_email}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendLoading ? 'Verzenden...' : 'Opslaan & Versturen'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
