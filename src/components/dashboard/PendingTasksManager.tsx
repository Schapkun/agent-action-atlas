import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePendingTasksRealtime } from '@/hooks/usePendingTasksRealtime';
import { supabase } from '@/integrations/supabase/client';
import { 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  Mail,
  Phone,
  FileText,
  AlertCircle,
  Archive
} from 'lucide-react';

interface PendingTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  task_type: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  client_id?: string;
  assigned_to?: string;
  created_by?: string;
  ai_generated: boolean;
  // Client info
  client_name?: string;
  client_email?: string;
  // User info
  assigned_user_name?: string;
  created_by_name?: string;
}

export const PendingTasksManager = () => {
  const [openTasks, setOpenTasks] = useState<PendingTask[]>([]);
  const [completedTasks, setCompletedTasks] = useState<PendingTask[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use the real-time hook for automatic updates
  const { pendingTasksCount, refreshCount } = usePendingTasksRealtime();

  const fetchTasks = async () => {
    if (!selectedOrganization) return;

    setLoading(true);
    try {
      console.log('📋 Fetching tasks for organization:', selectedOrganization.id);
      console.log('📋 Selected workspace:', selectedWorkspace?.id);

      // Build base query with simplified joins
      let query = supabase
        .from('pending_tasks')
        .select(`
          *,
          assigned_user:user_profiles!pending_tasks_assigned_to_fkey(full_name),
          created_user:user_profiles!pending_tasks_created_by_fkey(full_name)
        `)
        .eq('organization_id', selectedOrganization.id)
        .order('created_at', { ascending: false });

      // Add workspace filter if selected
      if (selectedWorkspace) {
        query = query.eq('workspace_id', selectedWorkspace.id);
      }

      console.log('📋 Executing main query...');
      const { data: tasks, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching tasks:', error);
        throw error;
      }

      console.log('📋 Raw tasks data:', tasks);

      if (!tasks) {
        console.log('📋 No tasks found');
        setOpenTasks([]);
        setCompletedTasks([]);
        return;
      }

      // Get all clients for this organization to match by email/ID
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email')
        .eq('organization_id', selectedOrganization.id);

      if (clientsError) {
        console.error('❌ Error fetching clients:', clientsError);
      }

      console.log('📋 Clients data:', clients);

      // Transform tasks and match client information
      const transformedTasks = tasks.map((task: any) => {
        let clientInfo = { client_name: null, client_email: null };
        
        if (task.client_id && clients) {
          // Direct client ID match
          const client = clients.find(c => c.id === task.client_id);
          if (client) {
            clientInfo = {
              client_name: client.name,
              client_email: client.email
            };
          }
        }
        
        // If no direct match but we have an email in the task, try email matching
        // This is common for AI-generated tasks
        if (!clientInfo.client_name && clients && task.description) {
          // Try to extract email from task description or title
          const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
          const emails = (task.title + ' ' + (task.description || '')).match(emailRegex);
          
          if (emails && emails.length > 0) {
            const matchedClient = clients.find(c => 
              emails.some(email => c.email && c.email.toLowerCase() === email.toLowerCase())
            );
            
            if (matchedClient) {
              clientInfo = {
                client_name: matchedClient.name,
                client_email: matchedClient.email
              };
            } else {
              // Use the extracted email even if no client match
              clientInfo.client_email = emails[0];
            }
          }
        }

        return {
          ...task,
          ...clientInfo,
          assigned_user_name: task.assigned_user?.full_name || null,
          created_by_name: task.created_user?.full_name || null
        };
      });

      const openTasksFiltered = transformedTasks.filter((task: any) => task.status === 'open');
      const completedTasksFiltered = transformedTasks.filter((task: any) => task.status === 'completed');

      console.log('📋 Open tasks:', openTasksFiltered.length);
      console.log('📋 Completed tasks:', completedTasksFiltered.length);

      setOpenTasks(openTasksFiltered);
      setCompletedTasks(completedTasksFiltered);

    } catch (error) {
      console.error('❌ Error fetching tasks:', error);
      toast({
        title: "Fout",
        description: "Kon taken niet ophalen",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markTaskCompleted = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('pending_tasks')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Taak voltooid",
        description: "De taak is gemarkeerd als voltooid"
      });

      // Refresh tasks after update
      await fetchTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Fout",
        description: "Kon taak niet voltooien",
        variant: "destructive"
      });
    }
  };

  const reopenTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('pending_tasks')
        .update({ 
          status: 'open',
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      toast({
        title: "Taak heropend",
        description: "De taak is weer opengesteld"
      });

      // Refresh tasks after update
      await fetchTasks();
    } catch (error) {
      console.error('Error reopening task:', error);
      toast({
        title: "Fout",
        description: "Kon taak niet heropenen",
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
        title: "Taak verwijderd",
        description: "De taak is succesvol verwijderd"
      });

      // Refresh tasks after deletion
      await fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Fout",
        description: "Kon taak niet verwijderen",
        variant: "destructive"
      });
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">Hoog</Badge>;
      case 'medium':
        return <Badge variant="default">Gemiddeld</Badge>;
      case 'low':
        return <Badge variant="secondary">Laag</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone_call':
        return <Phone className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedOrganization, selectedWorkspace]);

  // Refresh tasks when real-time count changes
  useEffect(() => {
    if (pendingTasksCount !== undefined) {
      fetchTasks();
    }
  }, [pendingTasksCount]);

  const TaskCard = ({ task, isCompleted = false }: { task: PendingTask; isCompleted?: boolean }) => (
    <Card key={task.id} className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {getTaskTypeIcon(task.task_type)}
            <div className="flex-1">
              <CardTitle className="text-lg">{task.title}</CardTitle>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getPriorityBadge(task.priority)}
            {task.ai_generated && (
              <Badge variant="outline" className="text-purple-600">
                AI Gegenereerd
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {task.client_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Cliënt:</strong> {task.client_name}
              </span>
            </div>
          )}
          
          {task.client_email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>E-mail:</strong> {task.client_email}
              </span>
            </div>
          )}
          
          {task.assigned_user_name && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Toegewezen aan:</strong> {task.assigned_user_name}
              </span>
            </div>
          )}
          
          {task.due_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Deadline:</strong> {new Date(task.due_date).toLocaleDateString('nl-NL')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>
            Aangemaakt: {new Date(task.created_at).toLocaleDateString('nl-NL')} om {new Date(task.created_at).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {task.created_by_name && (
            <span>Door: {task.created_by_name}</span>
          )}
        </div>

        <div className="flex gap-2">
          {isCompleted ? (
            <>
              <Button size="sm" onClick={() => reopenTask(task.id)}>
                <Clock className="h-4 w-4 mr-2" />
                Heropen
              </Button>
              <Button size="sm" variant="outline" onClick={() => deleteTask(task.id)}>
                <Archive className="h-4 w-4 mr-2" />
                Verwijderen
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => markTaskCompleted(task.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Markeer als Voltooid
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="open" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Openstaande Taken ({openTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Voltooide Taken ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Openstaande taken laden...</div>
          ) : openTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Geen openstaande taken gevonden</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {openTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Voltooide taken laden...</div>
          ) : completedTasks.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">Geen voltooide taken gevonden</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} isCompleted />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
