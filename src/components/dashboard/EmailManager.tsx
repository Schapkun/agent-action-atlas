
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Mail, 
  Folder, 
  Eye, 
  Download, 
  Reply,
  ChevronRight,
  ChevronDown,
  Paperclip
} from 'lucide-react';

export const EmailManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>('1');

  const folderStructure = [
    {
      id: '1',
      name: 'Inkomende E-mails',
      icon: 'inbox',
      items: [
        {
          id: 'e1',
          name: 'Vraag over dossier ABC-001',
          from: 'info@abcholding.nl',
          subject: 'Vraag over dossier ABC-001',
          date: new Date('2024-01-15'),
          status: 'unread',
          hasAttachments: true,
          dossier: 'DOS-2024-001',
          priority: 'high'
        },
        {
          id: 'e2',
          name: 'Status update arbeidsrecht zaak',
          from: 'jan.janssen@email.com',
          subject: 'Status update arbeidsrecht zaak',
          date: new Date('2024-01-14'),
          status: 'read',
          hasAttachments: false,
          dossier: 'DOS-2024-002',
          priority: 'medium'
        }
      ]
    },
    {
      id: '2',
      name: 'Verzonden E-mails',
      icon: 'send',
      items: [
        {
          id: 'e3',
          name: 'Juridisch advies contractrecht',
          to: 'contact@xyzcorp.nl',
          subject: 'Juridisch advies contractrecht',
          date: new Date('2024-01-12'),
          status: 'sent',
          hasAttachments: true,
          dossier: 'DOS-2024-003',
          priority: 'medium'
        }
      ]
    },
    {
      id: '3',
      name: 'Concepten',
      icon: 'draft',
      items: [
        {
          id: 'e4',
          name: 'Antwoord op incasso vraag',
          to: 'maria.peters@email.com',
          subject: 'Antwoord op incasso vraag',
          date: new Date('2024-01-10'),
          status: 'draft',
          hasAttachments: false,
          dossier: 'DOS-2024-004',
          priority: 'low'
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
      case 'unread':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-purple-100 text-purple-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'unread':
        return 'Ongelezen';
      case 'read':
        return 'Gelezen';
      case 'sent':
        return 'Verzonden';
      case 'draft':
        return 'Concept';
      default:
        return status;
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
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.from && item.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.to && item.to.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.dossier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Folder Structure */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">E-mail Categorieën</CardTitle>
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

      {/* Email List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedFolderData?.name || 'E-mails'}
            </CardTitle>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Nieuwe E-mail
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek e-mails..."
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
                    <Mail className="h-8 w-8 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground truncate">
                        {item.subject}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority === 'high' ? 'Hoog' : item.priority === 'medium' ? 'Gemiddeld' : 'Laag'}
                        </Badge>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                        {item.hasAttachments && <Paperclip className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground space-x-4">
                      <span className="font-medium">
                        {item.from ? `Van: ${item.from}` : `Naar: ${item.to}`}
                      </span>
                      <span>•</span>
                      <span>{item.date.toLocaleDateString('nl-NL')}</span>
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
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Reply className="h-4 w-4" />
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
                  ? 'Geen e-mails gevonden die voldoen aan de zoekcriteria.'
                  : 'Deze categorie heeft nog geen e-mails.'
                : 'Selecteer een categorie om e-mails te bekijken.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
