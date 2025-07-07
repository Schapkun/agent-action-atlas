
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkspaceSelector } from './WorkspaceSelector';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  PhoneCall, 
  Folder, 
  Play, 
  Download, 
  FileText,
  ChevronRight,
  ChevronDown,
  Clock,
  Plus
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

export const PhoneCallManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);
  const { selectedOrganization, selectedWorkspace, getFilteredWorkspaces } = useOrganization();
  const { toast } = useToast();

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

  const handleCreateCall = () => {
    if (!selectedOrganization && !selectedWorkspace) {
      toast({
        title: "Geen selectie",
        description: "Selecteer eerst een organisatie of werkruimte om een gesprek toe te voegen.",
        variant: "destructive",
      });
      return;
    }

    // If only organization is selected, show workspace selector
    if (selectedOrganization && !selectedWorkspace) {
      const workspaces = getFilteredWorkspaces();
      if (workspaces.length > 1) {
        setShowWorkspaceSelector(true);
        return;
      } else if (workspaces.length === 1) {
        // Auto-select the only workspace
        createCallInWorkspace(workspaces[0].id);
        return;
      }
    }

    // If workspace is selected, create directly
    if (selectedWorkspace) {
      createCallInWorkspace(selectedWorkspace.id);
    }
  };

  const createCallInWorkspace = (workspaceId: string) => {
    console.log('Creating phone call record in workspace:', workspaceId);
    console.log('Organization:', selectedOrganization?.name);
    
    toast({
      title: "Nieuw gesprek",
      description: "Gesprek wordt toegevoegd aan de geselecteerde werkruimte...",
    });
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

  const filteredItems = itemsToShow.filter(item =>
    searchTerm === '' || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.dossier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Zoek gesprekken..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={handleCreateCall}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Gesprek
              </Button>
            </div>
          </div>

          {!selectedOrganization && !selectedWorkspace && (
            <div className="text-sm text-muted-foreground">
              Selecteer een organisatie of werkruimte om gesprekken te bekijken
            </div>
          )}

          {(selectedOrganization || selectedWorkspace) && (
            <div className="text-sm text-gray-600">
              Context: {getContextInfo()}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Folder Structure */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Gesprek Categorieën</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedOrganization && !selectedWorkspace ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Selecteer een organisatie of werkruimte</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Geen categorieën gevonden</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call List */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Telefoongesprekken</CardTitle>
            </CardHeader>

            <CardContent>
              {!selectedOrganization && !selectedWorkspace ? (
                <div className="text-center py-8 text-muted-foreground">
                  <PhoneCall className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecteer een organisatie of werkruimte om gesprekken te bekijken</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PhoneCall className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Geen gesprekken gevonden voor de geselecteerde context</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <WorkspaceSelector
        isOpen={showWorkspaceSelector}
        onClose={() => setShowWorkspaceSelector(false)}
        onSelectWorkspace={createCallInWorkspace}
        title="Selecteer werkruimte voor nieuw gesprek"
        description="Kies in welke werkruimte het gesprek moet worden toegevoegd:"
      />
    </>
  );
};
