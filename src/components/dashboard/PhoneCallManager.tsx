
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  PhoneCall, 
  Folder, 
  Play, 
  Download, 
  FileText,
  ChevronRight,
  ChevronDown,
  Clock
} from 'lucide-react';

export const PhoneCallManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>('1');

  const folderStructure = [
    {
      id: '1',
      name: 'Cliëntgesprekken',
      icon: 'phone',
      items: [
        {
          id: 'c1',
          name: 'Intake gesprek ABC Holding',
          client: 'ABC Holding B.V.',
          duration: '00:45:30',
          callDate: new Date('2024-01-15'),
          status: 'transcribed',
          type: 'inbound',
          dossier: 'DOS-2024-001'
        },
        {
          id: 'c2',
          name: 'Status update Jan Janssen',
          client: 'Jan Janssen',
          duration: '00:22:15',
          callDate: new Date('2024-01-14'),
          status: 'transcribed',
          type: 'outbound',
          dossier: 'DOS-2024-002'
        }
      ]
    },
    {
      id: '2',
      name: 'Rechtbank Gesprekken',
      icon: 'gavel',
      items: [
        {
          id: 'c3',
          name: 'Overleg met Griffie',
          client: 'Rechtbank Amsterdam',
          duration: '00:18:45',
          callDate: new Date('2024-01-12'),
          status: 'transcribed',
          type: 'outbound',
          dossier: 'DOS-2024-001'
        }
      ]
    },
    {
      id: '3',
      name: 'Externe Partijen',
      icon: 'users',
      items: [
        {
          id: 'c4',
          name: 'Gesprek met tegenpartij',
          client: 'Advocaat XYZ',
          duration: '00:35:20',
          callDate: new Date('2024-01-10'),
          status: 'processing',
          type: 'inbound',
          dossier: 'DOS-2024-003'
        }
      ]
    }
  ];

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'transcribed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'recorded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'transcribed':
        return 'Getranscribeerd';
      case 'processing':
        return 'Verwerken';
      case 'recorded':
        return 'Opgenomen';
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
  };

  const getTypeLabel = (type: string) => {
    return type === 'inbound' ? 'Inkomend' : 'Uitgaand';
  };

  const selectedFolderData = folderStructure.find(f => f.id === selectedFolder);
  const itemsToShow = selectedFolderData?.items || [];

  const filteredItems = itemsToShow.filter(item =>
    searchTerm === '' || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.dossier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Folder Structure */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Gesprek Categorieën</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {folderStructure.map((folder) => (
              <div key={folder.id}>
                <Button
                  variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    if (!expandedFolders.has(folder.id)) {
                      toggleFolder(folder.id);
                    }
                  }}
                >
                  <div className="flex items-center space-x-2 w-full">
                    {expandedFolders.has(folder.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <Folder className="h-4 w-4" />
                    <span className="text-sm truncate">{folder.name}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {folder.items?.length || 0}
                    </Badge>
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedFolderData?.name || 'Telefoongesprekken'}
            </CardTitle>
            <Button variant="outline" size="sm">
              <PhoneCall className="h-4 w-4 mr-2" />
              Nieuw Gesprek
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek gesprekken..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-shrink-0">
                    <PhoneCall className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(item.type)}>
                          {getTypeLabel(item.type)}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground space-x-4">
                      <span className="font-medium">{item.client}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.duration}</span>
                      </div>
                      <span>•</span>
                      <span>{item.callDate.toLocaleDateString('nl-NL')}</span>
                      {item.dossier && (
                        <>
                          <span>•</span>
                          <span>{item.dossier}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedFolderData 
                ? filteredItems.length === 0 && searchTerm 
                  ? 'Geen gesprekken gevonden die voldoen aan de zoekcriteria.'
                  : 'Deze categorie heeft nog geen gesprekken.'
                : 'Selecteer een categorie om gesprekken te bekijken.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
