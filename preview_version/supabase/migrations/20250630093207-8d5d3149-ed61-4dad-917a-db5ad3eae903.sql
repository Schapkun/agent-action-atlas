
-- Maak een tabel voor WhatsApp berichten
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT NOT NULL UNIQUE,
  from_number TEXT NOT NULL,
  to_number TEXT,
  message_body TEXT,
  profile_name TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  raw_webhook_data JSONB,
  status TEXT NOT NULL DEFAULT 'received',
  organization_id UUID,
  workspace_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voeg RLS toe
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Maak een index voor snellere queries
CREATE INDEX idx_whatsapp_messages_from_number ON public.whatsapp_messages(from_number);
CREATE INDEX idx_whatsapp_messages_timestamp ON public.whatsapp_messages(timestamp);
CREATE INDEX idx_whatsapp_messages_message_id ON public.whatsapp_messages(message_id);

-- Voeg een trigger toe voor updated_at
CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
