
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  Send,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Edit,
  Save,
  X,
  User,
  FolderOpen
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

interface Client {
  id: string;
  name: string;
  email?: string;
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
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const { toast } = useToast();
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const navigate = useNavigate();

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

  const fetchClient = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error) {
      console.error('Error fetching client:', error);
    }
  };

  useEffect(() => {
    if (task?.email_id && isOpen) {
      fetchOriginalEmail(task.email_id);
    } else {
      setOriginalEmail(null);
    }

    if (task?.client_id && isOpen) {
      fetchClient(task.client_id);
    } else {
      setClient(null);
    }
  }, [task?.email_id, task?.client_id, isOpen]);

  useEffect(() => {
    if (task && isOpen) {
      setEditedContent(task.ai_draft_content || '');
      setEditedSubject(task.ai_draft_subject || '');
    }
  }, [task, isOpen]);

  if (!task) return null;

  const isCompleted = task.status === 'completed';

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-yellow-400 text-yellow-900';
      case 'medium': return 'bg-blue-400 text-blue-900';
      case 'low': return 'bg-green-400 text-green-900';
      default: return 'bg-gray-400 text-gray-900';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-400 text-green-900';
      case 'open': return 'bg-blue-400 text-blue-900';
      default: return 'bg-gray-400 text-gray-900';
    }
  };

  const getActionType = (task: PendingTask) => {
    if (task.ai_draft_content) return 'E-mail Beantwoorden';
    if (task.task_type === 'document_creation') return 'Document Creatie';
    if (task.task_type === 'quote_creation') return 'Offerte Maken';
    return 'Algemene Taak';
  };

  const getClientName = () => {
    return client?.name || 'Onbekende Klant';
  };

  const getClientEmail = () => {
    return client?.email || task.reply_to_email || 'Onbekend e-mail';
  };

  const handleStatusChange = () => {
    const newStatus = task.status === 'completed' ? 'open' : 'completed';
    onStatusUpdate(task.id, newStatus);
    onClose();
  };

  const handleSendReply = async () => {
    if (!editedContent || !task.reply_to_email) {
      toast({
        title: "Fout",
        description: "Geen draft inhoud of e-mail adres beschikbaar",
        variant: "destructive"
      });
      return;
    }

    if (!selectedOrganization) {
      toast({
        title: "Fout",
        description: "Geen organisatie geselecteerd",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('send-email-reply', {
        body: {
          task_id: task.id,
          to_email: task.reply_to_email,
          subject: editedSubject || 'Re: ' + (originalEmail?.subject || task.title),
          content: editedContent,
          organization_id: selectedOrganization.id,
          workspace_id: selectedWorkspace?.id,
          original_email_id: task.email_id,
          thread_id: task.email_thread_id
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

  const handleClientDossier = () => {
    if (task.client_id) {
      navigate('/contacts', { state: { selectedClientId: task.client_id } });
      onClose();
    } else {
      toast({
        title: "Geen klant",
        description: "Er is geen klant gekoppeld aan deze taak"
      });
    }
  };

  const handleCommunicationHistory = () => {
    if (task.client_id) {
      navigate('/contacts', { 
        state: { 
          selectedClientId: task.client_id,
          showCommunicationHistory: true 
        } 
      });
      onClose();
    } else {
      toast({
        title: "Geen klant",
        description: "Er is geen klant gekoppeld aan deze taak"
      });
    }
  };

  const hasAIResponse = task.ai_draft_content && task.reply_to_email;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <div className={`${isCompleted 
          ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
          : 'bg-gradient-to-r from-blue-600 to-purple-600'
        } text-white px-4 py-3 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-2">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
              <div>
                <h1 className="text-sm font-semibold">
                  {isCompleted ? '✓ E-mail Verzonden' : getActionType(task)}
                </h1>
                <p className="text-white/80 text-xs">
                  {getClientName()} - {getClientEmail()}
                  {isCompleted && (
                    <span className="ml-2">
                      • Verzonden op {new Date(task.updated_at).toLocaleDateString('nl-NL')}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getPriorityColor(task.priority)} px-2 py-1 text-xs font-semibold`}>
                {task.priority === 'high' ? 'Hoog' : task.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
              </Badge>
              <Badge className={`${getStatusColor(task.status)} px-2 py-1 text-xs font-semibold`}>
                {task.status === 'completed' ? 'Voltooid' : 'Open'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex min-h-0 h-[600px]">
          {/* Left Panel - Originele E-mail */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="bg-amber-50 border-b px-4 py-2 flex items-center gap-2 flex-shrink-0">
              <div className="bg-amber-100 p-1.5 rounded-lg">
                <Mail className="w-3 h-3 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 text-xs">Originele E-mail</h3>
                <p className="text-xs text-amber-600">
                  Ontvangen: {originalEmail ? new Date(originalEmail.received_at).toLocaleString('nl-NL') : 'Onbekend'}
                </p>
              </div>
              <div className="ml-auto bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium">
                READ-ONLY
              </div>
            </div>

            <div className="p-3 flex-1 flex flex-col min-h-0">
              {loading ? (
                <div className="flex items-center justify-center flex-1">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                </div>
              ) : originalEmail ? (
                <>
                  <div className="space-y-2 flex-shrink-0 mb-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">VAN</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-600">
                          {originalEmail.from_email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">AAN</label>
                        <div className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-600">
                          {originalEmail.to_email}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">ONDERWERP</label>
                      <div className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 text-xs text-gray-600">
                        {originalEmail.subject}
                      </div>
                    </div>
                  </div>

                  <Separator className="mb-3" />

                  <div className="flex-1 min-h-0">
                    <label className="block text-xs font-medium text-gray-700 mb-2">BERICHT</label>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-3 h-full overflow-y-auto">
                      {originalEmail.body_html ? (
                        <div 
                          className="text-xs text-gray-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: originalEmail.body_html }}
                        />
                      ) : (
                        <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {originalEmail.body_text || originalEmail.content || 'Geen inhoud beschikbaar'}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-xs">Geen origineel bericht beschikbaar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Concept/Verzonden Antwoord */}
          <div className="w-1/2 flex flex-col">
            <div className={`${isCompleted 
              ? 'bg-green-50' 
              : 'bg-blue-50'
            } border-b px-4 py-2 flex items-center gap-2 flex-shrink-0`}>
              <div className={`${isCompleted 
                ? 'bg-green-100' 
                : 'bg-blue-100'
              } p-1.5 rounded-lg`}>
                {isCompleted ? (
                  <CheckCircle className={`w-3 h-3 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`} />
                ) : (
                  <MessageSquare className="w-3 h-3 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className={`font-semibold text-xs ${isCompleted ? 'text-green-800' : 'text-blue-800'}`}>
                  {isCompleted ? 'Verzonden Antwoord' : 'Concept Antwoord'}
                </h3>
                <p className={`text-xs ${isCompleted ? 'text-green-600' : 'text-blue-600'} flex items-center gap-2`}>
                  <span className={`w-2 h-2 ${isCompleted ? 'bg-green-400' : 'bg-green-400'} rounded-full`}></span>
                  {isCompleted ? 'Succesvol verzonden' : 'Klaar om te versturen'}
                </p>
              </div>
            </div>

            <div className="p-3 flex-1 flex flex-col min-h-0">
              {task.ai_draft_subject || task.ai_draft_content ? (
                <>
                  <div className="space-y-2 flex-shrink-0 mb-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">VAN</label>
                        <div className={`bg-gray-50 border ${isCompleted ? 'border-green-200' : 'border-blue-200'} rounded-md px-2 py-1.5 text-xs text-gray-600`}>
                          {selectedOrganization?.name || 'info@bedrijf.nl'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">AAN</label>
                        {isCompleted ? (
                          <div className={`bg-gray-50 border ${isCompleted ? 'border-green-200' : 'border-blue-200'} rounded-md px-2 py-1.5 text-xs text-gray-600`}>
                            {task.reply_to_email || ''}
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            value={task.reply_to_email || ''}
                            className="w-full border border-blue-200 rounded-md px-2 py-1.5 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            readOnly
                          />
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">ONDERWERP</label>
                      {isCompleted ? (
                        <div className="bg-gray-50 border border-green-200 rounded-md px-2 py-1.5 text-xs text-gray-600">
                          {editedSubject || task.ai_draft_subject || ''}
                        </div>
                      ) : (
                        <Input
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          className="border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs h-7"
                          placeholder="Voer onderwerp in..."
                        />
                      )}
                    </div>
                  </div>

                  <Separator className="mb-3" />

                  <div className="flex-1 min-h-0">
                    <label className="block text-xs font-medium text-gray-700 mb-2">BERICHT</label>
                    {isCompleted ? (
                      <div className="w-full border border-green-200 rounded-md p-2 h-full overflow-y-auto bg-gray-50">
                        <div className="text-xs whitespace-pre-wrap text-gray-700">
                          {editedContent || task.ai_draft_content}
                        </div>
                      </div>
                    ) : (
                      <Textarea 
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full border border-blue-200 rounded-md p-2 h-full text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Typ je antwoord hier..."
                      />
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-xs">Geen AI gegenereerde actie beschikbaar</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleClientDossier}
              className="text-xs h-8 px-3"
            >
              <User className="w-3 h-3 mr-1" />
              Klant Dossier
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleCommunicationHistory}
              className="text-xs h-8 px-3"
            >
              <FolderOpen className="w-3 h-3 mr-1" />
              Communicatie Historie
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-8 px-4"
            >
              Sluiten
            </Button>
            
            {hasAIResponse && !isCompleted && (
              <Button 
                size="sm"
                onClick={handleSendReply}
                className="bg-blue-600 hover:bg-blue-700 text-xs h-8 px-4"
              >
                <Send className="w-3 h-3 mr-1" />
                Taak uitvoeren
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
