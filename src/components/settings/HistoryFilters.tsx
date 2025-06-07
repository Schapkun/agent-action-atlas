
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HistoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterAction: string;
  setFilterAction: (action: string) => void;
}

export const HistoryFilters = ({
  searchTerm,
  setSearchTerm,
  filterAction,
  setFilterAction
}: HistoryFiltersProps) => {
  return (
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
  );
};
