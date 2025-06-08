import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { UserCheckboxList } from './UserCheckboxList';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  hasOrgAccess?: boolean;
  workspaceAccess?: { [workspaceId: string]: boolean };
}

interface OrganizationTabProps {
  organization: Organization;
  users: User[];
  loading: boolean;
  onEditOrganization: (newName: string) => Promise<void>;
  onDeleteOrganization: () => Promise<void>;
  onUserToggle: (userId: string, hasAccess: boolean) => void;
}

export const OrganizationTab = ({
  organization,
  users,
  loading,
  onEditOrganization,
  onDeleteOrganization,
  onUserToggle
}: OrganizationTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(organization.name);
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    await onEditOrganization(editName.trim());
    setIsEditing(false);
    setEditName('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName('');
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="flex-shrink-0">
        <div className="flex items-center justify-end h-10">
          {/* Empty div to match workspace button space */}
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full border rounded-md bg-muted/10">
          <div className="p-3">
            {loading ? (
              <div className="text-sm text-muted-foreground">Laden...</div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-lg bg-background/50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium">{organization.name}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={onDeleteOrganization}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleEdit}
                            className="text-black hover:text-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <UserCheckboxList
                    users={users}
                    type="organization"
                    onToggle={onUserToggle}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
