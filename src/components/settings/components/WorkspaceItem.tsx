
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { UserCheckboxList } from './UserCheckboxList';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  organization_id: string;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  hasOrgAccess?: boolean;
  workspaceAccess?: { [workspaceId: string]: boolean };
}

interface WorkspaceItemProps {
  workspace: Workspace;
  users: User[];
  onEdit: (workspaceId: string, newName: string) => Promise<void>;
  onDelete: (workspaceId: string, workspaceName: string) => Promise<void>;
  onUserToggle: (workspaceId: string, userId: string, hasAccess: boolean) => void;
}

export const WorkspaceItem = ({ 
  workspace, 
  users, 
  onEdit, 
  onDelete, 
  onUserToggle 
}: WorkspaceItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const handleEdit = () => {
    setIsEditing(true);
    setEditName(workspace.name);
  };

  const handleSave = async () => {
    if (!editName.trim()) return;
    await onEdit(workspace.id, editName.trim());
    setIsEditing(false);
    setEditName('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditName('');
  };

  return (
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
            <span className="font-medium">{workspace.name}</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(workspace.id, workspace.name)}
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
        type="workspace"
        workspaceId={workspace.id}
        onToggle={(userId, hasAccess) => onUserToggle(workspace.id, userId, hasAccess)}
      />
    </div>
  );
};
