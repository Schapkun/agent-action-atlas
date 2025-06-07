
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Archive, 
  Folder, 
  FileText, 
  Download, 
  Eye,
  ChevronRight,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

export const ClosedDossiers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const { selectedOrganization, selectedWorkspace } = useOrganization();

  // Empty folder structure - no mock data
  const folderStructure: any[] = [];

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const selectedFolderData = folderStructure.find(f => f.id === selectedFolder);
  const itemsToShow = selectedFolderData?.items || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Folder Structure */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Gesloten Categorieën</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedOrganization && !selectedWorkspace ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Selecteer een organisatie of werkruimte</p>
            </div>
          ) : folderStructure.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Geen gesloten categorieën gevonden</p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Dossier List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedFolderData?.name || 'Gesloten Dossiers'}
            </CardTitle>
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              Archiveer
            </Button>
          </div>

          {!selectedOrganization && !selectedWorkspace && (
            <div className="text-sm text-muted-foreground">
              Selecteer een organisatie of werkruimte om gesloten dossiers te bekijken
            </div>
          )}

          {(selectedOrganization || selectedWorkspace) && (
            <div className="text-sm text-muted-foreground">
              Data voor: {getContextInfo()}
            </div>
          )}
          
          {(selectedOrganization || selectedWorkspace) && (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Zoek gesloten dossiers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </CardHeader>

        <CardContent>
          {!selectedOrganization && !selectedWorkspace ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecteer een organisatie of werkruimte om gesloten dossiers te bekijken</p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen gesloten dossiers gevonden voor de geselecteerde context</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
