import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkspaceSelector } from './WorkspaceSelector';
import { useToast } from '@/hooks/use-toast';
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
import { useOrganization } from '@/contexts/OrganizationContext';

export const InvoiceManager = () => {
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

  const handleCreateInvoice = () => {
    if (!selectedOrganization && !selectedWorkspace) {
      toast({
        title: "Geen selectie",
        description: "Selecteer eerst een organisatie of werkruimte om een factuur te maken.",
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
        createInvoiceInWorkspace(workspaces[0].id);
        return;
      }
    }

    // If workspace is selected, create directly
    if (selectedWorkspace) {
      createInvoiceInWorkspace(selectedWorkspace.id);
    }
  };

  const createInvoiceInWorkspace = (workspaceId: string) => {
    console.log('Creating invoice in workspace:', workspaceId);
    console.log('Organization:', selectedOrganization?.name);
    
    toast({
      title: "Nieuwe factuur",
      description: "Factuur wordt aangemaakt in de geselecteerde werkruimte...",
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
    item.client?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder Structure */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Factuur Categorieën</CardTitle>
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

        {/* Invoice List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Facturen</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCreateInvoice}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe Factuur
              </Button>
            </div>

            {!selectedOrganization && !selectedWorkspace && (
              <div className="text-sm text-muted-foreground">
                Selecteer een organisatie of werkruimte om facturen te bekijken
              </div>
            )}

            {(selectedOrganization || selectedWorkspace) && (
              <>
                <div className="text-sm text-muted-foreground">
                  Data voor: {getContextInfo()}
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
              </>
            )}
          </CardHeader>

          <CardContent>
            {!selectedOrganization && !selectedWorkspace ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecteer een organisatie of werkruimte om facturen te bekijken</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen facturen gevonden voor de geselecteerde context</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WorkspaceSelector
        isOpen={showWorkspaceSelector}
        onClose={() => setShowWorkspaceSelector(false)}
        onSelectWorkspace={createInvoiceInWorkspace}
        title="Selecteer werkruimte voor nieuwe factuur"
        description="Kies in welke werkruimte de factuur moet worden aangemaakt:"
      />
    </>
  );
};
