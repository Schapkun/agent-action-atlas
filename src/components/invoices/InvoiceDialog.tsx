import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Send } from 'lucide-react';
import { useInvoices, Invoice } from '@/hooks/useInvoices';
import { useInvoiceLines } from '@/hooks/useInvoiceLines';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { DialogFooter } from '@/components/settings/components/DialogFooter';

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
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {invoice ? 'Factuur Bewerken' : 'Nieuwe Factuur'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Klantgegevens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_name">Naam *</Label>
                    <Input
                      id="client_name"
                      value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_email">E-mail</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="client_address">Adres</Label>
                  <Input
                    id="client_address"
                    value={formData.client_address}
                    onChange={(e) => setFormData({...formData, client_address: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="client_postal_code">Postcode</Label>
                    <Input
                      id="client_postal_code"
                      value={formData.client_postal_code}
                      onChange={(e) => setFormData({...formData, client_postal_code: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_city">Plaats</Label>
                    <Input
                      id="client_city"
                      value={formData.client_city}
                      onChange={(e) => setFormData({...formData, client_city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_country">Land</Label>
                    <Input
                      id="client_country"
                      value={formData.client_country}
                      onChange={(e) => setFormData({...formData, client_country: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Factuurgegevens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="invoice_date">Factuurdatum</Label>
                    <Input
                      id="invoice_date"
                      type="date"
                      value={formData.invoice_date}
                      onChange={(e) => setFormData({...formData, invoice_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Vervaldatum</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment_terms">Betalingstermijn (dagen)</Label>
                    <Input
                      id="payment_terms"
                      type="number"
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({...formData, payment_terms: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Factuurregels</CardTitle>
                <Button type="button" onClick={addLineItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Regel toevoegen
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Label>Omschrijving</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Beschrijving van het item"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Aantal</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Prijs</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>BTW%</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.vat_rate}
                        onChange={(e) => updateLineItem(index, 'vat_rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="col-span-1">
                      <Label>Totaal</Label>
                      <div className="px-3 py-2 bg-gray-50 rounded text-sm">
                        €{item.line_total.toFixed(2)}
                      </div>
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        disabled={lineItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Totals */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2 max-w-md ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotaal:</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>BTW:</span>
                    <span>€{vatAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Totaal:</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notities</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Extra opmerkingen voor deze factuur..."
                  rows={3}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Annuleren
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Opslaan...' : (invoice ? 'Bijwerken' : 'Opslaan')}
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

        <DialogFooter
          onCancel={onClose}
          onSave={handleSave}
          saving={loading}
          showSendButton={true}
          onSend={handleSend}
          sending={sendLoading}
          sendDisabled={!formData.client_email}
        />
      </DialogContent>
    </Dialog>
  );
};
