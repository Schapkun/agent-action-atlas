
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Calendar,
  Mail,
  FileText,
  Trash2,
  Edit
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

export const PendingTasksManager = () => {
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<PendingTask | null>(null);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { toast } = useToast();

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    task_type: 'general',
    due_date: ''
  });

  const fetchTasks = async () => {
    if (!selectedOrganization) {
      console.log('📋 No organization selected, skipping tasks fetch');
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('📋 Fetching pending tasks for organization:', selectedOrganization.id);
      
      let query = supabase
        .from('pending_tasks')
        .select('*')
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

      console.log('📋 Tasks fetched successfully:', data?.length || 0);
      setTasks(data || []);
    } catch (error) {
      console.error('❌ Error in fetchTasks:', error);
      toast({
        title: "Fout",
        description: "Kon taken niet ophalen",
        variant: "destructive"
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!selectedOrganization || !newTask.title.trim()) {
      toast({
        title: "Fout",
        description: "Titel is verplicht",
        variant: "destructive"
      });
      return;
    }

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        task_type: newTask.task_type,
        due_date: newTask.due_date || null,
        organization_id: selectedOrganization.id,
        workspace_id: selectedWorkspace?.id || null,
        status: 'open'
      };

      const { error } = await supabase
        .from('pending_tasks')
        .insert([taskData]);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Taak toegevoegd"
      });

      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        task_type: 'general',
        due_date: ''
      });
      setShowNewTaskForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: "Fout",
        description: "Kon taak niet aanmaken",
        variant: "destructive"
      });
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('pending_tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: `Taak gemarkeerd als ${status === 'completed' ? 'voltooid' : 'open'}`
      });

      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Fout",
        description: "Kon taak status niet bijwerken",
        variant: "destructive"
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('Weet je zeker dat je deze taak wilt verwijderen?')) return;

    try {
      const { error } = await supabase
        .from('pending_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Succes",
        description: "Taak verwijderd"
      });

      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Fout",
        description: "Kon taak niet verwijderen",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedOrganization, selectedWorkspace]);

  // Real-time subscription
  useEffect(() => {
    if (!selectedOrganization) return;

    console.log('📡 Setting up real-time subscription for pending tasks');

    const channel = supabase
      .channel('pending-tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pending_tasks',
          filter: `organization_id=eq.${selectedOrganization.id}`
        },
        (payload) => {
          console.log('📋 Real-time task change:', payload);
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      console.log('📡 Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [selectedOrganization]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="text-orange-600"><Clock className="h-3 w-3 mr-1" />Open</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Voltooid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Hoog</Badge>;
      case 'medium':
        return <Badge variant="secondary">Gemiddeld</Badge>;
      case 'low':
        return <Badge variant="outline">Laag</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Taken laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Openstaande Taken</h1>
          <p className="text-muted-foreground">
            Beheer al je openstaande taken en to-do items
          </p>
        </div>
        
        <Button onClick={() => setShowNewTaskForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nieuwe Taak
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Zoek taken..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle statussen</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="completed">Voltooid</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Prioriteit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle prioriteiten</SelectItem>
            <SelectItem value="high">Hoog</SelectItem>
            <SelectItem value="medium">Gemiddeld</SelectItem>
            <SelectItem value="low">Laag</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* New Task Form */}
      {showNewTaskForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nieuwe Taak Toevoegen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titel *</label>
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Voer een titel in..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Beschrijving</label>
              <Textarea
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Voer een beschrijving in..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Prioriteit</label>
                <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}>
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
                <label className="block text-sm font-medium mb-2">Vervaldatum</label>
                <Input
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createTask}>
                Taak Toevoegen
              </Button>
              <Button variant="outline" onClick={() => setShowNewTaskForm(false)}>
                Annuleren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {tasks.length === 0 
                  ? "Geen taken gevonden. Voeg je eerste taak toe!"
                  : "Geen taken gevonden die voldoen aan de filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{task.title}</h3>
                      {getStatusBadge(task.status)}
                      {getPriorityBadge(task.priority)}
                    </div>
                    
                    {task.description && (
                      <p className="text-muted-foreground mb-3">{task.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Aangemaakt: {new Date(task.created_at).toLocaleDateString('nl-NL')}</span>
                      </div>
                      
                      {task.due_date && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>Vervalt: {new Date(task.due_date).toLocaleDateString('nl-NL')}</span>
                        </div>
                      )}

                      {task.ai_generated && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">AI</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status === 'open' ? (
                      <Button
                        size="sm"
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Voltooid
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateTaskStatus(task.id, 'open')}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Heropen
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
