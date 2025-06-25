
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
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <FileText className="h-7 w-7" />
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6">
          {/* Task metadata */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-sm px-3 py-1`}>
                {task.priority}
              </Badge>
              <Badge variant={task.status === 'completed' ? 'default' : 'outline'} className="text-sm px-3 py-1">
                {task.status === 'completed' ? 'Voltooid' : 'Openstaand'}
              </Badge>
              {task.ai_generated && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
                  AI Gegenereerd
                </Badge>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleStatusChange}
                variant="outline"
                size="default"
                className="flex items-center gap-2 px-4 py-2"
              >
                {task.status === 'completed' ? (
                  <>
                    <Clock className="h-5 w-5" />
                    Heropen
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Markeer als Voltooid
                  </>
                )}
              </Button>
              
              {task.ai_draft_content && task.reply_to_email && (
                <Button
                  onClick={handleSendReply}
                  size="default"
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <Send className="h-5 w-5" />
                  Verstuur AI Antwoord
                </Button>
              )}
            </div>
          </div>

          {/* Task details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-base">Aangemaakt:</span>
                <span className="text-base">{formatDate(task.created_at)}</span>
              </div>
              {task.due_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-base">Vervaldatum:</span>
                  <span className="text-base">{new Date(task.due_date).toLocaleDateString('nl-NL')}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              {task.reply_to_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="font-medium text-base">Antwoord naar:</span>
                  <span className="text-base">{task.reply_to_email}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-base">Type:</span>
                <span className="text-base">{task.task_type || 'Algemeen'}</span>
              </div>
            </div>
          </div>

          <Separator className="mb-6" />
        </div>

        {/* Main content - Side by side layout */}
        <div className="px-6 pb-6 flex-1 min-h-0">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Left panel - Original message */}
            <div className="border rounded-lg p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6" />
                <h3 className="text-xl font-semibold">Origineel Bericht</h3>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center flex-1">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : originalEmail ? (
                <div className="flex-1 flex flex-col">
                  <div className="space-y-4 mb-6">
                    <div>
                      <span className="font-medium text-gray-600 text-base">Van:</span>
                      <div className="text-lg font-medium">{originalEmail.from_email}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 text-base">Aan:</span>
                      <div className="text-lg font-medium">{originalEmail.to_email}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 text-base">Onderwerp:</span>
                      <div className="text-lg font-semibold">{originalEmail.subject}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600 text-base">Ontvangen:</span>
                      <div className="text-base text-gray-600">{formatDate(originalEmail.received_at || originalEmail.created_at)}</div>
                    </div>
                  </div>
                  
                  <Separator className="mb-6" />
                  
                  <ScrollArea className="flex-1">
                    <div className="pr-4">
                      {originalEmail.body_html ? (
                        <div 
                          className="prose max-w-none text-base leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: originalEmail.body_html }}
                        />
                      ) : (
                        <div className="whitespace-pre-wrap text-base leading-relaxed">
                          {originalEmail.body_text || originalEmail.content || 'Geen inhoud beschikbaar'}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ) : task.description ? (
                <div className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <span className="font-medium text-gray-600 text-base">Taak beschrijving:</span>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="whitespace-pre-wrap leading-relaxed pr-4 text-base">
                      {task.description}
                    </div>
                  </ScrollArea>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-base">Geen origineel bericht beschikbaar</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right panel - AI Response */}
            <div className="border rounded-lg p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6" />
                <h3 className="text-xl font-semibold">AI Gegenereerde Actie</h3>
              </div>
              
              {task.ai_draft_subject || task.ai_draft_content ? (
                <div className="flex-1 flex flex-col">
                  {task.ai_draft_subject && (
                    <div className="mb-6">
                      <span className="font-medium text-gray-600 text-base">Onderwerp:</span>
                      <div className="text-lg font-semibold mt-2">{task.ai_draft_subject}</div>
                    </div>
                  )}
                  
                  {task.ai_draft_content && (
                    <>
                      {task.ai_draft_subject && <Separator className="mb-6" />}
                      <div className="mb-4">
                        <span className="font-medium text-gray-600 text-base">AI Antwoord:</span>
                      </div>
                      <ScrollArea className="flex-1">
                        <div className="whitespace-pre-wrap leading-relaxed pr-4 text-base">
                          {task.ai_draft_content}
                        </div>
                      </ScrollArea>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-base">Geen AI gegenereerde actie beschikbaar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
