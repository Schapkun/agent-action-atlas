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
  Send,
  Eye,
  Trash2,
  FileText,
  AlertCircle
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
  const [completedTasks, setCompletedTasks] = useState<PendingTask[]>([]);
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

      let baseQuery = supabase
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
        baseQuery = baseQuery.eq('workspace_id', selectedWorkspace.id);
      }

      if (priorityFilter !== 'all') {
        baseQuery = baseQuery.eq('priority', priorityFilter);
      }

      if (taskTypeFilter !== 'all') {
        baseQuery = baseQuery.eq('task_type', taskTypeFilter);
      }

      // Fetch open tasks
      const openQuery = baseQuery.eq('status', 'open');
      const { data: openData, error: openError } = await openQuery;

      if (openError) throw openError;

      // Fetch completed tasks
      const completedQuery = baseQuery.eq('status', 'completed');
      const { data: completedData, error: completedError } = await completedQuery;

      if (completedError) throw completedError;

      console.log('📋 Open tasks fetched:', openData?.length || 0);
      console.log('📋 Completed tasks fetched:', completedData?.length || 0);
      
      const transformData = (data: any[]) => data?.map(task => ({
        ...task,
        emails: task.emails ? {
          ...task.emails,
          attachments: Array.isArray(task.emails.attachments) 
            ? task.emails.attachments 
            : (task.emails.attachments ? JSON.parse(task.emails.attachments as string) : [])
        } : undefined
      })) || [];
      
      setTasks(transformData(openData));
      setCompletedTasks(transformData(completedData));
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
      console.log('🔄 Updating task status:', { taskId, newStatus });
      
      const { error } = await supabase
        .from('pending_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) {
        console.error('❌ Task status update error:', error);
        throw error;
      }

      console.log('✅ Task status updated successfully');
      
      toast({
        title: "Succes",
        description: "Taak status bijgewerkt"
      });

      fetchTasks();
    } catch (error: any) {
      console.error('❌ Error updating task status:', error);
      toast({
        title: "Fout",
        description: `Kon taak status niet bijwerken: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (deletingTaskId) {
      console.log('⏳ Delete already in progress, ignoring duplicate request');
      return;
    }

    setDeletingTaskId(taskId);
    
    try {
      console.log('🗑️ Starting task deletion process:', taskId);
      console.log('🗑️ Organization:', selectedOrganization?.id);
      console.log('🗑️ Workspace:', selectedWorkspace?.id);
      
      // First verify the task exists and belongs to the organization
      const { data: existingTask, error: checkError } = await supabase
        .from('pending_tasks')
        .select('id, organization_id, workspace_id, title')
        .eq('id', taskId)
        .single();

      if (checkError) {
        console.error('❌ Error checking task existence:', checkError);
        throw new Error(`Taak niet gevonden: ${checkError.message}`);
      }

      if (!existingTask) {
        throw new Error('Taak niet gevonden in database');
      }

      console.log('✅ Task found:', existingTask);

      // Verify ownership
      if (existingTask.organization_id !== selectedOrganization?.id) {
        throw new Error('Je hebt geen rechten om deze taak te verwijderen');
      }

      // Perform the delete
      console.log('🗑️ Proceeding with task deletion...');
      
      const { error: deleteError } = await supabase
        .from('pending_tasks')
        .delete()
        .eq('id', taskId)
        .eq('organization_id', selectedOrganization.id); // Extra security check

      if (deleteError) {
        console.error('❌ Delete operation failed:', deleteError);
        throw new Error(`Verwijderen mislukt: ${deleteError.message}`);
      }

      console.log('✅ Task deleted successfully');

      toast({
        title: "Taak verwijderd",
        description: "De AI actie is succesvol geannuleerd",
        variant: "default"
      });

      // Refresh the tasks list
      await fetchTasks();
      
    } catch (error: any) {
      console.error('❌ Complete delete process failed:', error);
      toast({
        title: "Verwijderen mislukt",
        description: error.message || "Onbekende fout opgetreden",
        variant: "destructive"
      });
    } finally {
      setDeletingTaskId(null);
      console.log('🗑️ Delete process completed, clearing loading state');
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

  const filteredCompletedTasks = completedTasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.clients?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.dossiers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Hoog</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-orange-600 text-xs">Gemiddeld</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-green-600 text-xs">Laag</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="text-blue-600 text-xs"><Clock className="h-3 w-3 mr-1" />Open</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="text-orange-600 text-xs">Bezig</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600 text-xs"><CheckCircle className="h-3 w-3 mr-1" />Klaar</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const getTaskTypeBadge = (taskType: string) => {
    if (taskType === 'email_reply') {
      return (
        <Badge variant="outline" className="text-blue-600 text-xs">
          <Mail className="h-3 w-3 mr-1" />
          E-mail
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-purple-600 text-xs">
        <FileText className="h-3 w-3 mr-1" />
        Algemeen
      </Badge>
    );
  };

  const formatEmailDisplay = (fromEmail: string) => {
    // Extract name and email from "Name <email@domain.com>" format
    const emailMatch = fromEmail.match(/^(.+?)\s*<(.+)>$/);
    if (emailMatch) {
      const name = emailMatch[1].trim();
      const email = emailMatch[2].trim();
      return `${name} "${email}"`;
    }
    // If no name found, just return the email with quotes
    return `"${fromEmail}"`;
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

  const renderTaskItem = (task: PendingTask, isCompleted = false) => (
    <div key={task.id} className={`border rounded-lg p-3 hover:shadow-sm transition-all relative ${
      task.task_type === 'email_reply' ? 'bg-blue-50/30' : ''
    } ${isCompleted ? 'opacity-75 bg-gray-50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium text-sm truncate ${isCompleted ? 'line-through text-gray-600' : ''}`}>
              {task.title}
            </h3>
            <div className="flex gap-1 flex-shrink-0">
              {isCompleted ? (
                <>
                  <Badge variant="outline" className="text-green-600 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Voltooid
                  </Badge>
                  {getTaskTypeBadge(task.task_type)}
                </>
              ) : (
                getStatusBadge(task.status)
              )}
              {getPriorityBadge(task.priority)}
            </div>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            {task.emails?.subject && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Onderwerp:</span>
                <span className="truncate">{task.emails.subject}</span>
              </div>
            )}
            {task.emails?.from_email && (
              <div className="flex items-center gap-1">
                <span className="font-medium">Van:</span>
                <span className="truncate">{formatEmailDisplay(task.emails.from_email)}</span>
              </div>
            )}
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>Vervalt: {new Date(task.due_date).toLocaleDateString('nl-NL')}</span>
              </div>
            )}
            {isCompleted && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>Voltooid op: {new Date(task.created_at).toLocaleDateString('nl-NL')}</span>
              </div>
            )}
          </div>
        </div>

        {!isCompleted && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {task.status === 'open' && task.task_type === 'email_reply' && (
              <Button
                size="sm"
                onClick={() => handleManageTask(task)}
                className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1 h-7"
              >
                <Eye className="h-3 w-3 mr-1" />
                Bekijken
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={deletingTaskId === task.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 h-7 w-7"
                >
                  {deletingTaskId === task.id ? (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></div>
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{isCompleted ? 'Voltooide Taak Verwijderen' : 'AI Actie Annuleren'}</AlertDialogTitle>
                  <AlertDialogDescription>
                    Weet je zeker dat je deze {isCompleted ? 'voltooide taak' : 'AI actie'} wilt {isCompleted ? 'verwijderen' : 'annuleren'}? Deze actie kan niet ongedaan worden gemaakt.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuleren</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Verwijderen
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {isOverdue(task.due_date) && !isCompleted && (
        <div className="absolute top-2 right-2">
          <Badge variant="destructive" className="animate-pulse text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Verlopen
          </Badge>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
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
              <Button size="sm">
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

        {/* Open Email Tasks */}
        {emailTasks.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" />
                E-mail Antwoorden ({emailTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {emailTasks.map((task) => renderTaskItem(task))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Open General Tasks */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Algemene Taken ({generalTasks.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-0">
            {loading ? (
              <div className="text-center py-8">Taken laden...</div>
            ) : generalTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen algemene taken gevonden</p>
              </div>
            ) : (
              <div className="space-y-2">
                {generalTasks.map((task) => renderTaskItem(task))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consolidated Completed Tasks */}
        {filteredCompletedTasks.length > 0 && (
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base text-green-700">
                <CheckCircle className="h-4 w-4" />
                Voltooide Taken ({filteredCompletedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {filteredCompletedTasks.map((task) => renderTaskItem(task, true))}
              </div>
            </CardContent>
          </Card>
        )}
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
      console.log('📤 Starting email send process for task:', task.id);
      console.log('📤 Email details:', {
        to: task.reply_to_email,
        subject: subject.substring(0, 50) + '...',
        contentLength: content.length,
        taskId: task.id
      });
      
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

      console.log('📤 Function response:', data);

      if (error) {
        console.error('❌ Function invoke error:', error);
        
        // Check for specific domain verification error
        if (error.message && error.message.includes('domain is not verified')) {
          toast({
            title: "E-mail domein niet geverifieerd",
            description: (
              <div className="space-y-2">
                <p>Het e-mail domein moet eerst worden geverifieerd.</p>
                <p className="text-xs">Ga naar: https://resend.com/domains</p>
                <p className="text-xs">Verifieer het domein met DNS records</p>
              </div>
            ),
            variant: "destructive"
          });
        } else {
          toast({
            title: "E-mail verzenden mislukt",
            description: error.message || "Onbekende fout opgetreden",
            variant: "destructive"
          });
        }
        throw error;
      }

      if (data && !data.success) {
        console.error('❌ Function returned error:', data.error);
        
        // Check for domain verification in response
        if (data.error && data.error.includes('domain is not verified')) {
          toast({
            title: "E-mail domein niet geverifieerd",
            description: (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Domein verificatie vereist</span>
                </div>
                <p className="text-sm">Het e-mail domein moet worden geverifieerd:</p>
                <ol className="text-xs list-decimal list-inside space-y-1 ml-2">
                  <li>Ga naar: https://resend.com/domains</li>
                  <li>Voeg je domein toe en verifieer het</li>
                  <li>Voeg de DNS records toe aan je domein</li>
                  <li>Wacht tot verificatie compleet is</li>
                </ol>
              </div>
            ),
            variant: "destructive"
          });
        } else {
          toast({
            title: "E-mail verzenden mislukt",
            description: data.error || "Onbekende fout opgetreden",
            variant: "destructive"
          });
        }
        throw new Error(data.error);
      }

      console.log('✅ Email sent successfully');

      toast({
        title: "E-mail verzonden",
        description: "Het antwoord is succesvol verzonden"
      });

      onEmailSent();
      onClose();
    } catch (error: any) {
      console.error('❌ Complete email send process failed:', error);
      // Error handling is done above, no need for additional toast here
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
            E-mail Bekijken: {task.title}
            {task.ai_generated && (
              <Badge variant="outline" className="text-blue-600">
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
                <Send className="h-4 w-4" />
                CONCEPT ANTWOORD
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
                      <AlertCircle className="h-4 w-4" />
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
