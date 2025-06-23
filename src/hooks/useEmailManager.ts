
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';

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
}

export const useEmailManager = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchEmails = async (folder?: string) => {
    if (!selectedOrganization) {
      toast({
        title: "Fout",
        description: "Geen organisatie geselecteerd",
        variant: "destructive"
      });
      return [];
    }

    setLoading(true);
    try {
      console.log('📧 Fetching emails for:', selectedOrganization.id);

      let query = supabase
        .from('emails')
        .select('*')
        .eq('organization_id', selectedOrganization.id)
        .order('received_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      if (folder) {
        if (folder === 'starred') {
          query = query.eq('is_flagged', true);
        } else {
          query = query.eq('folder', folder);
        }
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      console.log('📧 Emails loaded:', data?.length || 0);
      setEmails(data || []);
      return data || [];
    } catch (error: any) {
      console.error('❌ Email fetch error:', error);
      toast({
        title: "Fout",
        description: `Kon e-mails niet ophalen: ${error.message}`,
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ is_read: true, status: 'read' })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.map(email => 
        email.id === emailId 
          ? { ...email, is_read: true, status: 'read' }
          : email
      ));

      return true;
    } catch (error: any) {
      console.error('Error marking email as read:', error);
      toast({
        title: "Fout",
        description: "Kon e-mail niet markeren als gelezen",
        variant: "destructive"
      });
      return false;
    }
  };

  const toggleStar = async (emailId: string) => {
    try {
      const email = emails.find(e => e.id === emailId);
      if (!email) return false;

      const { error } = await supabase
        .from('emails')
        .update({ is_flagged: !email.is_flagged })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.map(e => 
        e.id === emailId 
          ? { ...e, is_flagged: !e.is_flagged }
          : e
      ));

      toast({
        title: !email.is_flagged ? "Toegevoegd aan favorieten" : "Verwijderd uit favorieten",
        description: "E-mail status bijgewerkt"
      });

      return true;
    } catch (error: any) {
      console.error('Error toggling star:', error);
      toast({
        title: "Fout",
        description: "Kon e-mail status niet bijwerken",
        variant: "destructive"
      });
      return false;
    }
  };

  const moveToFolder = async (emailId: string, folder: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .update({ folder })
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.map(email => 
        email.id === emailId 
          ? { ...email, folder }
          : email
      ));

      toast({
        title: "E-mail verplaatst",
        description: `E-mail verplaatst naar ${folder}`
      });

      return true;
    } catch (error: any) {
      console.error('Error moving email:', error);
      toast({
        title: "Fout",
        description: "Kon e-mail niet verplaatsen",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('emails')
        .delete()
        .eq('id', emailId);

      if (error) throw error;

      setEmails(prev => prev.filter(email => email.id !== emailId));

      toast({
        title: "E-mail verwijderd",
        description: "E-mail is permanent verwijderd"
      });

      return true;
    } catch (error: any) {
      console.error('Error deleting email:', error);
      toast({
        title: "Fout",
        description: "Kon e-mail niet verwijderen",
        variant: "destructive"
      });
      return false;
    }
  };

  const getWebhookUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/functions/v1/make-email-webhook`;
  };

  return {
    emails,
    loading,
    fetchEmails,
    markAsRead,
    toggleStar,
    moveToFolder,
    deleteEmail,
    getWebhookUrl
  };
};
