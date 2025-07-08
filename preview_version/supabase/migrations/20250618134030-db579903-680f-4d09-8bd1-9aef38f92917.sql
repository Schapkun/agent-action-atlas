
-- Add missing columns to the clients table for contact management
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS mobile text,
ADD COLUMN IF NOT EXISTS contact_person text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS payment_terms integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'bankoverschrijving',
ADD COLUMN IF NOT EXISTS iban text,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS default_discount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_type text DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS products_display text DEFAULT 'incl_btw',
ADD COLUMN IF NOT EXISTS invoice_reference text,
ADD COLUMN IF NOT EXISTS hide_notes_on_invoice boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS billing_address text,
ADD COLUMN IF NOT EXISTS shipping_address text,
ADD COLUMN IF NOT EXISTS shipping_instructions text,
ADD COLUMN IF NOT EXISTS shipping_method text DEFAULT 'E-mail',
ADD COLUMN IF NOT EXISTS reminder_email text;
