
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  Edit, 
  X,
  Mail,
  Sparkles,
  Reply,
  Forward,
  Plus
} from 'lucide-react';

interface EmailDraftDialogProps {
  task: any;
  isOpen: boolean;
  onClose: () => void;
  onEmailSent: () => void;
  mode?: 'new' | 'reply' | 'forward';
  originalEmail?: any;
}

export const EmailDraftDialog = ({ 
  task, 
  isOpen, 
  onClose, 
  onEmailSent,
  mode = 'new',
  originalEmail
}: EmailDraftDialogProps) => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  // Reset form when task/mode changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Task-based email (AI reply)
        console.log('📧 Setting email draft data for task:', task.id);
        setTo(task.reply_to_email || '');
        setSubject(task.ai_draft_subject || `Re: ${task.emails?.subject || task.title || ''}`);
        setContent(task.ai_draft_content || '');
      } else if (originalEmail && mode === 'reply') {
        // Reply mode
        setTo(originalEmail.from_email);
        setSubject(`Re: ${originalEmail.subject || ''}`);
        setContent('\n\n--- Origineel bericht ---\n' + (originalEmail.body_text || originalEmail.content || ''));
      } else if (originalEmail && mode === 'forward') {
        // Forward mode
        setTo('');
        setSubject(`Fwd: ${originalEmail.subject || ''}`);
        setContent('\n\n--- Doorgestuurd bericht ---\nVan: ' + originalEmail.from_email + '\nOnderwerp: ' + originalEmail.subject + '\n\n' + (originalEmail.body_text || originalEmail.content || ''));
      } else {
        // New email mode
        setTo('');
        setSubject('');
        setContent('');
      }
    } else {
      // Reset form when dialog closes
      setTo('');
      setSubject('');
      setContent('');
    }
  }, [task, isOpen, mode, originalEmail]);

  const getDialogTitle = () => {
    if (task) return 'E-mail Antwoord';
    switch (mode) {
      case 'reply': return 'Antwoorden';
      case 'forward': return 'Doorsturen';
      default: return 'Nieuwe E-mail';
    }
  };

  const getDialogIcon = () => {
    if (task) return Mail;
    switch (mode) {
      case 'reply': return Reply;
      case 'forward': return Forward;
      default: return Plus;
    }
  };

  const handleSendEmail = async () => {
    if (!to.trim() || !subject.trim() || !content.trim()) {
      toast({
        title: "Fout",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      if (task) {
        // Task-based email reply
        console.log('📤 Sending email reply for task:', task.id);
        
        const { data, error } = await supabase.functions.invoke('send-email-reply', {
          body: {
            task_id: task.id,
            to_email: to,
            subject: subject,
            content: content,
            organization_id: task.organization_id,
            workspace_id: task.workspace_id,
            original_email_id: task.email_id,
            thread_id: task.email_thread_id
          }
        });

        if (error) throw error;
      } else {
        // Regular email send
        console.log('📤 Sending regular email');
        
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            to_email: to,
            subject: subject,
            content: content,
            mode: mode,
            original_email_id: originalEmail?.id
          }
        });

        if (error) throw error;
      }

      toast({
        title: "E-mail verzonden",
        description: "Het bericht is succesvol verzonden"
      });

      onEmailSent();
      onClose();
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      toast({
        title: "Fout",
        description: `Kon e-mail niet verzenden: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const DialogIcon = getDialogIcon();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DialogIcon className="h-5 w-5" />
            {getDialogTitle()}
            {task?.ai_generated && (
              <span className="flex items-center gap-1 text-sm font-normal text-blue-600">
                <Sparkles className="h-4 w-4" />
                AI Gegenereerd
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email metadata for task-based emails */}
          {task && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Taak:</span> {task.title}
              </div>
              {task.email_thread_id && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Thread ID:</span> {task.email_thread_id}
                </div>
              )}
              {task.emails && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Origineel onderwerp:</span> {task.emails.subject}
                </div>
              )}
            </div>
          )}

          {/* Recipient */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Naar</label>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="E-mail adres"
              disabled={!!task} // Disable for task-based emails
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Onderwerp</label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="E-mail onderwerp"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Inhoud</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="E-mail inhoud"
              rows={12}
              className="min-h-[300px]"
            />
          </div>

          {task?.ai_generated && (
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 text-sm">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">AI Concept</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Dit antwoord is automatisch gegenereerd door AI. Controleer en pas aan waar nodig.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button 
              onClick={onClose} 
              variant="outline"
              disabled={sending}
            >
              <X className="h-4 w-4 mr-2" />
              Annuleren
            </Button>
            
            <Button 
              onClick={handleSendEmail}
              disabled={sending || !to.trim() || !subject.trim() || !content.trim()}
            >
              {sending ? (
                <>Verzenden...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Verzenden
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
