
-- Fix the payment status trigger to not automatically mark €0.00 invoices as paid
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update status based on paid amount if total_amount > 0
  IF NEW.total_amount > 0 THEN
    IF NEW.paid_amount >= NEW.total_amount THEN
      NEW.status = 'paid';
    ELSIF NEW.paid_amount > 0 THEN
      NEW.status = 'partially_paid';
    ELSIF NEW.status = 'paid' OR NEW.status = 'partially_paid' THEN
      -- If paid_amount is 0 but status was paid/partially_paid, set to sent
      NEW.status = 'sent';
    END IF;
  END IF;
  -- For €0.00 invoices, don't automatically change status - let user control it
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix the current invoice 2025-002 status back to 'sent'
UPDATE public.invoices 
SET status = 'sent' 
WHERE invoice_number = '2025-002' 
AND total_amount = 0;
