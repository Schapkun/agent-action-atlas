
import React, { useState } from 'react';
import { HistoryFilters } from './HistoryFilters';
import { HistoryLogsList } from './HistoryLogsList';
import { useHistoryLogs } from './useHistoryLogs';

export const HistoryLogs = () => {
  const { historyLogs, loading, userRole } = useHistoryLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

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
      <HistoryFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterAction={filterAction}
        setFilterAction={setFilterAction}
      />
      <HistoryLogsList logs={filteredLogs} />
    </div>
  );
};
