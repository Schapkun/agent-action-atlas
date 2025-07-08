
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Email {
  id: string;
  subject: string;
  from_email: string;
  to_email: string;
  content: string;
  body_html?: string;
  body_text?: string;
  status: string;
  priority: string;
  is_read: boolean;
  is_flagged: boolean;
  has_attachments: boolean;
  attachments: any[];
  folder: string;
  received_at: string;
  created_at: string;
  client_id?: string;
  dossier_id?: string;
  message_id?: string;
  thread_id?: string;
  in_reply_to?: string;
  email_references?: string;
}

interface UseEmailRealtimeProps {
  organizationId?: string;
  selectedFolder: string;
  onNewEmail: (email: Email) => void;
  onEmailUpdate: (email: Email) => void;
}

export const useEmailRealtime = ({ 
  organizationId, 
  selectedFolder, 
  onNewEmail, 
  onEmailUpdate 
}: UseEmailRealtimeProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!organizationId) return;

    console.log('📡 Setting up real-time email subscription for org:', organizationId);

    const channel = supabase
      .channel('emails-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emails',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          console.log('📧 New email received via real-time:', payload.new);
          const newEmail = payload.new as Email;
          
          // Transform attachments
          const transformedEmail = {
            ...newEmail,
            attachments: Array.isArray(newEmail.attachments) ? newEmail.attachments : []
          };
          
          // Check if email matches current folder filter
          const matchesFolder = 
            selectedFolder === 'inbox' && transformedEmail.folder === 'inbox' ||
            selectedFolder === 'starred' && transformedEmail.is_flagged ||
            selectedFolder === transformedEmail.folder;
          
          if (matchesFolder) {
            onNewEmail(transformedEmail);
            toast({
              title: "Nieuwe e-mail ontvangen",
              description: `Van: ${transformedEmail.from_email}`,
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'emails',
          filter: `organization_id=eq.${organizationId}`
        },
        (payload) => {
          console.log('📧 Email updated via real-time:', payload.new);
          const updatedEmail = payload.new as Email;
          
          onEmailUpdate({
            ...updatedEmail,
            attachments: Array.isArray(updatedEmail.attachments) ? updatedEmail.attachments : []
          });
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Cleaning up email real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [organizationId, selectedFolder, onNewEmail, onEmailUpdate, toast]);
};
