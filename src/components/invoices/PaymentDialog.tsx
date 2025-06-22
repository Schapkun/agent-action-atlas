
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calculator } from 'lucide-react';

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
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePaymentSubmit = async () => {
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Fout",
        description: "Voer een geldig bedrag in",
        variant: "destructive"
      });
      return;
    }

    if (amount > outstandingAmount) {
      toast({
        title: "Fout",
        description: "Bedrag kan niet hoger zijn dan het openstaande bedrag",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const newPaidAmount = paidAmount + amount;
      
      const { error } = await supabase
        .from('invoices')
        .update({ paid_amount: newPaidAmount })
        .eq('id', invoiceId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Betaling van €${amount.toFixed(2)} geregistreerd`
      });

      setOpen(false);
      setPaymentAmount('');
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Betaling Registreren</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Totaal bedrag:</p>
              <p className="font-medium">€{totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Reeds betaald:</p>
              <p className="font-medium">€{paidAmount.toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Openstaand bedrag:</p>
              <p className="font-medium text-orange-600">€{outstandingAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Betaald bedrag</Label>
            <Input
              id="payment-amount"
              type="number"
              step="0.01"
              min="0"
              max={outstandingAmount}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={handlePaymentSubmit} disabled={loading}>
              {loading ? 'Bezig...' : 'Registreren'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
