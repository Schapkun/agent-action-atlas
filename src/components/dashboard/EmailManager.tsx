import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WorkspaceSelector } from './WorkspaceSelector';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Mail, 
  Folder, 
  Eye, 
  Download, 
  Reply,
  ChevronRight,
  ChevronDown,
  Paperclip,
  Plus
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';

export const EmailManager = () => {
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

  const handleCreateEmail = () => {
    if (!selectedOrganization && !selectedWorkspace) {
      toast({
        title: "Geen selectie",
        description: "Selecteer eerst een organisatie of werkruimte om een e-mail te maken.",
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
        createEmailInWorkspace(workspaces[0].id);
        return;
      }
    }

    // If workspace is selected, create directly
    if (selectedWorkspace) {
      createEmailInWorkspace(selectedWorkspace.id);
    }
  };

  const createEmailInWorkspace = (workspaceId: string) => {
    console.log('Creating email in workspace:', workspaceId);
    console.log('Organization:', selectedOrganization?.name);
    
    toast({
      title: "Nieuwe e-mail",
      description: "E-mail wordt aangemaakt in de geselecteerde werkruimte...",
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
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.from && item.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.to && item.to.toLowerCase().includes(searchTerm.toLowerCase())) ||
    item.dossier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Folder Structure */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">E-mail Categorieën</CardTitle>
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

        {/* Email List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">E-mails</CardTitle>
              <Button variant="outline" size="sm" onClick={handleCreateEmail}>
                <Plus className="h-4 w-4 mr-2" />
                Nieuwe E-mail
              </Button>
            </div>

            {!selectedOrganization && !selectedWorkspace && (
              <div className="text-sm text-muted-foreground">
                Selecteer een organisatie of werkruimte om e-mails te bekijken
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
                    placeholder="Zoek e-mails..."
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
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Selecteer een organisatie of werkruimte om e-mails te bekijken</p>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Geen e-mails gevonden voor de geselecteerde context</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WorkspaceSelector
        isOpen={showWorkspaceSelector}
        onClose={() => setShowWorkspaceSelector(false)}
        onSelectWorkspace={createEmailInWorkspace}
        title="Selecteer werkruimte voor nieuwe e-mail"
        description="Kies in welke werkruimte de e-mail moet worden aangemaakt:"
      />
    </>
  );
};
