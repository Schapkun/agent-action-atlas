
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
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [editedSubject, setEditedSubject] = useState('');
  const [editedFromEmail, setEditedFromEmail] = useState('');
  const [editedToEmail, setEditedToEmail] = useState('');
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

  useEffect(() => {
    if (task?.email_id && isOpen) {
      fetchOriginalEmail(task.email_id);
    } else {
      setOriginalEmail(null);
    }
  }, [task?.email_id, isOpen]);

  useEffect(() => {
    if (task && isOpen) {
      setEditedContent(task.ai_draft_content || '');
      setEditedSubject(task.ai_draft_subject || '');
      setIsEditingContent(false);
    }
  }, [task, isOpen]);

  if (!task) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionType = (task: PendingTask) => {
    if (task.ai_draft_content) return 'E-mail Beantwoorden';
    if (task.task_type === 'document_creation') return 'Document Creatie';
    if (task.task_type === 'quote_creation') return 'Offerte Maken';
    return 'Algemene Taak';
  };

  const getClientName = (task: PendingTask) => {
    // This would normally come from a client lookup, for now using a placeholder
    return 'Klant Naam'; // TODO: Implement proper client name lookup
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

  const handleSaveEdit = () => {
    setIsEditingContent(false);
    toast({
      title: "Wijzigingen opgeslagen",
      description: "Je kunt nu het aangepaste antwoord versturen"
    });
  };

  const handleCancelEdit = () => {
    setEditedContent(task.ai_draft_content || '');
    setEditedSubject(task.ai_draft_subject || '');
    setEditedFromEmail(originalEmail?.from_email || '');
    setEditedToEmail(task.reply_to_email || '');
    setIsEditingContent(false);
  };

  const handleClientDossier = () => {
    // TODO: Navigate to client dossier
    toast({
      title: "Klant Dossier",
      description: "Navigatie naar klant dossier wordt geïmplementeerd"
    });
  };

  const handleCommunicationHistory = () => {
    // TODO: Open communication history modal
    toast({
      title: "Communicatie Historie",
      description: "Communicatie historie wordt geladen"
    });
  };

  const hasAIResponse = task.ai_draft_content && task.reply_to_email;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 flex flex-col">
        {/* Compact Header */}
        <DialogHeader className="flex-shrink-0 px-4 py-2 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-base font-semibold text-gray-900">
                {getActionType(task)}
              </DialogTitle>
              <p className="text-xs text-gray-600 mt-0.5">
                {getClientName(task)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs px-2 py-0.5`}>
                {task.priority === 'high' ? 'Hoog' : task.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
              </Badge>
              <Badge variant={task.status === 'completed' ? 'default' : 'outline'} className="text-xs px-2 py-0.5">
                {task.status === 'completed' ? 'Voltooid' : 'Openstaand'}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Main Content - Fixed Height */}
        <div className="flex-1 min-h-0 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Left Panel - Original Email */}
            <div className="border rounded-lg flex flex-col h-full max-h-[600px]">
              <div className="bg-amber-50 px-3 py-1.5 border-b rounded-t-lg flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <h3 className="text-xs font-medium text-amber-800">Originele E-mail</h3>
                </div>
              </div>
              
              <div className="p-2 flex-1 min-h-0 flex flex-col">
                {loading ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                  </div>
                ) : originalEmail ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Compact Fields */}
                    <div className="space-y-1 mb-2 flex-shrink-0">
                      {/* VAN and AAN on one line */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium text-gray-600 text-xs">VAN:</span>
                          <div className="text-xs bg-gray-50 px-1.5 py-0.5 rounded border text-gray-700 truncate">
                            {originalEmail.from_email}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 text-xs">AAN:</span>
                          <div className="text-xs bg-gray-50 px-1.5 py-0.5 rounded border text-gray-700 truncate">
                            {originalEmail.to_email}
                          </div>
                        </div>
                      </div>
                      
                      {/* ONDERWERP */}
                      <div>
                        <span className="font-medium text-gray-600 text-xs">ONDERWERP:</span>
                        <div className="text-xs bg-gray-50 px-1.5 py-0.5 rounded border text-gray-700 font-medium truncate">
                          {originalEmail.subject}
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="mb-2 flex-shrink-0" />
                    
                    {/* BERICHT */}
                    <div className="flex-1 min-h-0">
                      <span className="font-medium text-gray-600 text-xs">BERICHT:</span>
                      <ScrollArea className="h-full mt-1">
                        <div className="bg-gray-50 px-2 py-1.5 rounded border min-h-full">
                          {originalEmail.body_html ? (
                            <div 
                              className="prose prose-xs max-w-none text-xs text-gray-700"
                              dangerouslySetInnerHTML={{ __html: originalEmail.body_html }}
                            />
                          ) : (
                            <div className="whitespace-pre-wrap text-xs text-gray-700">
                              {originalEmail.body_text || originalEmail.content || 'Geen inhoud beschikbaar'}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
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

            {/* Right Panel - AI Response */}
            <div className="border rounded-lg flex flex-col h-full max-h-[600px]">
              <div className="bg-blue-50 px-3 py-1.5 border-b rounded-t-lg flex-shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <h3 className="text-xs font-medium text-blue-800">AI Gegenereerd Antwoord</h3>
                  {!isEditingContent && hasAIResponse && (
                    <Button
                      onClick={() => setIsEditingContent(true)}
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-5 px-1.5 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Bewerken
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="p-2 flex-1 min-h-0 flex flex-col">
                {task.ai_draft_subject || task.ai_draft_content ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Compact Fields */}
                    <div className="space-y-1 mb-2 flex-shrink-0">
                      {/* AAN and VAN on one line */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="font-medium text-gray-600 text-xs">AAN:</span>
                          {isEditingContent ? (
                            <Input
                              value={editedToEmail}
                              onChange={(e) => setEditedToEmail(e.target.value)}
                              className="h-6 text-xs px-1.5 py-0.5"
                            />
                          ) : (
                            <div className="text-xs bg-white px-1.5 py-0.5 rounded border truncate">
                              {task.reply_to_email}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-gray-600 text-xs">VAN:</span>
                          {isEditingContent ? (
                            <Input
                              value={editedFromEmail}
                              onChange={(e) => setEditedFromEmail(e.target.value)}
                              className="h-6 text-xs px-1.5 py-0.5"
                            />
                          ) : (
                            <div className="text-xs bg-white px-1.5 py-0.5 rounded border truncate">
                              {selectedOrganization?.name || 'info@bedrijf.nl'}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* ONDERWERP */}
                      <div>
                        <span className="font-medium text-gray-600 text-xs">ONDERWERP:</span>
                        {isEditingContent ? (
                          <Input
                            value={editedSubject}
                            onChange={(e) => setEditedSubject(e.target.value)}
                            className="h-6 text-xs px-1.5 py-0.5"
                          />
                        ) : (
                          <div className="text-xs bg-white px-1.5 py-0.5 rounded border font-medium truncate">
                            {editedSubject || task.ai_draft_subject}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="mb-2 flex-shrink-0" />
                    
                    {/* BERICHT */}
                    <div className="flex-1 min-h-0">
                      <span className="font-medium text-gray-600 text-xs">BERICHT:</span>
                      {isEditingContent ? (
                        <Textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="mt-1 h-full text-xs resize-none px-2 py-1.5"
                        />
                      ) : (
                        <ScrollArea className="h-full mt-1">
                          <div className="bg-white px-2 py-1.5 rounded border min-h-full">
                            <div className="whitespace-pre-wrap text-xs">
                              {editedContent || task.ai_draft_content}
                            </div>
                          </div>
                        </ScrollArea>
                      )}
                    </div>
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

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between p-3 border-t bg-gray-50">
          <div className="flex gap-2">
            <Button
              onClick={handleClientDossier}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-7 px-2 text-xs"
            >
              <User className="h-3 w-3" />
              Klant Dossier
            </Button>
            <Button
              onClick={handleCommunicationHistory}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 h-7 px-2 text-xs"
            >
              <FolderOpen className="h-3 w-3" />
              Communicatie Historie
            </Button>
          </div>
          
          <div className="flex gap-2">
            {isEditingContent && (
              <>
                <Button
                  onClick={handleCancelEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 h-7 px-2 text-xs"
                >
                  <X className="h-3 w-3" />
                  Annuleren
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  size="sm"
                  className="flex items-center gap-1 h-7 px-2 text-xs"
                >
                  <Save className="h-3 w-3" />
                  Opslaan
                </Button>
              </>
            )}
            
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-xs"
            >
              Sluiten
            </Button>
            
            {hasAIResponse && !isEditingContent && (
              <Button
                onClick={handleSendReply}
                size="sm"
                className="flex items-center gap-1 h-7 px-2 text-xs"
              >
                <Send className="h-3 w-3" />
                Verstuur E-mail
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
