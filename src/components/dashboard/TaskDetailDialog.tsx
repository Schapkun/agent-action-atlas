
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

  const hasAIResponse = task.ai_draft_content && task.reply_to_email;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-4 w-4" />
            {task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4">
          {/* Task metadata */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs px-2 py-1`}>
                {task.priority}
              </Badge>
              <Badge variant={task.status === 'completed' ? 'default' : 'outline'} className="text-xs px-2 py-1">
                {task.status === 'completed' ? 'Voltooid' : 'Openstaand'}
              </Badge>
              {task.ai_generated && (
                <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                  AI Gegenereerd
                </Badge>
              )}
            </div>
            
            <div className="flex gap-2">
              {!hasAIResponse && (
                <Button
                  onClick={handleStatusChange}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {task.status === 'completed' ? (
                    <>
                      <Clock className="h-3 w-3" />
                      Heropen
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Markeer als Voltooid
                    </>
                  )}
                </Button>
              )}
              
              {hasAIResponse && (
                <Button
                  onClick={handleSendReply}
                  size="sm"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  <Send className="h-3 w-3" />
                  Verstuur AI Antwoord
                </Button>
              )}
            </div>
          </div>

          {/* Task details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-400" />
                <span className="font-medium text-sm">Aangemaakt:</span>
                <span className="text-sm">{formatDate(task.created_at)}</span>
              </div>
              {task.due_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-gray-400" />
                  <span className="font-medium text-sm">Vervaldatum:</span>
                  <span className="text-sm">{new Date(task.due_date).toLocaleDateString('nl-NL')}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {task.reply_to_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="font-medium text-sm">Antwoord naar:</span>
                  <span className="text-sm">{task.reply_to_email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MessageSquare className="h-3 w-3 text-gray-400" />
                <span className="font-medium text-sm">Type:</span>
                <span className="text-sm">{task.task_type || 'Algemeen'}</span>
              </div>
            </div>
          </div>

          <Separator className="mb-3" />
        </div>

        {/* Main content - Side by side layout */}
        <div className="px-4 pb-4 flex-1 min-h-0">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Left panel - Original message */}
            <div className="border rounded-lg flex flex-col h-full">
              {/* Banner */}
              <div className="bg-gray-50 px-3 py-2 border-b rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <h3 className="text-base font-medium text-gray-800">Originele Input/E-mail</h3>
                </div>
              </div>
              
              <div className="p-3 flex-1 min-h-0 flex flex-col">
                {loading ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : originalEmail ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="space-y-2 mb-3">
                      <div>
                        <span className="font-medium text-gray-600 text-xs">Van:</span>
                        <div className="text-sm">{originalEmail.from_email}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-xs">Aan:</span>
                        <div className="text-sm">{originalEmail.to_email}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-xs">Onderwerp:</span>
                        <div className="text-sm font-medium">{originalEmail.subject}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600 text-xs">Ontvangen:</span>
                        <div className="text-xs text-gray-600">{formatDate(originalEmail.received_at || originalEmail.created_at)}</div>
                      </div>
                    </div>
                    
                    <Separator className="mb-3" />
                    
                    <ScrollArea className="flex-1 h-[400px]">
                      <div className="pr-3">
                        {originalEmail.body_html ? (
                          <div 
                            className="prose prose-sm max-w-none text-sm"
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
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="mb-2">
                      <span className="font-medium text-gray-600 text-xs">Taak beschrijving:</span>
                    </div>
                    <ScrollArea className="flex-1 h-[400px]">
                      <div className="whitespace-pre-wrap text-sm pr-3">
                        {task.description}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Geen origineel bericht beschikbaar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right panel - AI Response */}
            <div className="border rounded-lg flex flex-col h-full">
              {/* Banner */}
              <div className="bg-blue-50 px-3 py-2 border-b rounded-t-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base font-medium text-blue-800">AI Gegenereerde Actie</h3>
                </div>
              </div>
              
              <div className="p-3 flex-1 min-h-0 flex flex-col">
                {task.ai_draft_subject || task.ai_draft_content ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {task.ai_draft_subject && (
                      <div className="mb-3">
                        <span className="font-medium text-gray-600 text-xs">Onderwerp:</span>
                        <div className="text-sm font-medium mt-1">{task.ai_draft_subject}</div>
                      </div>
                    )}
                    
                    {task.ai_draft_content && (
                      <>
                        {task.ai_draft_subject && <Separator className="mb-3" />}
                        <div className="mb-2">
                          <span className="font-medium text-gray-600 text-xs">AI Antwoord:</span>
                        </div>
                        <ScrollArea className="flex-1 h-[400px]">
                          <div className="whitespace-pre-wrap text-sm pr-3">
                            {task.ai_draft_content}
                          </div>
                        </ScrollArea>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Geen AI gegenereerde actie beschikbaar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
