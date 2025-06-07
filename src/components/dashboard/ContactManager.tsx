
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ContactCard } from './ContactCard';
import { ContactFolderSidebar } from './ContactFolderSidebar';
import { folderStructure } from '@/data/contactData';

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
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.phone?.includes(searchTerm)
  );

  // Check if user can invite others (not 'lid' role)
  const canInviteUsers = userRole !== 'lid';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <ContactFolderSidebar
        folderStructure={folderStructure}
        expandedFolders={expandedFolders}
        selectedFolder={selectedFolder}
        onToggleFolder={toggleFolder}
        onSelectFolder={setSelectedFolder}
      />

      {/* Contact List */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
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

        <div className="px-6 pt-3 pb-6">
          {filteredItems.length > 0 ? (
            <div className="space-y-2">
              {filteredItems.map((item) => (
                <ContactCard key={item.id} item={item} />
              ))}
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
