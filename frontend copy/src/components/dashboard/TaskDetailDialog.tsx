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
    if (task.ai_draft_content) return isCompleted ? '✓ E-mail Verzonden' : 'E-mail Beantwoorden';
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
      toast({
        title: "Navigeren naar klant dossier",
        description: `Openen van dossier voor klant ${getClientName()}...`,
      });
      // This would typically navigate to /contacts/{client_id} or similar
      // window.location.href = `/contacts/${task.client_id}`;
    } else {
      toast({
        title: "Geen klant gekoppeld",
        description: "Er is geen klant aan deze taak gekoppeld",
        variant: "destructive"
      });
    }
  };

  const handleCommunicationHistory = () => {
    if (task.client_id || task.email_thread_id) {
      toast({
        title: "Communicatie historie laden",
        description: `Alle communicatie met ${getClientName()} wordt geladen...`,
      });
      // This would typically open a modal or navigate to communication history
      // You could implement a separate dialog component for this
    } else {
      toast({
        title: "Geen historie beschikbaar",
        description: "Er is geen communicatie historie beschikbaar voor deze taak",
        variant: "destructive"
      });
    }
  };

  const hasAIResponse = task.ai_draft_content && task.reply_to_email;

  // Header gradient colors based on status
  const headerGradient = isCompleted 
    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
    : 'bg-gradient-to-r from-blue-600 to-purple-600';

  // Right panel colors based on status
  const rightPanelHeaderBg = isCompleted ? 'bg-green-50' : 'bg-blue-50';
  const rightPanelHeaderIcon = isCompleted ? 'bg-green-100' : 'bg-blue-100';
  const rightPanelHeaderText = isCompleted ? 'text-green-800' : 'text-blue-800';
  const rightPanelSubText = isCompleted ? 'text-green-600' : 'text-blue-600';
  const rightPanelTitle = isCompleted ? 'Verzonden Antwoord' : 'Concept Antwoord';
  const rightPanelStatus = isCompleted ? 'Verzonden om ' + new Date(task.updated_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) : 'Klaar om te versturen';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex flex-col overflow-hidden">
        {/* Compact Header met Action Type - Status-aware Gradient */}
        <div className={`${headerGradient} text-white px-6 py-3 flex-shrink-0`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-1.5">
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </div>
              <div>
                <h1 className="text-base font-semibold">{getActionType(task)}</h1>
                <p className="text-white/80 text-xs">
                  {getClientName()} - {getClientEmail()}
                  {isCompleted && ` • Voltooid om ${new Date(task.updated_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${getPriorityColor(task.priority)} px-2 py-1 rounded-full text-xs font-semibold`}>
                {task.priority === 'high' ? 'Hoog' : task.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
              </span>
              <span className={`${getStatusColor(task.status)} px-2 py-1 rounded-full text-xs font-semibold`}>
                {isCompleted ? '✓ Voltooid' : 'Open'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Area - Fixed Height */}
        <div className="h-[600px] flex flex-1 min-h-0">
          {/* Left Panel - Originele E-mail (Read-only) */}
          <div className="w-1/2 border-r flex flex-col">
            {/* Panel Header */}
            <div className="bg-amber-50 border-b px-4 py-2 flex items-center gap-3 flex-shrink-0">
              <div className="bg-amber-100 p-1.5 rounded-lg">
                <Mail className="w-3 h-3 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 text-sm">Originele E-mail</h3>
                <p className="text-xs text-amber-600">
                  Ontvangen: {originalEmail ? new Date(originalEmail.received_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }) + ' vandaag' : 'Onbekend'}
                </p>
              </div>
              <div className="ml-auto bg-gray-400 text-white px-2 py-0.5 rounded text-xs font-medium">READ-ONLY</div>
            </div>

            <div className="p-4 flex-1 flex flex-col min-h-0">
              {loading ? (
                <div className="flex items-center justify-center flex-1">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
                </div>
              ) : originalEmail ? (
                <>
                  {/* Compacte Email metadata op 1 regel */}
                  <div className="space-y-2 flex-shrink-0 mb-3">
                    {/* VAN en AAN op 1 regel */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">VAN</label>
                        <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-600">
                          {originalEmail.from_email}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">AAN</label>
                        <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-600">
                          {originalEmail.to_email}
                        </div>
                      </div>
                    </div>
                    
                    {/* ONDERWERP compacter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">ONDERWERP</label>
                      <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-600">
                        {originalEmail.subject}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-3 flex-shrink-0"></div>

                  {/* Email content met juiste hoogte */}
                  <div className="flex-1 min-h-0">
                    <label className="block text-xs font-medium text-gray-500 mb-2">BERICHT</label>
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 h-full overflow-y-auto">
                      {originalEmail.body_html ? (
                        <div 
                          className="text-xs text-gray-600 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: originalEmail.body_html }}
                        />
                      ) : (
                        <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {originalEmail.body_text || originalEmail.content || 'Geen inhoud beschikbaar'}
                        </div>
                      )}
                    </div>
                  </div>
                </>
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

          {/* Right Panel - Concept/Verzonden Antwoord */}
          <div className="w-1/2 flex flex-col">
            {/* Panel Header - Status-aware */}
            <div className={`${rightPanelHeaderBg} border-b px-4 py-2 flex items-center gap-3 flex-shrink-0`}>
              <div className={`${rightPanelHeaderIcon} p-1.5 rounded-lg`}>
                {isCompleted ? (
                  <CheckCircle className={`w-3 h-3 ${rightPanelSubText}`} />
                ) : (
                  <MessageSquare className={`w-3 h-3 ${rightPanelSubText}`} />
                )}
              </div>
              <div>
                <h3 className={`font-semibold ${rightPanelHeaderText} text-sm`}>{rightPanelTitle}</h3>
                <p className={`text-xs ${rightPanelSubText} flex items-center gap-1`}>
                  <span className={`w-1.5 h-1.5 ${isCompleted ? 'bg-green-500' : 'bg-green-400'} rounded-full`}></span>
                  {rightPanelStatus}
                </p>
              </div>
              {isCompleted && (
                <div className="ml-auto bg-green-500 text-white px-2 py-0.5 rounded text-xs font-medium">VERZONDEN</div>
              )}
            </div>

            <div className="p-4 flex-1 flex flex-col min-h-0">
              {task.ai_draft_subject || task.ai_draft_content ? (
                <>
                  {/* Compacte Email metadata op 1 regel - GECORRIGEERDE VOLGORDE */}
                  <div className="space-y-2 flex-shrink-0 mb-3">
                    {/* VAN en AAN op 1 regel - ZELFDE VOLGORDE ALS LINKS */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">VAN</label>
                        {isCompleted ? (
                          <div className="bg-green-50 border border-green-200 rounded px-2 py-1 text-xs text-gray-600">
                            {selectedOrganization?.name || 'info@bedrijf.nl'}
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            value={selectedOrganization?.name || 'info@bedrijf.nl'}
                            className="w-full border border-blue-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            readOnly
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">AAN</label>
                        {isCompleted ? (
                          <div className="bg-green-50 border border-green-200 rounded px-2 py-1 text-xs text-gray-600">
                            {task.reply_to_email}
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            value={task.reply_to_email || ''}
                            className="w-full border border-blue-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            readOnly
                          />
                        )}
                      </div>
                    </div>
                    
                    {/* ONDERWERP compacter */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">ONDERWERP</label>
                      {isCompleted ? (
                        <div className="bg-green-50 border border-green-200 rounded px-2 py-1 text-xs text-gray-600">
                          {editedSubject || task.ai_draft_subject || ''}
                        </div>
                      ) : (
                        <Input
                          value={editedSubject}
                          onChange={(e) => setEditedSubject(e.target.value)}
                          className="text-xs px-2 py-1 border-blue-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-3 flex-shrink-0"></div>

                  {/* Email content met juiste hoogte - Direct editable of read-only */}
                  <div className="flex-1 min-h-0">
                    <label className="block text-xs font-medium text-gray-700 mb-2">BERICHT</label>
                    {isCompleted ? (
                      <div className="bg-green-50 border border-green-200 rounded p-3 h-full overflow-y-auto">
                        <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {editedContent || task.ai_draft_content}
                        </div>
                      </div>
                    ) : (
                      <textarea 
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full border border-blue-200 rounded p-3 h-full text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Typ je antwoord hier..."
                      />
                    )}
                  </div>
                </>
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

        {/* Footer Action Bar */}
        <div className="border-t bg-gray-50 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClientDossier}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              title={task.client_id ? `Ga naar dossier van ${getClientName()}` : 'Geen klant gekoppeld'}
            >
              <User className="w-4 h-4" />
              Klant Dossier
            </button>
            <button 
              onClick={handleCommunicationHistory}
              className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
              title={task.client_id || task.email_thread_id ? `Bekijk alle communicatie met ${getClientName()}` : 'Geen communicatie historie beschikbaar'}
            >
              <FolderOpen className="w-4 h-4" />
              Communicatie Historie
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Sluiten
            </button>
            
            {hasAIResponse && !isCompleted && (
              <button 
                onClick={handleSendReply}
                className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Taak uitvoeren
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
