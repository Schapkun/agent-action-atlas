
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FolderOpen, 
  Folder, 
  FileText, 
  Download, 
  Eye,
  ChevronRight,
  ChevronDown,
  Calendar
} from 'lucide-react';

export const ActiveDossiers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>('1');

  const folderStructure = [
    {
      id: '1',
      name: 'Lopende Rechtszaken',
      icon: 'gavel',
      items: [
        {
          id: 'd1',
          name: 'DOS-2024-001 - ABC Holding vs XYZ Corp',
          type: 'Rechtszaak',
          client: 'ABC Holding B.V.',
          status: 'active',
          deadline: new Date('2024-02-15'),
          priority: 'high'
        },
        {
          id: 'd2',
          name: 'DOS-2024-002 - Arbeidsrecht Jan Janssen',
          type: 'Arbeidsrecht',
          client: 'Jan Janssen',
          status: 'active',
          deadline: new Date('2024-02-20'),
          priority: 'medium'
        }
      ]
    },
    {
      id: '2',
      name: 'Contractonderhandelingen',
      icon: 'handshake',
      items: [
        {
          id: 'd3',
          name: 'DOS-2024-003 - Leveringscontract XYZ',
          type: 'Contractrecht',
          client: 'XYZ Corp',
          status: 'active',
          deadline: new Date('2024-01-30'),
          priority: 'high'
        }
      ]
    },
    {
      id: '3',
      name: 'Incasso Procedures',
      icon: 'euro',
      items: [
        {
          id: 'd4',
          name: 'DOS-2024-004 - Incasso Maria Peters',
          type: 'Incasso',
          client: 'Maria Peters',
          status: 'active',
          deadline: new Date('2024-02-01'),
          priority: 'medium'
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
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedFolderData = folderStructure.find(f => f.id === selectedFolder);
  const itemsToShow = selectedFolderData?.items || [];

  const filteredItems = itemsToShow.filter(item =>
    searchTerm === '' || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Folder Structure */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Dossier Categorieën</CardTitle>
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

      {/* Dossier List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedFolderData?.name || 'Actieve Dossiers'}
            </CardTitle>
            <Button variant="outline" size="sm">
              <FolderOpen className="h-4 w-4 mr-2" />
              Nieuw Dossier
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek dossiers..."
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
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          Actief
                        </Badge>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority === 'high' ? 'Hoog' : item.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground space-x-4">
                      <span>{item.type}</span>
                      <span>•</span>
                      <span className="font-medium">{item.client}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Deadline: {item.deadline.toLocaleDateString('nl-NL')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
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
                  ? 'Geen dossiers gevonden die voldoen aan de zoekcriteria.'
                  : 'Deze categorie heeft nog geen actieve dossiers.'
                : 'Selecteer een categorie om dossiers te bekijken.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
