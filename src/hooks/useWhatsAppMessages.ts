
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppMessage {
  id: string;
  message_id: string;
  from_number: string;
  to_number?: string;
  message_body?: string;
  profile_name?: string;
  timestamp: string;
  status: string;
  raw_webhook_data?: any;
  created_at: string;
}

export const useWhatsAppMessages = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching WhatsApp messages:', error);
      toast({
        title: "Fout",
        description: "Kon WhatsApp berichten niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('whatsapp_messages')
        .update({ status: 'read' })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        )
      );
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      toast({
        title: "Fout",
        description: "Kon bericht niet markeren als gelezen",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('whatsapp_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_messages'
        },
        (payload) => {
          setMessages(prev => [payload.new as WhatsAppMessage, ...prev]);
          toast({
            title: "Nieuw WhatsApp bericht",
            description: `Van: ${payload.new.profile_name || payload.new.from_number}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    messages,
    loading,
    fetchMessages,
    markAsRead
  };
};
