
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
  user_profiles?: {
    full_name: string;
    email: string;
  };
  organizations?: {
    name: string;
  };
  workspaces?: {
    name: string;
  };
}

export const HistoryLogs = () => {
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUserRole();
  }, []);

  useEffect(() => {
    if (currentUserRole) {
      fetchHistoryLogs();
    }
  }, [currentUserRole]);

  const fetchCurrentUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', user?.id)
        .limit(1)
        .single();

      if (error) throw error;
      setCurrentUserRole(data?.role || 'member');
    } catch (error) {
      console.error('Error fetching current user role:', error);
      setCurrentUserRole('member');
    }
  };

  const fetchHistoryLogs = async () => {
    try {
      let query = supabase
        .from('history_logs')
        .select(`
          *,
          user_profiles(full_name, email),
          organizations(name),
          workspaces(name)
        `)
        .order('created_at', { ascending: false });

      // If user is member, only show their own logs
      if (currentUserRole === 'member') {
        query = query.eq('user_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHistoryLogs(data || []);
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
      log.user_profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAction === 'all' || log.action.toLowerCase().includes(filterAction);
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div>Geschiedenis laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <History className="h-6 w-6" />
          Geschiedenis
        </h2>
      </div>

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
                          <span>{log.user_profiles?.full_name || 'Onbekende gebruiker'}</span>
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
                  {log.organizations && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Organisatie: {log.organizations.name}
                    </p>
                  )}
                  {log.workspaces && (
                    <p className="text-sm text-muted-foreground">
                      Werkruimte: {log.workspaces.name}
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
