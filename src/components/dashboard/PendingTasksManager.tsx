import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmailDraftDialog } from './EmailDraftDialog';
import { EmailViewDialog } from './EmailViewDialog';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Clock, 
  Plus, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  Mail,
  Sparkles,
  Send
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
    attachments: any[];
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
  const [selectedEmail, setSelectedEmail] = useState<any>(null);
  const [showEmailViewDialog, setShowEmailViewDialog] = useState(false);
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
      setTasks(data || []);
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

  const handleEmailTask = (task: PendingTask) => {
    console.log('📧 Opening email draft for task:', task.id, 'with AI content:', !!task.ai_draft_content);
    setSelectedEmailTask(task);
    setShowEmailDialog(true);
  };

  const handleViewEmail = (task: PendingTask) => {
    console.log('👁️ Viewing email for task:', task.id, 'email data:', !!task.emails);
    if (task.emails) {
      setSelectedEmail(task.emails);
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
    fetchTasks(); // Refresh tasks after email is sent
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

        {/* E-mail Taken */}
        {emailTasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5" />
                E-mail Antwoorden ({emailTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {emailTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-blue-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                          {getTaskTypeBadge(task.task_type, task.ai_generated)}
                          {isOverdue(task.due_date) && (
                            <Badge variant="destructive" className="animate-pulse">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Verlopen
                            </Badge>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}

                        {task.reply_to_email && (
                          <p className="text-sm text-blue-700 mb-2">
                            <strong>Antwoord naar:</strong> {task.reply_to_email}
                          </p>
                        )}

                        {/* Email info */}
                        {task.emails && (
                          <div className="text-sm text-gray-600 mb-2">
                            <strong>Van:</strong> {task.emails.from_email} | 
                            <strong> Onderwerp:</strong> {task.emails.subject}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {task.clients?.name && (
                            <span>Klant: {task.clients.name}</span>
                          )}
                          {task.dossiers?.name && (
                            <span>Dossier: {task.dossiers.name}</span>
                          )}
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vervalt: {new Date(task.due_date).toLocaleDateString('nl-NL')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.emails && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewEmail(task)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Bekijk
                          </Button>
                        )}
                        
                        {task.status === 'open' && task.task_type === 'email_reply' && (
                          <Button
                            size="sm"
                            onClick={() => handleEmailTask(task)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Verstuur
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Algemene Taken */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Algemene Taken ({generalTasks.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Taken laden...</div>
            ) : generalTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen algemene taken gevonden</p>
              </div>
            ) : (
              <div className="space-y-4">
                {generalTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{task.title}</h3>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                          {isOverdue(task.due_date) && (
                            <Badge variant="destructive" className="animate-pulse">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Verlopen
                            </Badge>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {task.clients?.name && (
                            <span>Klant: {task.clients.name}</span>
                          )}
                          {task.dossiers?.name && (
                            <span>Dossier: {task.dossiers.name}</span>
                          )}
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Vervalt: {new Date(task.due_date).toLocaleDateString('nl-NL')}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {task.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          >
                            Start Taak
                          </Button>
                        )}
                        
                        {task.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Voltooien
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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
        onEmailSent={handleEmailSent}
      />

      <EmailViewDialog
        email={selectedEmail}
        isOpen={showEmailViewDialog}
        onClose={() => {
          setShowEmailViewDialog(false);
          setSelectedEmail(null);
        }}
      />
    </>
  );
};
