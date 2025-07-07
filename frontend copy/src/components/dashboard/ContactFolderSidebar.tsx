
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder, ChevronRight, ChevronDown } from 'lucide-react';

interface FolderStructure {
  id: string;
  name: string;
  icon: string;
  items: any[];
}

interface ContactFolderSidebarProps {
  folderStructure: FolderStructure[];
  expandedFolders: Set<string>;
  selectedFolder: string | null;
  onToggleFolder: (folderId: string) => void;
  onSelectFolder: (folderId: string) => void;
}

export const ContactFolderSidebar = ({
  folderStructure,
  expandedFolders,
  selectedFolder,
  onToggleFolder,
  onSelectFolder
}: ContactFolderSidebarProps) => {
  return (
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
                  onSelectFolder(folder.id);
                  if (!expandedFolders.has(folder.id)) {
                    onToggleFolder(folder.id);
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
  );
};
