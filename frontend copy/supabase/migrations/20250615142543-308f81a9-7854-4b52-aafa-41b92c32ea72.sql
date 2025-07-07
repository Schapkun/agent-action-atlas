
-- Create quotes table similar to invoices
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  workspace_id UUID,
  template_id UUID,
  quote_number TEXT NOT NULL,
  quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE NOT NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_percentage NUMERIC NOT NULL DEFAULT 21.00,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  notes TEXT,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_address TEXT,
  client_postal_code TEXT,
  client_city TEXT,
  client_country TEXT DEFAULT 'Nederland',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quote lines table
CREATE TABLE public.quote_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  vat_rate NUMERIC NOT NULL DEFAULT 21.00,
  line_total NUMERIC NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create function to generate quote numbers
CREATE OR REPLACE FUNCTION public.generate_quote_number(org_id uuid, workspace_id uuid DEFAULT NULL::uuid)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  quote_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get next sequence number for this organization/workspace
  SELECT COALESCE(MAX(CAST(SPLIT_PART(quote_number, '-', 2) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.quotes 
  WHERE organization_id = org_id 
    AND (workspace_id IS NULL OR public.quotes.workspace_id = generate_quote_number.workspace_id)
    AND quote_number LIKE year_part || '-%';
  
  quote_num := year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN quote_num;
END;
$$;

-- Create trigger to calculate quote totals
CREATE OR REPLACE FUNCTION public.calculate_quote_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update quote totals when quote lines change
  UPDATE public.quotes SET
    subtotal = (
      SELECT COALESCE(SUM(line_total), 0)
      FROM public.quote_lines 
      WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)
    ),
    vat_amount = (
      SELECT COALESCE(SUM(line_total * vat_rate / 100), 0)
      FROM public.quote_lines 
      WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);
  
  -- Update total_amount
  UPDATE public.quotes SET
    total_amount = subtotal + vat_amount,
    updated_at = now()
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for quote totals calculation
CREATE TRIGGER calculate_quote_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_lines
  FOR EACH ROW EXECUTE FUNCTION calculate_quote_totals();
