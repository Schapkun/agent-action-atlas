import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  UserPlus, 
  Folder, 
  User, 
  Phone, 
  Mail,
  ChevronRight,
  ChevronDown,
  Building
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const ContactManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [selectedFolder, setSelectedFolder] = useState<string | null>('1');
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.id) return;

      try {
        // Check if user is account owner
        if (user.email === 'info@schapkun.com') {
          setUserRole('owner');
          return;
        }

        // Get user's role from their organization memberships
        const { data: memberships } = await supabase
          .from('organization_members')
          .select('role')
          .eq('user_id', user.id)
          .limit(1);

        if (memberships && memberships.length > 0) {
          setUserRole(memberships[0].role);
        } else {
          setUserRole('lid'); // Default role if no membership found
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('lid'); // Default to lid on error
      }
    };

    fetchUserRole();
  }, [user]);

  const folderStructure = [
    {
      id: '1',
      name: 'Cliënten',
      icon: 'users',
      items: [
        {
          id: 'c1',
          name: 'ABC Holding B.V.',
          type: 'company',
          email: 'info@abcholding.nl',
          phone: '+31 20 123 4567',
          status: 'active',
          activeDossiers: 2,
          lastContact: new Date('2024-01-15')
        },
        {
          id: 'c2',
          name: 'Jan Janssen',
          type: 'person',
          email: 'jan.janssen@email.com',
          phone: '+31 6 123 456 78',
          status: 'active',
          activeDossiers: 1,
          lastContact: new Date('2024-01-14')
        }
      ]
    },
    {
      id: '2',
      name: 'Externe Advocaten',
      icon: 'briefcase',
      items: [
        {
          id: 'c3',
          name: 'Advocatenkantoor XYZ',
          type: 'company',
          email: 'contact@xyz-advocaten.nl',
          phone: '+31 20 987 6543',
          status: 'active',
          activeDossiers: 0,
          lastContact: new Date('2024-01-10')
        }
      ]
    },
    {
      id: '3',
      name: 'Rechtbanken & Instanties',
      icon: 'gavel',
      items: [
        {
          id: 'c4',
          name: 'Rechtbank Amsterdam',
          type: 'institution',
          email: 'griffie@rechtbank-amsterdam.nl',
          phone: '+31 20 541 5415',
          status: 'active',
          activeDossiers: 1,
          lastContact: new Date('2024-01-12')
        }
      ]
    },
    {
      id: '4',
      name: 'Leveranciers',
      icon: 'truck',
      items: [
        {
          id: 'c5',
          name: 'Deurwaarder Peters',
          type: 'company',
          email: 'info@deurwaarder-peters.nl',
          phone: '+31 30 123 4567',
          status: 'active',
          activeDossiers: 1,
          lastContact: new Date('2024-01-08')
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
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actief';
      case 'inactive':
        return 'Inactief';
      case 'prospect':
        return 'Prospect';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return Building;
      case 'person':
        return User;
      case 'institution':
        return Building;
      default:
        return User;
    }
  };

  const selectedFolderData = folderStructure.find(f => f.id === selectedFolder);
  const itemsToShow = selectedFolderData?.items || [];

  const filteredItems = itemsToShow.filter(item =>
    searchTerm === '' || 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone?.includes(searchTerm)
  );

  // Check if user can invite others (not 'lid' role)
  const canInviteUsers = userRole !== 'lid';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Folder Structure */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Contact Categorieën</CardTitle>
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

      {/* Contact List */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {selectedFolderData?.name || 'Contacten'}
            </CardTitle>
            {canInviteUsers && (
              <Button variant="outline" size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Nieuw Contact
              </Button>
            )}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Zoek contacten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <div className="px-6 pb-6">
          {filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map((item) => {
                const IconComponent = getTypeIcon(item.type);
                return (
                  <div key={item.id} className="flex items-center space-x-4 py-3 px-4 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-shrink-0">
                      <IconComponent className="h-8 w-8 text-muted-foreground" />
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
                          {item.activeDossiers > 0 && (
                            <Badge variant="outline">
                              {item.activeDossiers} dossier{item.activeDossiers !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs text-muted-foreground space-x-4">
                        <div className="flex items-center space-x-1">
                          <Mail className="h-3 w-3" />
                          <span>{item.email}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-3 w-3" />
                          <span>{item.phone}</span>
                        </div>
                        <span>•</span>
                        <span>Laatst contact: {item.lastContact.toLocaleDateString('nl-NL')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <User className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedFolderData 
                ? filteredItems.length === 0 && searchTerm 
                  ? 'Geen contacten gevonden die voldoen aan de zoekcriteria.'
                  : 'Deze categorie heeft nog geen contacten.'
                : 'Selecteer een categorie om contacten te bekijken.'
              }
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
