
-- Voeg de missende kolommen toe aan de dossiers tabel
ALTER TABLE public.dossiers 
ADD COLUMN start_date date,
ADD COLUMN end_date date,
ADD COLUMN deadline_date date,
ADD COLUMN deadline_description text,
ADD COLUMN case_type text,
ADD COLUMN court_instance text,
ADD COLUMN legal_status text,
ADD COLUMN estimated_hours numeric,
ADD COLUMN hourly_rate numeric,
ADD COLUMN intake_notes text,
ADD COLUMN procedure_type text;
