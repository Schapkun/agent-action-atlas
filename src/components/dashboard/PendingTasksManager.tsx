
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { EmailDraftDialog } from './EmailDraftDialog';
import { EmailViewDialog } from './EmailViewDialog';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Clock, 
  Plus, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Mail,
  Sparkles,
  Send,
  Settings,
  Eye,
  Trash2,
  FileText
} from 'lucide-react';

interface PendingTask {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  due_date?: string;
  client_id?: string;
  dossier_id?: string;
  created_at: string;
  task_type: string;
  ai_generated: boolean;
  email_id?: string;
  ai_draft_content?: string;
  ai_draft_subject?: string;
  reply_to_email?: string;
  email_thread_id?: string;
  organization_id: string;
  workspace_id?: string;
  clients?: { name: string };
  dossiers?: { name: string };
  emails?: {
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
    attachments: any;
    folder: string;
    received_at: string;
    created_at: string;
    headers?: any;
  };
}

export const PendingTasksManager = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');
  const [selectedEmailTask, setSelectedEmailTask] = useState<PendingTask | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showCombinedDialog, setShowCombinedDialog] = useState(false);
  const [selectedTaskForCombined, setSelectedTaskForCombined] = useState<PendingTask | null>(null);
  const [selectedEmailForView, setSelectedEmailForView] = useState<any>(null);
  const [showEmailViewDialog, setShowEmailViewDialog] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const fetchTasks = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📋 Fetching pending tasks for organization:', selectedOrganization.id);

      let query = supabase
        .from('pending_tasks')
        .select(`
          *,
          clients(name),
          dossiers(name),
          emails(
            id,
            subject,
            from_email,
            to_email,
            content,
            body_html,
            body_text,
            status,
            priority,
            is_read,
            is_flagged,
            has_attachments,
            attachments,
            folder,
            received_at,
            created_at,
            headers
          )
        `)
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      if (taskTypeFilter !== 'all') {
        query = query.eq('task_type', taskTypeFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      console.log('📋 Pending tasks fetched:', data?.length || 0);
      console.log('📋 Tasks with email data:', data?.filter(t => t.emails).length || 0);
      
      const transformedData = data?.map(task => ({
        ...task,
        emails: task.emails ? {
          ...task.emails,
          attachments: Array.isArray(task.emails.attachments) 
            ? task.emails.attachments 
            : (task.emails.attachments ? JSON.parse(task.emails.attachments as string) : [])
        } : undefined
      })) || [];
      
      setTasks(transformedData);
    } catch (error) {
      console.error('Error fetching pending tasks:', error);
      toast({
        title: "Fout",
        description: "Kon taken niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('pending_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Taak status bijgewerkt"
      });

      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: "Fout",
        description: "Kon taak status niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (deletingTaskId) return; // Prevent double deletion

    setDeletingTaskId(taskId);
    
    try {
      console.log('🗑️ Deleting task:', taskId);
      
      const { error } = await supabase
        .from('pending_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      toast({
        title: "Taak verwijderd",
        description: "De AI actie is succesvol geannuleerd"
      });

      fetchTasks();
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast({
        title: "Fout",
        description: `Kon taak niet verwijderen: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setDeletingTaskId(null);
    }
  };

  const handleEmailTask = (task: PendingTask) => {
    console.log('📧 Opening email draft for task:', task.id, 'with AI content:', !!task.ai_draft_content);
    setSelectedEmailTask(task);
    setShowEmailDialog(true);
  };

  const handleViewEmail = (task: PendingTask) => {
    console.log('👁️ Viewing email for task:', task.id, 'email data:', !!task.emails);
    if (task.emails) {
      const emailForView = {
        ...task.emails,
        attachments: Array.isArray(task.emails.attachments) 
          ? task.emails.attachments 
          : (task.emails.attachments ? JSON.parse(task.emails.attachments as string) : [])
      };
      setSelectedEmailForView(emailForView);
      setShowEmailViewDialog(true);
    } else {
      toast({
        title: "Fout",
        description: "Email gegevens niet beschikbaar",
        variant: "destructive"
      });
    }
  };

  const handleEmailSent = () => {
    fetchTasks();
  };

  const handleManageTask = (task: PendingTask) => {
    if (task.task_type === 'email_reply') {
      console.log('📧 Opening combined email management for task:', task.id);
      setSelectedTaskForCombined(task);
      setShowCombinedDialog(true);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedOrganization, selectedWorkspace, priorityFilter, taskTypeFilter]);

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.dossiers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Hoog</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-orange-600">Gemiddeld</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-green-600">Laag</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="text-blue-600"><Clock className="h-3 w-3 mr-1" />Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-orange-600">In Behandeling</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Voltooid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTaskTypeBadge = (taskType: string, aiGenerated: boolean) => {
    if (taskType === 'email_reply') {
      return (
        <Badge variant="outline" className="text-blue-600">
          <Mail className="h-3 w-3 mr-1" />
          E-mail
          {aiGenerated && <Sparkles className="h-3 w-3 ml-1" />}
        </Badge>
      );
    }
    return <Badge variant="outline">{taskType}</Badge>;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const emailTasks = filteredTasks.filter(task => task.task_type === 'email_reply');
  const generalTasks = filteredTasks.filter(task => task.task_type !== 'email_reply');

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek taken..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Alle prioriteiten</option>
                <option value="high">Hoog</option>
                <option value="medium">Gemiddeld</option>
                <option value="low">Laag</option>
              </select>

              <select
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">Alle typen</option>
                <option value="email_reply">E-mail Antwoorden</option>
                <option value="general">Algemene Taken</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Taak
              </Button>
            </div>
          </div>

          {(selectedOrganization || selectedWorkspace) && (
            <div className="text-sm text-gray-600">
              Context: {getContextInfo()}
            </div>
          )}
        </div>

        {emailTasks.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                E-mail Antwoorden ({emailTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {emailTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-3 hover:shadow-sm transition-all bg-blue-50/50 relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mail className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <h3 className="font-medium text-sm truncate">{task.title}</h3>
                          <div className="flex gap-1 flex-shrink-0">
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                            {task.ai_generated && (
                              <Badge variant="outline" className="text-blue-600 text-xs">
                                <Sparkles className="h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          {task.emails?.subject && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Onderwerp:</span>
                              <span className="truncate">{task.emails.subject}</span>
                            </div>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>Vervalt: {new Date(task.due_date).toLocaleDateString('nl-NL')}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {task.status === 'open' && (
                          <Button
                            size="sm"
                            onClick={() => handleManageTask(task)}
                            className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 h-7"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Beantwoorden
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTask(task.id)}
                          disabled={deletingTaskId === task.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7"
                        >
                          {deletingTaskId === task.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isOverdue(task.due_date) && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="animate-pulse text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Verlopen
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Algemene Taken ({generalTasks.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Taken laden...</div>
            ) : generalTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen algemene taken gevonden</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {generalTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-3 hover:shadow-sm transition-all relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
                          <h3 className="font-medium text-sm truncate">{task.title}</h3>
                          <div className="flex gap-1 flex-shrink-0">
                            {getStatusBadge(task.status)}
                            {getPriorityBadge(task.priority)}
                          </div>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          {task.clients?.name && (
                            <span>Klant: {task.clients.name}</span>
                          )}
                          {task.dossiers?.name && (
                            <span>Dossier: {task.dossiers.name}</span>
                          )}
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.due_date).toLocaleDateString('nl-NL')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {task.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                            className="text-xs px-2 py-1 h-7"
                          >
                            Start
                          </Button>
                        )}
                        
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                            className="text-xs px-2 py-1 h-7"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Voltooien
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="p-1 h-7 w-7"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTask(task.id)}
                          disabled={deletingTaskId === task.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7"
                        >
                          {deletingTaskId === task.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {isOverdue(task.due_date) && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="animate-pulse text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Verlopen
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EmailDraftDialog
        task={selectedEmailTask}
        isOpen={showEmailDialog}
        onClose={() => {
          setShowEmailDialog(false);
          setSelectedEmailTask(null);
        }}
        onEmailSent={() => fetchTasks()}
      />

      <EmailViewDialog
        email={selectedEmailForView}
        isOpen={showEmailViewDialog}
        onClose={() => {
          setShowEmailViewDialog(false);
          setSelectedEmailForView(null);
        }}
      />

      {selectedTaskForCombined && (
        <EnhancedEmailManagementDialog
          task={selectedTaskForCombined}
          isOpen={showCombinedDialog}
          onClose={() => {
            setShowCombinedDialog(false);
            setSelectedTaskForCombined(null);
          }}
          onEmailSent={() => fetchTasks()}
        />
      )}
    </>
  );
};

const EnhancedEmailManagementDialog = ({ task, isOpen, onClose, onEmailSent }: {
  task: PendingTask;
  isOpen: boolean;
  onClose: () => void;
  onEmailSent: () => void;
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (task && isOpen) {
      setSubject(task.ai_draft_subject || `Re: ${task.emails?.subject || task.title || ''}`);
      setContent(task.ai_draft_content || '');
    }
  }, [task, isOpen]);

  const handleSendEmail = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: "Fout",
        description: "Vul alle velden in",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      console.log('📤 Sending email for task:', task.id);
      
      const { data, error } = await supabase.functions.invoke('send-email-reply', {
        body: {
          task_id: task.id,
          to_email: task.reply_to_email,
          subject: subject,
          content: content,
          organization_id: task.organization_id,
          workspace_id: task.workspace_id,
          original_email_id: task.email_id,
          thread_id: task.email_thread_id
        }
      });

      if (error) {
        console.error('❌ Function invoke error:', error);
        throw error;
      }

      if (data && !data.success) {
        console.error('❌ Function returned error:', data.error);
        throw new Error(data.error);
      }

      toast({
        title: "E-mail verzonden",
        description: "Het antwoord is succesvol verzonden"
      });

      onEmailSent();
      onClose();
    } catch (error: any) {
      console.error('❌ Error sending email:', error);
      toast({
        title: "Fout",
        description: error.message || "Kon e-mail niet verzenden. Controleer de configuratie.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-mail Beantwoorden: {task.title}
            {task.ai_generated && (
              <Badge variant="outline" className="text-blue-600">
                <Sparkles className="h-4 w-4 mr-1" />
                AI Gegenereerd
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(90vh-100px)]">
          {/* Ontvangen E-mail Panel */}
          <div className="border-r bg-gray-50 flex flex-col min-h-[600px]">
            <div className="px-4 py-3 bg-blue-600 text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Mail className="h-4 w-4" />
                ONTVANGEN E-MAIL
              </h3>
            </div>
            <div className="flex-1 p-4 min-h-0">
              {task.emails ? (
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {task.emails.subject || 'Geen onderwerp'}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      <strong>Van:</strong> {task.emails.from_email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Ontvangen:</strong> {new Date(task.emails.received_at).toLocaleString('nl-NL')}
                    </p>
                  </CardHeader>
                  <CardContent className="h-full">
                    <ScrollArea className="h-[400px]">
                      <div className="text-sm whitespace-pre-wrap bg-white p-3 rounded border">
                        {task.emails.body_text || task.emails.content || 'Geen inhoud beschikbaar'}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Geen originele e-mail beschikbaar</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Concept Antwoord Panel */}
          <div className="flex flex-col min-h-[600px]">
            <div className="px-4 py-3 bg-orange-600 text-white">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI CONCEPT ANTWOORD
              </h3>
            </div>
            <div className="flex-1 p-4 min-h-0">
              <div className="space-y-4 h-full flex flex-col">
                <div>
                  <label className="text-sm font-medium block mb-1">Onderwerp</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="E-mail onderwerp"
                    className="border-dashed border-2 border-orange-300"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-medium block mb-1">Inhoud</label>
                  <div className="relative flex-1">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="E-mail inhoud"
                      className="h-full min-h-[300px] border-dashed border-2 border-orange-300 resize-none"
                    />
                    {task.ai_generated && (
                      <div className="absolute top-2 right-2 opacity-30 pointer-events-none">
                        <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs font-bold transform rotate-12">
                          CONCEPT
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {task.ai_generated && (
                  <div className="bg-orange-50 border-2 border-dashed border-orange-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-800 text-sm">
                      <Sparkles className="h-4 w-4" />
                      <span className="font-medium">AI Gegenereerd Concept</span>
                    </div>
                    <p className="text-orange-700 text-sm mt-1">
                      Dit antwoord is automatisch gegenereerd door AI. Controleer en pas aan waar nodig voor verzending.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button onClick={onClose} variant="outline" disabled={sending}>
                    Annuleren
                  </Button>
                  <Button 
                    onClick={handleSendEmail}
                    disabled={sending || !subject.trim() || !content.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Verzenden...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Verzenden
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
