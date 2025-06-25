
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimelineItem {
  id: string;
  type: 'email' | 'document' | 'phone_call';
  title: string;
  description?: string;
  date: string;
  status?: string;
  from_email?: string;
  to_email?: string;
  subject?: string;
  document_type?: string;
  call_type?: string;
  duration?: number;
}

export const useDossierTimeline = (clientId?: string) => {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTimeline = async () => {
    if (!clientId) {
      setTimelineItems([]);
      return;
    }

    setLoading(true);
    try {
      console.log('📅 Fetching timeline for client:', clientId);

      // Fetch emails
      const { data: emails, error: emailsError } = await supabase
        .from('emails')
        .select('id, subject, from_email, to_email, created_at, status')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (emailsError) throw emailsError;

      // Fetch documents
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('id, name, document_type, created_at, status')
        .eq('client_name', 'client_id') // Assuming we'll need to match by client
        .order('created_at', { ascending: false });

      if (documentsError) console.warn('Documents query failed:', documentsError);

      // Fetch phone calls
      const { data: calls, error: callsError } = await supabase
        .from('phone_calls')
        .select('id, contact_name, call_type, duration, created_at, notes')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (callsError) console.warn('Phone calls query failed:', callsError);

      // Transform data into timeline items
      const timeline: TimelineItem[] = [];

      // Add emails
      (emails || []).forEach(email => {
        timeline.push({
          id: email.id,
          type: 'email',
          title: email.subject || 'Geen onderwerp',
          description: `Van: ${email.from_email} - Naar: ${email.to_email}`,
          date: email.created_at,
          status: email.status,
          from_email: email.from_email,
          to_email: email.to_email,
          subject: email.subject
        });
      });

      // Add documents
      (documents || []).forEach(doc => {
        timeline.push({
          id: doc.id,
          type: 'document',
          title: doc.name,
          description: `Document type: ${doc.document_type || 'Onbekend'}`,
          date: doc.created_at,
          status: doc.status,
          document_type: doc.document_type
        });
      });

      // Add phone calls
      (calls || []).forEach(call => {
        timeline.push({
          id: call.id,
          type: 'phone_call',
          title: `Telefoongesprek - ${call.contact_name}`,
          description: call.notes || `${call.call_type} gesprek${call.duration ? ` (${call.duration} min)` : ''}`,
          date: call.created_at,
          call_type: call.call_type,
          duration: call.duration
        });
      });

      // Sort by date (newest first)
      timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log('📅 Timeline items fetched:', timeline.length);
      setTimelineItems(timeline);
    } catch (error) {
      console.error('Error fetching timeline:', error);
      toast({
        title: "Fout",
        description: "Kon tijdlijn niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [clientId]);

  return {
    timelineItems,
    loading,
    refreshTimeline: fetchTimeline
  };
};
