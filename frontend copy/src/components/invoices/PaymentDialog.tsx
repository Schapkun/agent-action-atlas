
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PaymentDialogProps {
  invoiceId: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  onPaymentRegistered: () => void;
  children: React.ReactNode;
}

export const PaymentDialog = ({
  invoiceId,
  totalAmount,
  paidAmount,
  outstandingAmount,
  onPaymentRegistered,
  children
}: PaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(outstandingAmount);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newPaidAmount = paidAmount + paymentAmount;
      
      const { error } = await supabase
        .from('invoices')
        .update({ paid_amount: newPaidAmount })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Betaling van €${paymentAmount.toFixed(2)} geregistreerd`
      });

      setOpen(false);
      onPaymentRegistered();
    } catch (error) {
      console.error('Error registering payment:', error);
      toast({
        title: "Fout",
        description: "Kon betaling niet registreren",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-12">
        <DialogHeader>
          <DialogTitle>Betaling Registreren</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Totaal bedrag</Label>
            <div className="text-lg font-medium">€{totalAmount.toFixed(2)}</div>
          </div>
          
          <div className="space-y-2">
            <Label>Reeds betaald</Label>
            <div className="text-lg">€{paidAmount.toFixed(2)}</div>
          </div>
          
          <div className="space-y-2">
            <Label>Openstaand bedrag</Label>
            <div className="text-lg font-medium text-orange-600">€{outstandingAmount.toFixed(2)}</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Betaalbedrag</Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0"
              max={outstandingAmount}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Bezig...' : 'Registreren'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
