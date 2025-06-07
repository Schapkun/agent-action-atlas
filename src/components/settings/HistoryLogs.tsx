
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, User, FileText, UserPlus, Clock } from 'lucide-react';

interface HistoryLog {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
  type: 'user' | 'document' | 'invitation' | 'system';
}

export const HistoryLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Mock history data
  const historyLogs: HistoryLog[] = [
    {
      id: '1',
      action: 'Profiel bijgewerkt',
      user: 'Michael Schapkun',
      timestamp: new Date('2025-06-07T08:28:31'),
      details: '{"email": "info@schapkun.com", "full_name": "Michael Schapkun", "target_user_id": "c88a6a2b-67d1-43b2-875a-76cef048ad5e"}',
      type: 'user'
    },
    {
      id: '2',
      action: 'Uitnodiging geannuleerd',
      user: 'Michael Schapkun',
      timestamp: new Date('2025-06-06T20:09:15'),
      details: 'Uitnodiging naar test@example.com geannuleerd',
      type: 'invitation'
    },
    {
      id: '3',
      action: 'Document template aangepast',
      user: 'App Nomadisto',
      timestamp: new Date('2025-06-06T15:22:10'),
      details: 'Dagvaarding template bijgewerkt',
      type: 'document'
    },
    {
      id: '4',
      action: 'Nieuwe werkruimte aangemaakt',
      user: 'Michael Schapkun',
      timestamp: new Date('2025-06-06T12:45:30'),
      details: 'Werkruimte "Strafrecht 123" aangemaakt',
      type: 'system'
    },
    {
      id: '5',
      action: 'Gebruiker uitgenodigd',
      user: 'Michael Schapkun',
      timestamp: new Date('2025-06-06T10:15:20'),
      details: 'Uitnodiging verzonden naar app3@nomadisto.com',
      type: 'invitation'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'invitation':
        return <UserPlus className="h-4 w-4" />;
      case 'system':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'document':
        return 'bg-green-100 text-green-800';
      case 'invitation':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = historyLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Zoek in geschiedenis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle acties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle acties</SelectItem>
            <SelectItem value="user">Gebruiker acties</SelectItem>
            <SelectItem value="document">Document acties</SelectItem>
            <SelectItem value="invitation">Uitnodigingen</SelectItem>
            <SelectItem value="system">Systeem acties</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getTypeIcon(log.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.action}</span>
                      <Badge variant="outline" className={getTypeColor(log.type)}>
                        {log.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Door: {log.user}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {log.details}
                    </p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {log.timestamp.toLocaleString('nl-NL')}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Geen geschiedenis gevonden.</p>
        </div>
      )}
    </div>
  );
};
