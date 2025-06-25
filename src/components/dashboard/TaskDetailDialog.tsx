
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Clock, 
  Send,
  Mail,
  MessageSquare,
  Calendar,
  User,
  FileText
} from 'lucide-react';

interface PendingTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  task_type?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  created_by?: string;
  client_id?: string;
  dossier_id?: string;
  email_id?: string;
  ai_generated?: boolean;
  ai_draft_subject?: string;
  ai_draft_content?: string;
  reply_to_email?: string;
  email_thread_id?: string;
}

interface Email {
  id: string;
  subject: string;
  from_email: string;
  to_email: string;
  content: string;
  body_html?: string;
  body_text?: string;
  received_at: string;
  created_at: string;
}

interface TaskDetailDialogProps {
  task: PendingTask | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (taskId: string, status: string) => void;
}

export const TaskDetailDialog = ({ 
  task, 
  isOpen, 
  onClose, 
  onStatusUpdate 
}: TaskDetailDialogProps) => {
  const [originalEmail, setOriginalEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchOriginalEmail = async (emailId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('id', emailId)
        .single();

      if (error) throw error;
      setOriginalEmail(data);
    } catch (error) {
      console.error('Error fetching original email:', error);
      toast({
        title: "Fout",
        description: "Kon originele e-mail niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (task?.email_id && isOpen) {
      fetchOriginalEmail(task.email_id);
    } else {
      setOriginalEmail(null);
    }
  }, [task?.email_id, isOpen]);

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = () => {
    const newStatus = task.status === 'completed' ? 'open' : 'completed';
    onStatusUpdate(task.id, newStatus);
    onClose();
  };

  const handleSendReply = async () => {
    if (!task.ai_draft_content || !task.reply_to_email) {
      toast({
        title: "Fout",
        description: "Geen draft inhoud of e-mail adres beschikbaar",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email-reply', {
        body: {
          task_id: task.id,
          to_email: task.reply_to_email,
          subject: task.ai_draft_subject || 'Re: ' + (originalEmail?.subject || task.title),
          content: task.ai_draft_content
        }
      });

      if (error) throw error;

      toast({
        title: "E-mail verzonden",
        description: "Het AI-antwoord is succesvol verzonden"
      });

      // Update task status to completed after sending
      onStatusUpdate(task.id, 'completed');
      onClose();
    } catch (error: any) {
      console.error('Error sending reply:', error);
      toast({
        title: "Fout",
        description: `Kon e-mail niet verzenden: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 p-6">
          {/* Task metadata */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                {task.status === 'completed' ? 'Voltooid' : 'Openstaand'}
              </Badge>
              {task.ai_generated && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  AI Gegenereerd
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleStatusChange}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {task.status === 'completed' ? (
                  <>
                    <Clock className="h-4 w-4" />
                    Heropen
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Markeer als Voltooid
                  </>
                )}
              </Button>
              
              {task.ai_draft_content && task.reply_to_email && (
                <Button
                  onClick={handleSendReply}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Verstuur AI Antwoord
                </Button>
              )}
            </div>
          </div>

          {/* Task details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Aangemaakt:</span>
                <span>{formatDate(task.created_at)}</span>
              </div>
              {task.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Vervaldatum:</span>
                  <span>{new Date(task.due_date).toLocaleDateString('nl-NL')}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {task.reply_to_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">Antwoord naar:</span>
                  <span>{task.reply_to_email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span className="font-medium">Type:</span>
                <span>{task.task_type || 'Algemeen'}</span>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Two-column layout for original message and AI response */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
            {/* Left column: Original message */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Origineel Bericht
              </h3>
              
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : originalEmail ? (
                <div className="border rounded-lg p-4 h-full">
                  <div className="space-y-3 mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Van:</span> {originalEmail.from_email}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Aan:</span> {originalEmail.to_email}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Onderwerp:</span> {originalEmail.subject}
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">Ontvangen:</span> {formatDate(originalEmail.received_at || originalEmail.created_at)}
                    </div>
                  </div>
                  
                  <Separator className="mb-4" />
                  
                  <ScrollArea className="h-64">
                    <div className="pr-4">
                      {originalEmail.body_html ? (
                        <div 
                          className="prose max-w-none text-sm"
                          dangerouslySetInnerHTML={{ __html: originalEmail.body_html }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-sm">
                          {originalEmail.body_text || originalEmail.content || 'Geen inhoud beschikbaar'}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : task.description ? (
                <div className="border rounded-lg p-4 h-full">
                  <div className="text-sm text-gray-600 mb-2">Taak beschrijving:</div>
                  <ScrollArea className="h-64">
                    <div className="whitespace-pre-wrap text-sm">
                      {task.description}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="border rounded-lg p-4 h-full flex items-center justify-center text-gray-500">
                  Geen origineel bericht beschikbaar
                </div>
              )}
            </div>

            {/* Right column: AI generated response */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                AI Gegenereerde Actie
              </h3>
              
              {task.ai_draft_subject || task.ai_draft_content ? (
                <div className="border rounded-lg p-4 h-full">
                  {task.ai_draft_subject && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-1">Onderwerp:</div>
                      <div className="font-medium text-sm">{task.ai_draft_subject}</div>
                    </div>
                  )}
                  
                  {task.ai_draft_content && (
                    <>
                      <Separator className="mb-4" />
                      <div className="text-sm text-gray-600 mb-2">AI Antwoord:</div>
                      <ScrollArea className="h-64">
                        <div className="whitespace-pre-wrap text-sm pr-4">
                          {task.ai_draft_content}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg p-4 h-full flex items-center justify-center text-gray-500">
                  Geen AI gegenereerde actie beschikbaar
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
