
-- Voeg contact_number kolom toe aan clients tabel als die nog niet bestaat
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS contact_number VARCHAR;

-- Voeg organization_settings tabel toe als die nog niet bestaat (voor contact prefix/numbering)
-- Deze tabel bestaat al volgens de schema, maar we controleren de benodigde kolommen
ALTER TABLE public.organization_settings 
ADD COLUMN IF NOT EXISTS contact_prefix TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS contact_start_number INTEGER DEFAULT 1;

-- Update bestaande contacten met contact nummers als ze die nog niet hebben
-- Dit script genereert automatisch nummers voor bestaande contacten per organisatie
DO $$
DECLARE
    org_record RECORD;
    contact_record RECORD;
    counter INTEGER;
BEGIN
    -- Loop door elke organisatie
    FOR org_record IN SELECT id FROM public.organizations LOOP
        counter := 1;
        
        -- Loop door contacten zonder contact_number in deze organisatie
        FOR contact_record IN 
            SELECT id FROM public.clients 
            WHERE organization_id = org_record.id 
            AND (contact_number IS NULL OR contact_number = '')
            ORDER BY created_at ASC
        LOOP
            -- Genereer contact nummer
            UPDATE public.clients 
            SET contact_number = LPAD(counter::TEXT, 4, '0')
            WHERE id = contact_record.id;
            
            counter := counter + 1;
        END LOOP;
    END LOOP;
END $$;
