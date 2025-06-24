import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmailDraftDialog } from './EmailDraftDialog';
import { WorkspaceSelector } from './WorkspaceSelector';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { usePendingTasksRealtime } from '@/hooks/usePendingTasksRealtime';
import { 
  Search, 
  Clock, 
  CheckCircle, 
  Mail, 
  UserCheck, 
  Calendar, 
  Plus,
  RefreshCw,
  AlertCircle,
  Filter,
  X
} from 'lucide-react';

interface PendingTask {
  id: string;
  title: string;
  description?: string;
  status: 'open' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  task_type: string;
  due_date?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  created_by?: string;
  created_by_name?: string;
  client_id?: string;
  client_name?: string;
  dossier_id?: string;
  dossier_name?: string;
  email_id?: string;
  email_thread_id?: string;
  reply_to_email?: string;
  ai_draft_subject?: string;
  ai_draft_content?: string;
  ai_generated?: boolean;
  organization_id: string;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
}

export const PendingTasksManager = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<PendingTask | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    task_type: 'general',
    due_date: ''
  });

  const { selectedOrganization, selectedWorkspace, getFilteredWorkspaces } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  const { pendingTasksCount } = usePendingTasksRealtime();

  const fetchTasks = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📋 Fetching pending tasks for organization:', selectedOrganization.id);

      let query = supabase
        .from('pending_tasks')
        .select(`
          *,
          assigned_to_profile:user_profiles!fk_pending_tasks_assigned_to(full_name),
          created_by_profile:user_profiles!fk_pending_tasks_created_by(full_name),
          client:clients(name),
          dossier:dossiers(name)
        `)
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching tasks:', error);
        throw error;
      }

      console.log('📋 Tasks fetched:', data?.length || 0);
      
      const transformedTasks: PendingTask[] = (data || []).map(task => ({
        ...task,
        status: task.status as 'open' | 'completed' | 'cancelled',
        priority: task.priority as 'low' | 'medium' | 'high',
        assigned_to_name: task.assigned_to_profile?.full_name || null,
        created_by_name: task.created_by_profile?.full_name || null,
        client_name: task.client?.name || null,
        dossier_name: task.dossier?.name || null
      }));

      setTasks(transformedTasks);
    } catch (error: any) {
      console.error('❌ Error fetching tasks:', error);
      toast({
        title: "Fout",
        description: "Kon taken niet ophalen. Probeer opnieuw.",
        variant: "destructive",
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = async () => {
    if (!selectedOrganization) return;

    setRefreshing(true);
    try {
      await fetchTasks();
      toast({
        title: "Taken bijgewerkt",
        description: "De takenlijst is vernieuwd"
      });
    } catch (error) {
      console.error('Error refreshing tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedOrganization) {
      fetchTasks();
    }
  }, [selectedOrganization, selectedWorkspace]);

  // Real-time subscription voor taken updates - using unique channel name with organization ID
  useEffect(() => {
    if (!selectedOrganization) return;

    const channelName = `pending-tasks-manager-${selectedOrganization.id}-v2`;
    console.log('📡 Setting up real-time task manager subscription:', channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_tasks',
          filter: `organization_id=eq.${selectedOrganization.id}`
        },
        (payload) => {
          console.log('📋 Task manager update via real-time:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTask: PendingTask = { 
              ...payload.new,
              status: payload.new.status as 'open' | 'completed' | 'cancelled',
              priority: payload.new.priority as 'low' | 'medium' | 'high'
            } as PendingTask;
            setTasks(prevTasks => [newTask, ...prevTasks]);
            
            if (selectedWorkspace && newTask.workspace_id === selectedWorkspace.id) {
              toast({
                title: "Nieuwe taak",
                description: `Taak "${newTask.title}" is toegevoegd`,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask: PendingTask = { 
              ...payload.new,
              status: payload.new.status as 'open' | 'completed' | 'cancelled',
              priority: payload.new.priority as 'low' | 'medium' | 'high'
            } as PendingTask;
            setTasks(prevTasks => 
              prevTasks.map(task => 
                task.id === updatedTask.id ? updatedTask : task
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedTask = payload.old as PendingTask;
            setTasks(prevTasks => 
              prevTasks.filter(task => task.id !== deletedTask.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Cleaning up task manager real-time subscription:', channelName);
      supabase.removeChannel(channel);
    };
  }, [selectedOrganization, selectedWorkspace, toast]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.client_name && task.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const completeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('pending_tasks')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const }
          : task
      ));

      toast({
        title: "Taak voltooid",
        description: "De taak is gemarkeerd als voltooid"
      });
    } catch (error: any) {
      console.error('Error completing task:', error);
      toast({
        title: "Fout",
        description: "Kon taak niet voltooien",
        variant: "destructive"
      });
    }
  };

  const handleEmailReply = (task: PendingTask) => {
    setSelectedTask(task);
    setShowEmailDialog(true);
  };

  const createTask = async () => {
    if (!selectedOrganization || !newTask.title.trim()) {
      toast({
        title: "Fout",
        description: "Vul een titel in voor de taak",
        variant: "destructive"
      });
      return;
    }

    if (!selectedWorkspace) {
      const workspaces = getFilteredWorkspaces();
      if (workspaces.length > 1) {
        setShowWorkspaceSelector(true);
        return;
      }
    }

    await createTaskInWorkspace(selectedWorkspace?.id);
  };

  const createTaskInWorkspace = async (workspaceId?: string) => {
    try {
      const { data, error } = await supabase
        .from('pending_tasks')
        .insert({
          title: newTask.title,
          description: newTask.description || null,
          priority: newTask.priority,
          task_type: newTask.task_type,
          due_date: newTask.due_date || null,
          status: 'open',
          organization_id: selectedOrganization!.id,
          workspace_id: workspaceId,
          created_by: user?.id,
          assigned_to: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        task_type: 'general',
        due_date: ''
      });
      setShowNewTaskForm(false);
      setShowWorkspaceSelector(false);

      toast({
        title: "Taak aangemaakt",
        description: "De nieuwe taak is succesvol aangemaakt"
      });
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast({
        title: "Fout",
        description: "Kon taak niet aanmaken",
        variant: "destructive"
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Openstaande Taken</h1>
              <p className="text-muted-foreground">
                Beheer en volg openstaande taken en acties
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={refreshTasks}
                disabled={refreshing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Vernieuwen...' : 'Vernieuwen'}
              </Button>
              
              <Button onClick={() => setShowNewTaskForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Taak
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Zoek taken..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter op status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="completed">Voltooid</SelectItem>
                <SelectItem value="cancelled">Geannuleerd</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter op prioriteit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle prioriteiten</SelectItem>
                <SelectItem value="high">Hoog</SelectItem>
                <SelectItem value="medium">Gemiddeld</SelectItem>
                <SelectItem value="low">Laag</SelectItem>
              </SelectContent>
            </Select>

            {(selectedOrganization || selectedWorkspace) && (
              <div className="text-sm text-gray-600">
                Context: {getContextInfo()}
              </div>
            )}
          </div>

          {pendingTasksCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800 font-medium">
                {pendingTasksCount} openstaande {pendingTasksCount === 1 ? 'taak' : 'taken'}
              </span>
            </div>
          )}
        </div>

        {/* Nieuwe taak formulier */}
        {showNewTaskForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Nieuwe Taak Aanmaken</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowNewTaskForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titel *</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Voer een titel in voor de taak"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Beschrijving</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optionele beschrijving van de taak"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Prioriteit</label>
                  <Select 
                    value={newTask.priority} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewTask(prev => ({ ...prev, priority: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Laag</SelectItem>
                      <SelectItem value="medium">Gemiddeld</SelectItem>
                      <SelectItem value="high">Hoog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select 
                    value={newTask.task_type} 
                    onValueChange={(value) => setNewTask(prev => ({ ...prev, task_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">Algemeen</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="meeting">Vergadering</SelectItem>
                      <SelectItem value="follow-up">Opvolging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Deadline</label>
                  <Input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button onClick={createTask}>
                  <Plus className="h-4 w-4 mr-2" />
                  Taak Aanmaken
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewTaskForm(false)}
                >
                  Annuleren
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Taken lijst */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Taken ({filteredTasks.length})
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">Taken laden...</div>
            ) : !selectedOrganization && !selectedWorkspace ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecteer een organisatie of werkruimte om taken te bekijken</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen taken gevonden</p>
                {!showNewTaskForm && (
                  <Button 
                    className="mt-4" 
                    onClick={() => setShowNewTaskForm(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Eerste Taak Aanmaken
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 border rounded-lg ${
                      task.status === 'completed' ? 'bg-gray-50 opacity-75' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-medium ${
                            task.status === 'completed' ? 'line-through text-gray-500' : ''
                          }`}>
                            {task.title}
                          </h3>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority === 'high' ? 'Hoog' : 
                             task.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                          </Badge>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status === 'open' ? 'Open' : 
                             task.status === 'completed' ? 'Voltooid' : 'Geannuleerd'}
                          </Badge>
                          {task.ai_generated && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700">
                              AI
                            </Badge>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Aangemaakt: {formatDate(task.created_at)}</span>
                          {task.due_date && (
                            <span>Deadline: {formatDate(task.due_date)}</span>
                          )}
                          {task.assigned_to_name && (
                            <span>Toegewezen aan: {task.assigned_to_name}</span>
                          )}
                          {task.client_name && (
                            <span>Cliënt: {task.client_name}</span>
                          )}
                          {task.dossier_name && (
                            <span>Dossier: {task.dossier_name}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {task.email_id && task.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEmailReply(task)}
                          >
                            <Mail className="h-4 w-4 mr-1" />
                            Beantwoorden
                          </Button>
                        )}
                        
                        {task.status === 'open' && (
                          <Button
                            size="sm"
                            onClick={() => completeTask(task.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Voltooien
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WorkspaceSelector
        isOpen={showWorkspaceSelector}
        onClose={() => setShowWorkspaceSelector(false)}
        onSelectWorkspace={createTaskInWorkspace}
        title="Selecteer werkruimte voor nieuwe taak"
        description="Kies in welke werkruimte de taak moet worden aangemaakt:"
      />

      <EmailDraftDialog
        task={selectedTask}
        isOpen={showEmailDialog}
        onClose={() => {
          setShowEmailDialog(false);
          setSelectedTask(null);
        }}
        onEmailSent={() => {
          setShowEmailDialog(false);
          setSelectedTask(null);
          refreshTasks();
        }}
        mode="reply"
      />
    </>
  );
};
