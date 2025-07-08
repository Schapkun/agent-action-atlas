
-- Add columns to support partial payments
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS paid_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS outstanding_amount numeric GENERATED ALWAYS AS (total_amount - paid_amount) STORED;

-- Update existing invoices to set paid_amount based on current status
UPDATE public.invoices 
SET paid_amount = CASE 
  WHEN status = 'paid' THEN total_amount 
  ELSE 0 
END
WHERE paid_amount IS NULL OR paid_amount = 0;

-- Create trigger to automatically update status based on paid_amount
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on paid amount
  IF NEW.paid_amount >= NEW.total_amount THEN
    NEW.status = 'paid';
  ELSIF NEW.paid_amount > 0 THEN
    NEW.status = 'partially_paid';
  ELSIF NEW.status = 'paid' OR NEW.status = 'partially_paid' THEN
    -- If paid_amount is 0 but status was paid/partially_paid, set to sent
    NEW.status = 'sent';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_payment_status
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_payment_status();
