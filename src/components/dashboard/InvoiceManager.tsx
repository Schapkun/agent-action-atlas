
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Folder, 
  FileText, 
  Download, 
  Eye,
  ChevronRight,
  ChevronDown,
  Euro
} from 'lucide-react';

export const InvoiceManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>('1');

  const folderStructure = [
    {
      id: '1',
      name: 'Verzonden Facturen',
      icon: 'send',
      items: [
        {
          id: 'f1',
          name: 'FACT-2024-001 - Juridische Bijstand ABC',
          amount: 2850.00,
          client: 'ABC Holding B.V.',
          status: 'sent',
          dueDate: new Date('2024-02-15'),
          invoiceDate: new Date('2024-01-15')
        },
        {
          id: 'f2',
          name: 'FACT-2024-002 - Arbeidsrecht Advies',
          amount: 1200.50,
          client: 'Jan Janssen',
          status: 'paid',
          dueDate: new Date('2024-02-10'),
          invoiceDate: new Date('2024-01-10')
        }
      ]
    },
    {
      id: '2',
      name: 'Concept Facturen',
      icon: 'draft',
      items: [
        {
          id: 'f3',
          name: 'FACT-2024-003 - Contractonderzoek XYZ',
          amount: 750.00,
          client: 'XYZ Corp',
          status: 'draft',
          dueDate: new Date('2024-02-20'),
          invoiceDate: new Date('2024-01-20')
        }
      ]
    },
    {
      id: '3',
      name: 'Overdue Facturen',
      icon: 'alert',
      items: [
        {
          id: 'f4',
          name: 'FACT-2023-045 - Incasso Procedure',
          amount: 1850.75,
          client: 'Maria Peters',
          status: 'overdue',
          dueDate: new Date('2023-12-15'),
          invoiceDate: new Date('2023-11-15')
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
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Betaald';
      case 'sent':
        return 'Verzonden';
      case 'draft':
        return 'Concept';
      case 'overdue':
        return 'Achterstallig';
      default:
        return status;
    }
  };

  const selectedFolderData = folderStructure.find(f => f.id === selectedFolder);
  const itemsToShow = selectedFolderData?.items || [];

  const filteredItems = itemsToShow.filter(item =>
    searchTerm === '' || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Folder Structure */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Factuur Categorieën</CardTitle>
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

      {/* Invoice List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedFolderData?.name || 'Facturen'}
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nieuwe Factuur
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek facturen..."
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
                          {getStatusLabel(item.status)}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm font-semibold">
                          <Euro className="h-4 w-4" />
                          <span>{item.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-muted-foreground space-x-4">
                      <span className="font-medium">{item.client}</span>
                      <span>•</span>
                      <span>Datum: {item.invoiceDate.toLocaleDateString('nl-NL')}</span>
                      <span>•</span>
                      <span>Vervaldatum: {item.dueDate.toLocaleDateString('nl-NL')}</span>
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
                  ? 'Geen facturen gevonden die voldoen aan de zoekcriteria.'
                  : 'Deze categorie heeft nog geen facturen.'
                : 'Selecteer een categorie om facturen te bekijken.'
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
