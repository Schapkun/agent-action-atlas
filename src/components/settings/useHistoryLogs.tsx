
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from './hooks/useUserRole';
import { fetchHistoryLogsData } from './utils/historyDataFetcher';
import { HistoryLog } from './types/HistoryLog';

export const useHistoryLogs = () => {
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { userRole } = useUserRole();
  const { toast } = useToast();

  useEffect(() => {
    if (user && userRole) {
      fetchHistoryLogs();
    }
  }, [user, userRole]);

  const fetchHistoryLogs = async () => {
    if (!user?.id || !userRole) {
      setLoading(false);
      return;
    }

    try {
      const formattedLogs = await fetchHistoryLogsData(user.id, userRole);
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

  return {
    historyLogs,
    loading,
    userRole
  };
};
