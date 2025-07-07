
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

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
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Zoek in geschiedenis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select value={filterAction} onValueChange={setFilterAction}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Filter op actie" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle acties</SelectItem>
          
          {/* Gebruiker acties */}
          <SelectItem value="ingelogd">Ingelogd</SelectItem>
          <SelectItem value="uitgelogd">Uitgelogd</SelectItem>
          <SelectItem value="gebruiker uitgenodigd">Gebruiker uitgenodigd</SelectItem>
          <SelectItem value="gebruiker bijgewerkt">Gebruiker bijgewerkt</SelectItem>
          <SelectItem value="gebruiker verwijderd">Gebruiker verwijderd</SelectItem>
          
          {/* Uitnodiging acties */}
          <SelectItem value="uitnodiging">Uitnodiging</SelectItem>
          <SelectItem value="uitnodiging geannuleerd">Uitnodiging geannuleerd</SelectItem>
          <SelectItem value="uitnodiging verwijderd">Uitnodiging verwijderd</SelectItem>
          <SelectItem value="uitnodiging geaccepteerd">Uitnodiging geaccepteerd</SelectItem>
          <SelectItem value="uitnodiging verlopen">Uitnodiging verlopen</SelectItem>
          
          {/* Organisatie acties */}
          <SelectItem value="organisatie">Organisatie</SelectItem>
          <SelectItem value="organisatie aangemaakt">Organisatie aangemaakt</SelectItem>
          <SelectItem value="organisatie bijgewerkt">Organisatie bijgewerkt</SelectItem>
          <SelectItem value="organisatie verwijderd">Organisatie verwijderd</SelectItem>
          
          {/* Werkruimte acties */}
          <SelectItem value="werkruimte">Werkruimte</SelectItem>
          <SelectItem value="werkruimte aangemaakt">Werkruimte aangemaakt</SelectItem>
          <SelectItem value="werkruimte bijgewerkt">Werkruimte bijgewerkt</SelectItem>
          <SelectItem value="werkruimte verwijderd">Werkruimte verwijderd</SelectItem>
          
          {/* Document acties */}
          <SelectItem value="document">Document</SelectItem>
          <SelectItem value="document aangemaakt">Document aangemaakt</SelectItem>
          <SelectItem value="document bijgewerkt">Document bijgewerkt</SelectItem>
          <SelectItem value="document verwijderd">Document verwijderd</SelectItem>
          <SelectItem value="document geüpload">Document geüpload</SelectItem>
          <SelectItem value="document gedownload">Document gedownload</SelectItem>
          
          {/* Profiel acties */}
          <SelectItem value="profiel">Profiel</SelectItem>
          <SelectItem value="profiel bijgewerkt">Profiel bijgewerkt</SelectItem>
          
          {/* Rol acties */}
          <SelectItem value="rol">Rol</SelectItem>
          <SelectItem value="rol toegewezen">Rol toegewezen</SelectItem>
          <SelectItem value="rol gewijzigd">Rol gewijzigd</SelectItem>
          <SelectItem value="rol verwijderd">Rol verwijderd</SelectItem>
          
          {/* Systeem acties */}
          <SelectItem value="aangemaakt">Aangemaakt</SelectItem>
          <SelectItem value="bijgewerkt">Bijgewerkt</SelectItem>
          <SelectItem value="verwijderd">Verwijderd</SelectItem>
          
          {/* Andere acties */}
          <SelectItem value="login">Login</SelectItem>
          <SelectItem value="logout">Logout</SelectItem>
          <SelectItem value="toegang">Toegang</SelectItem>
          <SelectItem value="export">Export</SelectItem>
          <SelectItem value="import">Import</SelectItem>
          <SelectItem value="backup">Backup</SelectItem>
          <SelectItem value="restore">Restore</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
