
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
  Calendar,
  User,
  Plus
} from 'lucide-react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { useDossiers } from '@/hooks/useDossiers';
import { CreateDossierDialog } from '@/components/dossiers/CreateDossierDialog';

export const ActiveDossiers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { selectedOrganization, selectedWorkspace } = useOrganization();
  const { dossiers, loading } = useDossiers();

  const categories = [
    { id: 'all', name: 'Alle Categorieën', count: dossiers.length },
    { id: 'algemeen', name: 'Algemeen', count: dossiers.filter(d => d.category === 'algemeen').length },
    { id: 'juridisch', name: 'Juridisch', count: dossiers.filter(d => d.category === 'juridisch').length },
    { id: 'belasting', name: 'Belasting', count: dossiers.filter(d => d.category === 'belasting').length },
    { id: 'contract', name: 'Contract', count: dossiers.filter(d => d.category === 'contract').length },
    { id: 'compliance', name: 'Compliance', count: dossiers.filter(d => d.category === 'compliance').length },
    { id: 'onderzoek', name: 'Onderzoek', count: dossiers.filter(d => d.category === 'onderzoek').length }
  ];

  const getContextInfo = () => {
    if (selectedWorkspace) {
      return `Werkruimte: ${selectedWorkspace.name}`;
    } else if (selectedOrganization) {
      return `Organisatie: ${selectedOrganization.name}`;
    }
    return 'Geen selectie';
  };

  const filteredDossiers = dossiers.filter(dossier => {
    const matchesSearch = dossier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dossier.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dossier.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || dossier.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="text-green-600">Actief</Badge>;
      case 'on_hold':
        return <Badge variant="outline" className="text-yellow-600">On Hold</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-blue-600">Afgerond</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Categories Sidebar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Dossier Categorieën</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedOrganization && !selectedWorkspace ? (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Selecteer een organisatie of werkruimte</p>
            </div>
          ) : (
            <div className="space-y-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "secondary" : "ghost"}
                  className="w-full justify-start p-2 h-auto"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <Folder className="h-4 w-4" />
                    <span className="text-sm truncate flex-1 text-left">{category.name}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {category.count}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dossiers List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Actieve Dossiers
              {selectedCategory !== 'all' && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  - {categories.find(c => c.id === selectedCategory)?.name}
                </span>
              )}
            </CardTitle>
            
            <CreateDossierDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nieuw Dossier
              </Button>
            </CreateDossierDialog>
          </div>

          {!selectedOrganization && !selectedWorkspace && (
            <div className="text-sm text-muted-foreground">
              Selecteer een organisatie of werkruimte om dossiers te bekijken
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
                placeholder="Zoek dossiers..."
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
              <p>Selecteer een organisatie of werkruimte om dossiers te bekijken</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">Dossiers laden...</div>
          ) : filteredDossiers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Geen dossiers gevonden voor de geselecteerde criteria</p>
              <CreateDossierDialog>
                <Button className="mt-4" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Maak je eerste dossier aan
                </Button>
              </CreateDossierDialog>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDossiers.map((dossier) => (
                <div key={dossier.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{dossier.name}</h3>
                        {getStatusBadge(dossier.status)}
                        <Badge variant="outline" className="text-xs">
                          {dossier.category}
                        </Badge>
                      </div>
                      
                      {dossier.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {dossier.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {dossier.client?.name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {dossier.client.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Aangemaakt: {new Date(dossier.created_at).toLocaleDateString('nl-NL')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        Bekijken
                      </Button>
                      
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
