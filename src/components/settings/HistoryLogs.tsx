
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { History, Calendar, User, Activity } from 'lucide-react';

interface HistoryLog {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user_id: string;
  organization_id?: string;
  workspace_id?: string;
  user_name?: string;
  user_email?: string;
  organization_name?: string;
  workspace_name?: string;
  user_role?: string;
}

export const HistoryLogs = () => {
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchUserRole();
    }
  }, [user]);

  useEffect(() => {
    if (user && userRole) {
      fetchHistoryLogs();
    }
  }, [user, userRole]);

  const fetchUserRole = async () => {
    if (!user?.id) return;

    try {
      // Check if user is account owner
      if (user.email === 'info@schapkun.com') {
        setUserRole('owner');
        return;
      }

      // Get user's role from their organization memberships
      const { data: memberships } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user.id)
        .limit(1);

      if (memberships && memberships.length > 0) {
        setUserRole(memberships[0].role);
      } else {
        setUserRole('member');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('member');
    }
  };

  const fetchHistoryLogs = async () => {
    if (!user?.id || !userRole) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching history logs for user:', user.id, 'with role:', userRole);

      let logsQuery = supabase
        .from('history_logs')
        .select('id, action, details, created_at, user_id, organization_id, workspace_id');

      // Filter based on user role
      if (userRole === 'owner' || user.email === 'info@schapkun.com') {
        // Owner can see all history logs from all users
        logsQuery = logsQuery.order('created_at', { ascending: false });
      } else if (userRole === 'admin') {
        // Admin can see history from all users except the owner
        // First get all user IDs except the owner
        const { data: allUsers } = await supabase
          .from('profiles')
          .select('id, email')
          .neq('email', 'info@schapkun.com');

        if (allUsers && allUsers.length > 0) {
          const userIds = allUsers.map(u => u.id);
          logsQuery = logsQuery.in('user_id', userIds);
        } else {
          // If no users found, just show current user's logs
          logsQuery = logsQuery.eq('user_id', user.id);
        }
        logsQuery = logsQuery.order('created_at', { ascending: false });
      } else {
        // Regular users can only see their own history
        logsQuery = logsQuery.eq('user_id', user.id).order('created_at', { ascending: false });
      }

      const { data: logsData, error: logsError } = await logsQuery;

      if (logsError) {
        console.error('History logs error:', logsError);
        throw logsError;
      }

      console.log('History logs data:', logsData);

      if (!logsData || logsData.length === 0) {
        setHistoryLogs([]);
        setLoading(false);
        return;
      }

      // Get unique user IDs from the logs to fetch their profiles
      const userIds = [...new Set(logsData.map(log => log.user_id).filter(Boolean))];
      let usersData: any[] = [];
      if (userIds.length > 0) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
        if (!error) usersData = data || [];
      }

      // Get organizations for the logs
      const orgIds = [...new Set(logsData.map(log => log.organization_id).filter(Boolean))];
      let orgsData: any[] = [];
      if (orgIds.length > 0) {
        const { data, error } = await supabase
          .from('organizations')
          .select('id, name')
          .in('id', orgIds);
        if (!error) orgsData = data || [];
      }

      // Get workspaces for the logs
      const workspaceIds = [...new Set(logsData.map(log => log.workspace_id).filter(Boolean))];
      let workspacesData: any[] = [];
      if (workspaceIds.length > 0) {
        const { data, error } = await supabase
          .from('workspaces')
          .select('id, name')
          .in('id', workspaceIds);
        if (!error) workspacesData = data || [];
      }

      // Format the logs
      const formattedLogs = logsData.map(log => {
        const userProfile = usersData.find(u => u.id === log.user_id);
        const organization = orgsData.find(o => o.id === log.organization_id);
        const workspace = workspacesData.find(w => w.id === log.workspace_id);

        return {
          id: log.id,
          action: log.action,
          details: log.details,
          created_at: log.created_at,
          user_id: log.user_id,
          organization_id: log.organization_id,
          workspace_id: log.workspace_id,
          user_name: userProfile?.full_name || 'Onbekende gebruiker',
          user_email: userProfile?.email || '',
          organization_name: organization?.name,
          workspace_name: workspace?.name
        };
      });

      setHistoryLogs(formattedLogs);
    } catch (error) {
      console.error('Error fetching history logs:', error);
      toast({
        title: "Error",
        description: "Kon geschiedenis niet ophalen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = historyLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAction === 'all' || log.action.toLowerCase().includes(filterAction);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div>Geschiedenis laden...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Zoek in geschiedenis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterAction} onValueChange={setFilterAction}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter op actie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle acties</SelectItem>
            <SelectItem value="aangemaakt">Aangemaakt</SelectItem>
            <SelectItem value="bijgewerkt">Bijgewerkt</SelectItem>
            <SelectItem value="verwijderd">Verwijderd</SelectItem>
            <SelectItem value="ingelogd">Ingelogd</SelectItem>
            <SelectItem value="uitgelogd">Uitgelogd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* History Logs */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Geen geschiedenis gevonden
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{log.action}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{log.user_name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(log.created_at).toLocaleString('nl-NL')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {log.details && (
                <CardContent>
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-sm">{JSON.stringify(log.details, null, 2)}</pre>
                  </div>
                  {log.organization_name && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Organisatie: {log.organization_name}
                    </p>
                  )}
                  {log.workspace_name && (
                    <p className="text-sm text-muted-foreground">
                      Werkruimte: {log.workspace_name}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
