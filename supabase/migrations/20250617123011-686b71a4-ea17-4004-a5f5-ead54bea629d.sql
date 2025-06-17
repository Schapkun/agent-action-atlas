
-- Verwijder de drie generieke templates die verwarring veroorzaken
UPDATE public.document_templates 
SET is_active = false 
WHERE id IN (
    'ba93f2fa-d1e7-4b58-9acc-123456789abc',  -- Nieuw Document 6
    'a1bdecb8-3456-7890-abcd-ef1234567890',  -- Nieuw Document123  
    'a2ba9239-1234-5678-9abc-def123456789'   -- Nieuw Document
);

-- Verwijder ook eventuele label assignments voor deze templates
DELETE FROM public.document_template_label_assignments 
WHERE template_id IN (
    'ba93f2fa-d1e7-4b58-9acc-123456789abc',
    'a1bdecb8-3456-7890-abcd-ef1234567890', 
    'a2ba9239-1234-5678-9abc-def123456789'
);
